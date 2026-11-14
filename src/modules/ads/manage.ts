import { sql } from '@/lib/neon';
import { sanitizePhone, sanitizeText, sanitizeUrl } from '@/lib/sanitize';
import { ModerationError, publishedRowToAd } from '@/modules/ads-pending/loader';
import type { AdPublished, ManageActionData } from '@/modules/ads-pending/types';

type EditableValues = Partial<{
  business_name: string;
  category: string;
  description: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
}>;

type ManageResult<T = object> = ({ success: true } & T) | { success: false; errors: string[] };

const REQUIRED_TEXT = {
  businessName: { column: 'business_name', max: 120, label: 'Nome do comércio' },
  category: { column: 'category', max: 40, label: 'Categoria' },
  description: { column: 'description', max: 500, label: 'Descrição' },
  neighborhood: { column: 'neighborhood', max: 80, label: 'Bairro' },
} as const;

/**
 * Sanitiza somente os campos editáveis de um anúncio publicado.
 * Campos ausentes não são alterados; campos obrigatórios não podem ficar vazios.
 */
export function sanitizeAdEdit(data: ManageActionData | undefined): { values: EditableValues; errors: string[] } {
  const values: EditableValues = {};
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(REQUIRED_TEXT)) {
    const raw = data?.[key as keyof ManageActionData];
    if (raw === undefined) continue;
    const clean = sanitizeText(raw, rule.max);
    if (!clean) {
      errors.push(`${rule.label} é obrigatório.`);
    } else {
      values[rule.column] = clean;
    }
  }

  if (data?.phone !== undefined) values.phone = data.phone ? sanitizePhone(data.phone) || null : null;
  if (data?.whatsapp !== undefined) values.whatsapp = data.whatsapp ? sanitizePhone(data.whatsapp) || null : null;
  if (data?.url !== undefined) values.url = data.url ? sanitizeUrl(data.url) || null : null;
  if (data?.hours !== undefined) values.hours = data.hours ? sanitizeText(data.hours, 200) || null : null;

  return { values, errors };
}

/**
 * Lista todos os anúncios gratuitos publicados ou suspensos (painel de moderação).
 */
export async function loadManagedPublished(): Promise<AdPublished[]> {
  const rows = await sql`
    SELECT * FROM ads_published
    WHERE kind = 'anuncio-gratuito'
    ORDER BY approved_at DESC
  `;
  return rows.map(publishedRowToAd);
}

/**
 * Edita campos de um anúncio publicado e registra a alteração no log.
 */
export async function editPublishedAd(
  adId: string,
  data: ManageActionData | undefined,
): Promise<ManageResult<{ ad: AdPublished }>> {
  const { values, errors } = sanitizeAdEdit(data);
  if (errors.length > 0) return { success: false, errors };
  if (Object.keys(values).length === 0) return { success: false, errors: ['Nenhum campo para alterar.'] };

  try {
    return await sql.begin(async (tx) => {
      const [current] = await tx`
        SELECT id FROM ads_published
        WHERE id = ${adId} AND kind = 'anuncio-gratuito'
        FOR UPDATE
      `;
      if (!current) throw new ModerationError('Anúncio não encontrado.');

      const [row] = await tx`
        UPDATE ads_published SET ${tx(values)}, updated_at = now()
        WHERE id = ${adId}
        RETURNING *
      `;
      await tx`INSERT INTO ads_moderation_log (action, ad_id) VALUES ('editar', ${adId})`;
      return { success: true as const, ad: publishedRowToAd(row) };
    });
  } catch (error) {
    if (error instanceof ModerationError) return { success: false, errors: [error.message] };
    throw error;
  }
}

/**
 * Suspende (retira da vitrine sem apagar) ou reativa um anúncio publicado.
 */
export async function updateAdStatus(
  adId: string,
  status: 'suspenso' | 'publicado',
): Promise<ManageResult> {
  const action = status === 'suspenso' ? 'suspender' : 'reativar';

  return sql.begin(async (tx) => {
    const [row] = await tx`
      UPDATE ads_published SET
        status = ${status},
        suspended_at = ${status === 'suspenso' ? new Date() : null},
        updated_at = now()
      WHERE id = ${adId} AND kind = 'anuncio-gratuito'
      RETURNING id
    `;
    if (!row) return { success: false as const, errors: ['Anúncio não encontrado.'] };

    await tx`INSERT INTO ads_moderation_log (action, ad_id) VALUES (${action}, ${adId})`;
    return { success: true as const };
  });
}

/**
 * Remove um anúncio publicado. O registro de auditoria permanece no log.
 */
export async function removeAd(adId: string): Promise<ManageResult> {
  return sql.begin(async (tx) => {
    const [row] = await tx`
      DELETE FROM ads_published
      WHERE id = ${adId} AND kind = 'anuncio-gratuito'
      RETURNING id
    `;
    if (!row) return { success: false as const, errors: ['Anúncio não encontrado.'] };

    await tx`INSERT INTO ads_moderation_log (action, ad_id) VALUES ('remover', ${adId})`;
    return { success: true as const };
  });
}
