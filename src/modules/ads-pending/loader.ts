import { sql } from '@/lib/neon';
import type { AdSubmission } from './types';

function rowToAd(row: any): AdSubmission {
  return {
    id: row.id,
    businessName: row.business_name,
    category: row.category,
    description: row.description,
    neighborhood: row.neighborhood,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    url: row.url ?? undefined,
    hours: row.hours ?? undefined,
    cnpj: row.cnpj ?? undefined,
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    sourceIp: row.source_ip ?? undefined,
  };
}

/**
 * Carrega anúncios pendentes do banco Neon.
 */
export async function loadPendingAds(): Promise<AdSubmission[]> {
  const rows = await sql`
    SELECT * FROM ads_pending
    ORDER BY submitted_at DESC
  `;
  return rows.map(rowToAd);
}

/**
 * Salva um novo anúncio pendente no banco Neon.
 * Retorna o anúncio criado (com ID gerado pelo banco).
 */
export async function savePendingAd(ad: AdSubmission): Promise<AdSubmission> {
  const [row] = await sql`
    INSERT INTO ads_pending (
      id, business_name, category, description, neighborhood,
      phone, whatsapp, url, hours, cnpj,
      status, submitted_at, reviewed_at, rejection_reason, source_ip
    ) VALUES (
      ${ad.id}, ${ad.businessName}, ${ad.category}, ${ad.description}, ${ad.neighborhood},
      ${ad.phone ?? null}, ${ad.whatsapp ?? null}, ${ad.url ?? null}, ${ad.hours ?? null}, ${ad.cnpj ?? null},
      ${ad.status}, ${ad.submittedAt}, ${ad.reviewedAt ?? null}, ${ad.rejectionReason ?? null}, ${ad.sourceIp ?? null}
    )
    RETURNING *
  `;
  return rowToAd(row);
}

/**
 * Atualiza um anúncio pendente existente (usado para aprovar/recusar/editar).
 */
export async function updatePendingAd(ad: AdSubmission): Promise<AdSubmission> {
  const [row] = await sql`
    UPDATE ads_pending SET
      business_name = ${ad.businessName},
      category = ${ad.category},
      description = ${ad.description},
      neighborhood = ${ad.neighborhood},
      phone = ${ad.phone ?? null},
      whatsapp = ${ad.whatsapp ?? null},
      url = ${ad.url ?? null},
      hours = ${ad.hours ?? null},
      cnpj = ${ad.cnpj ?? null},
      status = ${ad.status},
      reviewed_at = ${ad.reviewedAt ?? null},
      rejection_reason = ${ad.rejectionReason ?? null}
    WHERE id = ${ad.id}
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
 * Verifica se existe anúncio pendente ou publicado para o CNPJ.
 * Nota: publicado é verificado via módulo ads/loader (JSON), mas aqui só olhamos pendentes.
 */
export async function checkPendingCNPJDuplicate(cnpj: string): Promise<boolean> {
  if (!cnpj) return false;
  const rows = await sql`
    SELECT 1 FROM ads_pending
    WHERE cnpj = ${cnpj}
      AND status = 'pendente'
    LIMIT 1
  `;
  return rows.length > 0;
}
