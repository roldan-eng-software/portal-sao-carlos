// Aplica as migrações SQL de db/migrations em ordem, uma única vez cada.
// Uso: npm run db:migrate (lê DATABASE_URL do ambiente ou de .env.local).
import postgres from 'postgres';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const url = process.env.DATABASE_URL;

if (!url) {
  console.error('DATABASE_URL não configurada. Nada foi alterado.');
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((row) => row.name));
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`já aplicada: ${file}`);
      continue;
    }

    const content = await readFile(path.join(migrationsDir, file), 'utf-8');
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
    });
    console.log(`aplicada: ${file}`);
  }
} finally {
  await sql.end();
}
