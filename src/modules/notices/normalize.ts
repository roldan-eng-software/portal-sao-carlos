import { parseFeedDate, pickLink, pickString } from '@/lib/feed';
import { isSafeHttpUrl, sanitizeToLength } from '@/lib/sanitize';
import type { Notice } from './loader';
import type { RawNoticeFeedItem } from './types';

/** Limites do modelo Notice (data-model.md). */
const TITLE_MAX = 200;
const SUMMARY_MAX = 500;

/** Identificador de fonte informado ao normalizador (contrato content-source-adapter). */
export interface NoticeFeedIdentity {
  id: string;
  displayName: string;
}

/**
 * `date` do modelo Notice é YYYY-MM-DD. A data é interpretada no fuso de
 * São Paulo para que um comunicado publicado à noite não "pule" de dia
 * por causa do UTC.
 */
function toDateOnly(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
}

/** Slug determinístico a partir de guid/link — base do `id` único do item. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Resumo do item: `description` (curta) → `content:encoded` (corpo completo,
 * HTML) → título. Todo texto passa por `sanitizeToLength` (HTML → texto puro,
 * gate 11) e é truncado no limite do modelo.
 */
function pickSummary(raw: RawNoticeFeedItem, fallback: string): string {
  return (
    sanitizeToLength(raw.description, SUMMARY_MAX) ||
    sanitizeToLength(raw['content:encoded'], SUMMARY_MAX) ||
    fallback
  );
}

/**
 * Normaliza um item do feed de informativos para o modelo Notice
 * (data-model.md). Retorna `null` quando o item é inválido — título vazio ou
 * sem link ao canal oficial (gate 13: informativo de fonte sem atribuição
 * linkada é descartado). Nesse caso apenas o item é descartado, nunca o lote.
 */
export function normalizeNoticeItem(
  raw: RawNoticeFeedItem,
  feed: NoticeFeedIdentity,
  collectedAt: Date = new Date(),
): Notice | null {
  const title = sanitizeToLength(raw.title, TITLE_MAX);
  if (!title) return null;

  const url = pickLink(raw.link);
  if (!isSafeHttpUrl(url)) return null;

  const summary = pickSummary(raw, title);
  // Data ausente no feed usa a data da coleta (mesma regra de NewsItem).
  const published = parseFeedDate(raw.pubDate ?? raw.date ?? raw.isoDate) ?? collectedAt;
  const idSlug = slugify(pickString(raw.guid) ?? url);

  return {
    id: idSlug ? `${feed.id}-${idSlug}` : `${feed.id}-${toDateOnly(published)}`,
    title,
    summary,
    date: toDateOnly(published),
    sourceName: feed.displayName,
    sourceUrl: url,
    status: 'publicado',
    kind: 'informativo',
  };
}
