// Migra os anúncios publicados de src/content/ads.json para ads_published (uma vez).
// Idempotente: anúncios já existentes são ignorados (ON CONFLICT DO NOTHING).
// Uso: npm run db:seed:ads -- --dry-run   (só relatório)
//      npm run db:seed:ads                (grava)
import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dryRun = process.argv.includes('--dry-run');
const seedPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'ads.json');
const KINDS = ['anuncio-gratuito', 'anuncio-patrocinado'];
const STATUSES = ['publicado', 'suspenso'];

const raw = JSON.parse(await readFile(seedPath, 'utf-8'));
const items = Array.isArray(raw.items) ? raw.items : [];

const isValid = (ad) =>
  typeof ad.id === 'string' &&
  ad.id.length > 0 &&
  KINDS.includes(ad.kind) &&
  STATUSES.includes(ad.status) &&
  ['businessName', 'category', 'description', 'neighborhood'].every(
    (field) => typeof ad[field] === 'string' && ad[field].trim().length > 0,
  ) &&
  [ad.phone, ad.whatsapp, ad.url].some((contact) => typeof contact === 'string' && contact.trim().length > 0);

const valid = items.filter(isValid);
const invalid = items.filter((ad) => !isValid(ad));
console.log(`Seed: ${items.length} itens, ${valid.length} válidos, ${invalid.length} ignorados (sem status/campos/contato válidos).`);
for (const ad of invalid) console.log(`  ignorado: ${ad.id ?? '(sem id)'}`);

if (dryRun) {
  console.log('Dry-run: nada foi gravado.');
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não configurada. Nada foi gravado.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

try {
  let inserted = 0;
  await sql.begin(async (tx) => {
    for (const ad of valid) {
      const rows = await tx`
        INSERT INTO ads_published (
          id, kind, business_name, category, description, neighborhood,
          phone, whatsapp, url, hours, image_url, status, approved_at, expires_at
        ) VALUES (
          ${ad.id}, ${ad.kind}, ${ad.businessName}, ${ad.category}, ${ad.description}, ${ad.neighborhood},
          ${ad.phone ?? null}, ${ad.whatsapp ?? null}, ${ad.url ?? null}, ${ad.hours ?? null}, ${ad.imageUrl ?? null},
          ${ad.status}, COALESCE(${ad.publishedAt ?? null}::timestamptz, now()), ${ad.expiresAt ?? null}::date
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `;
      if (rows.length > 0) {
        inserted++;
        await tx`INSERT INTO ads_moderation_log (action, ad_id, reason) VALUES ('migrar', ${ad.id}, 'seed src/content/ads.json')`;
      }
    }
  });
  console.log(`Migração concluída: ${inserted} gravados, ${valid.length - inserted} já existiam.`);
} finally {
  await sql.end();
}
