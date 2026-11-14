import { sql } from '@/lib/neon';
import { isSafeHttpUrl, sanitizeToLength } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

export interface Ad {
  id: string;
  kind: 'anuncio-gratuito' | 'anuncio-patrocinado';
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
  imageUrl?: string | null;
  status: 'rascunho' | 'publicado' | 'suspenso' | 'removido';
  publishedAt: string | null;
  expiresAt: string | null;
  cnpj?: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isText(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function isOptionalText(value: unknown, max: number): boolean {
  return value === null || (typeof value === 'string' && value.length <= max);
}

export function isValidAd(value: unknown): value is Ad {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;

  const kindOk = item.kind === 'anuncio-gratuito' || item.kind === 'anuncio-patrocinado';
  const statusOk =
    item.status === 'rascunho' ||
    item.status === 'publicado' ||
    item.status === 'suspenso' ||
    item.status === 'removido';
  const contacts =
    [item.phone, item.whatsapp, item.url].filter(
      (contact) => typeof contact === 'string' && contact.trim().length > 0,
    ).length >= 1;
  const publishedAtOk =
    (item.status !== 'publicado' && item.publishedAt === null) ||
    (typeof item.publishedAt === 'string' && DATE_RE.test(item.publishedAt));

  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    kindOk &&
    isText(item.businessName, 100) &&
    isText(item.category, 60) &&
    isText(item.description, 300) &&
    isText(item.neighborhood, 80) &&
    isOptionalText(item.phone, 30) &&
    isOptionalText(item.whatsapp, 30) &&
    (item.url === null || isSafeHttpUrl(item.url)) &&
    (item.imageUrl === undefined ||
      item.imageUrl === null ||
      isSafeHttpUrl(item.imageUrl)) &&
    isOptionalText(item.hours, 120) &&
    statusOk &&
    publishedAtOk &&
    (item.expiresAt === null ||
      (typeof item.expiresAt === 'string' && DATE_RE.test(item.expiresAt))) &&
    contacts
  );
}

export function selectPublishedAds(items: unknown[], today: string): Ad[] {
  return items
    .filter(isValidAd)
    .filter((ad) => ad.status === 'publicado')
    .filter((ad) => ad.expiresAt === null || ad.expiresAt >= today)
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'anuncio-patrocinado' ? -1 : 1;
      return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
    });
}

/**
 * Carrega os anúncios publicados do banco Neon (ads_published).
 * O seed src/content/ads.json só serve à migração (db/seed-ads-published.mjs).
 */
export async function loadAds(): Promise<ModuleResult<Ad[]>> {
  const SOURCE_NAME = 'Anúncios do portal';
  try {
    const rows = await sql`
      SELECT * FROM ads_published
      WHERE status = 'publicado'
    `;
    const allAds: Ad[] = rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      businessName: row.business_name,
      category: row.category,
      description: row.description,
      neighborhood: row.neighborhood,
      phone: row.phone,
      whatsapp: row.whatsapp,
      url: row.url,
      hours: row.hours,
      imageUrl: row.image_url,
      status: row.status,
      publishedAt: row.approved_at ? new Date(row.approved_at).toISOString().slice(0, 10) : null,
      expiresAt: row.expires_at ? new Date(row.expires_at).toISOString().slice(0, 10) : null,
      cnpj: row.cnpj,
    }));

    const today = new Date().toISOString().slice(0, 10);
    const published = selectPublishedAds(allAds, today);
    const lastPublished = published[0]?.publishedAt ?? null;

    return okResult(
      published,
      SOURCE_NAME,
      lastPublished ? new Date(`${lastPublished}T12:00:00Z`) : new Date(),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'content_load_failure',
        file: 'ads-loader',
        error: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
    return errorResult(SOURCE_NAME);
  }
}

export { sanitizeToLength };

