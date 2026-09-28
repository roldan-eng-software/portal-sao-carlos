import adsSeed from '@/content/ads.json';
import { isSafeHttpUrl, sanitizeToLength } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

const SOURCE_NAME = 'Anúncios do portal';

export interface Ad {
  id: string;
  kind: 'anuncio-gratuito' | 'anuncio-patrocinado';
  /** 1–100 chars */
  businessName: string;
  /** 1–60 chars */
  category: string;
  /** 1–300 chars, texto puro */
  description: string;
  /** 1–80 chars */
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
  /** Foto do estabelecimento (https), quando o responsável a cadastra. */
  imageUrl?: string | null;
  status: 'rascunho' | 'publicado' | 'suspenso' | 'removido';
  /** YYYY-MM-DD — obrigatório quando status = "publicado" */
  publishedAt: string | null;
  /** YYYY-MM-DD — fim do período combinado fora do sistema */
  expiresAt: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isText(value: unknown, max: number): boolean {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function isOptionalText(value: unknown, max: number): boolean {
  return value === null || (typeof value === 'string' && value.length <= max);
}

/** Valida as constraints do data-model.md e as regras mínimas da constituição §13. */
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

/**
 * Seleção para exibição: somente `publicado`, sem período vencido, com
 * patrocinados primeiro (destaque) e ordenação por data de publicação.
 */
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
 * Carrega anúncios de content/ads.json — moderação manual por edição
 * versionada (FR-020): nenhum anúncio é publicado sem revisão humana.
 */
export function loadAds(): ModuleResult<Ad[]> {
  try {
    if (!Array.isArray(adsSeed)) {
      throw new Error('Arquivo de anúncios inválido');
    }
    const today = new Date().toISOString().slice(0, 10);
    const validCount = adsSeed.filter(isValidAd).length;
    if (validCount !== adsSeed.length) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'invalid_content_items',
          file: 'content/ads.json',
          discarded: adsSeed.length - validCount,
          at: new Date().toISOString(),
        }),
      );
    }
    const published = selectPublishedAds(adsSeed, today);
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
        file: 'content/ads.json',
        error: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
    return errorResult(SOURCE_NAME);
  }
}

export { sanitizeToLength };
