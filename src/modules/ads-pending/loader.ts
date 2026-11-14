import { sql } from '@/lib/neon';
import type { AdPublished, AdSubmission } from './types';

type DbRow = Record<string, unknown>;

const text = (value: unknown): string | undefined => (value == null ? undefined : String(value));
const iso = (value: unknown): string => new Date(value as string | Date).toISOString();

function rowToAd(row: DbRow): AdSubmission {
  return {
    id: String(row.id),
    kind: row.kind as AdSubmission['kind'],
    businessName: String(row.business_name),
    category: String(row.category),
    description: String(row.description),
    neighborhood: String(row.neighborhood),
    phone: text(row.phone),
    whatsapp: text(row.whatsapp),
    url: text(row.url),
    hours: text(row.hours),
    cnpj: text(row.cnpj),
    contactEmail: text(row.contact_email),
    status: row.status as AdSubmission['status'],
    submittedAt: iso(row.submitted_at),
    reviewedAt: row.reviewed_at ? iso(row.reviewed_at) : undefined,
    rejectionReason: text(row.rejection_reason),
    sourceIp: text(row.source_ip),
  };
}

export function publishedRowToAd(row: DbRow): AdPublished {
  return {
    id: String(row.id),
    kind: 'anuncio-gratuito',
    businessName: String(row.business_name),
    category: String(row.category),
    description: String(row.description),
    neighborhood: String(row.neighborhood),
    phone: text(row.phone),
    whatsapp: text(row.whatsapp),
    url: text(row.url),
    hours: text(row.hours),
    cnpj: text(row.cnpj),
    status: row.status as AdPublished['status'],
    approvedAt: iso(row.approved_at),
    suspendedAt: row.suspended_at ? iso(row.suspended_at) : undefined,
    updatedAt: iso(row.updated_at),
  };
}

export class ModerationError extends Error {}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string })?.code === '23505';
}

/**
 * Carrega anúncios pendentes do banco Neon.
 */
export async function loadPendingAds(): Promise<AdSubmission[]> {
  const rows = await sql`
    SELECT * FROM ads_pending
    WHERE status = 'pendente'
    ORDER BY submitted_at DESC
  `;
  return rows.map(rowToAd);
}

/**
 * Salva um novo anúncio pendente no banco Neon.
 */
export async function savePendingAd(ad: AdSubmission): Promise<AdSubmission> {
  const [row] = await sql`
    INSERT INTO ads_pending (
      id, kind, business_name, category, description, neighborhood,
      phone, whatsapp, url, hours, cnpj, contact_email,
      status, submitted_at, source_ip
    ) VALUES (
      ${ad.id}, ${ad.kind ?? 'anuncio-gratuito'}, ${ad.businessName}, ${ad.category}, ${ad.description}, ${ad.neighborhood},
      ${ad.phone ?? null}, ${ad.whatsapp ?? null}, ${ad.url ?? null}, ${ad.hours ?? null}, ${ad.cnpj ?? null}, ${ad.contactEmail ?? null},
      ${ad.status}, ${ad.submittedAt}, ${ad.sourceIp ?? null}
    )
    RETURNING *
  `;
  return rowToAd(row);
}

/**
 * Remove anúncios pendentes expirados (>30 dias, status pendente).
 * Conforme LGPD: consentimento para dados de formulário pendente = 30 dias.
 */
export async function cleanupExpiredPending(): Promise<number> {
  const result = await sql`
    DELETE FROM ads_pending
    WHERE status = 'pendente'
      AND submitted_at < NOW() - INTERVAL '30 days'
  `;
  return result.count;
}

/**
 * Verifica se o CNPJ já está em uso por um anúncio pendente ou publicado.
 */
export async function checkCNPJInUse(cnpj: string): Promise<boolean> {
  if (!cnpj) return false;
  const rows = await sql`
    SELECT 1 FROM ads_pending WHERE cnpj = ${cnpj} AND status = 'pendente'
    UNION ALL
    SELECT 1 FROM ads_published WHERE cnpj = ${cnpj}
    LIMIT 1
  `;
  return rows.length > 0;
}

/**
 * Aprova um pendente em uma única transação: cria o publicado, remove da fila
 * e registra no log. Se qualquer passo falhar, nada é gravado.
 */
export async function approveSubmission(submissionId: string): Promise<AdPublished> {
  return sql.begin(async (tx) => {
    const [row] = await tx`SELECT * FROM ads_pending WHERE id = ${submissionId} FOR UPDATE`;
    if (!row) throw new ModerationError('Anúncio pendente não encontrado.');
    if (row.status !== 'pendente') throw new ModerationError('Apenas anúncios pendentes podem ser aprovados.');

    let published;
    try {
      [published] = await tx`
        INSERT INTO ads_published (
          id, kind, business_name, category, description, neighborhood,
          phone, whatsapp, url, hours, cnpj, contact_email, status, approved_at
        ) VALUES (
          ${row.id}, ${row.kind}, ${row.business_name}, ${row.category}, ${row.description}, ${row.neighborhood},
          ${row.phone}, ${row.whatsapp}, ${row.url}, ${row.hours}, ${row.cnpj}, ${row.contact_email}, 'publicado', now()
        )
        RETURNING *
      `;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ModerationError('Já existe anúncio publicado para este CNPJ.');
      }
      throw error;
    }

    await tx`DELETE FROM ads_pending WHERE id = ${submissionId}`;
    await tx`INSERT INTO ads_moderation_log (action, submission_id, ad_id) VALUES ('aprovar', ${submissionId}, ${submissionId})`;
    return publishedRowToAd(published);
  });
}

/**
 * Recusa um pendente: remove da fila e registra o motivo no log, na mesma transação.
 * Retorna o pendente original para montar a notificação.
 */
export async function rejectSubmission(submissionId: string, reason: string): Promise<AdSubmission> {
  const trimmed = reason.trim();
  if (!trimmed) throw new ModerationError('Motivo da recusa é obrigatório.');

  return sql.begin(async (tx) => {
    const [row] = await tx`SELECT * FROM ads_pending WHERE id = ${submissionId} FOR UPDATE`;
    if (!row) throw new ModerationError('Anúncio pendente não encontrado.');
    if (row.status !== 'pendente') throw new ModerationError('Apenas anúncios pendentes podem ser recusados.');

    await tx`DELETE FROM ads_pending WHERE id = ${submissionId}`;
    await tx`
      INSERT INTO ads_moderation_log (action, submission_id, ad_id, reason)
      VALUES ('recusar', ${submissionId}, ${submissionId}, ${trimmed})
    `;
    return rowToAd(row);
  });
}
