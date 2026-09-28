import { isSafeHttpUrl, sanitizeToLength } from '@/lib/sanitize';
import type { NewsItem, RawFeedItem } from './types';

export const TITLE_MAX = 200;
export const SUMMARY_MAX = 500;

/** Extrai string de valores heterogêneos vindo do parser XML. */
export function pickString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim().length > 0 ? value : null;
  if (Array.isArray(value) && value.length > 0) return pickString(value[0]);
  if (value && typeof value === 'object' && '#text' in value) {
    return pickString((value as { '#text'?: unknown })['#text']);
  }
  return null;
}

function parseDate(raw: unknown): string | null {
  const text = pickString(raw);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Normaliza um item de feed para o modelo interno NewsItem (data-model.md).
 * Retorna `null` quando o item é inválido (título vazio ou URL não http/https)
 * — nesse caso apenas o item é descartado, nunca o lote inteiro.
 */
export function normalizeNewsItem(
  raw: RawFeedItem,
  feedSourceName: string,
  collectedAt: Date = new Date(),
): NewsItem | null {
  const title = sanitizeToLength(raw.title, TITLE_MAX);
  if (!title) return null;

  const url = pickString(raw.link);
  if (!isSafeHttpUrl(url)) return null;

  const summary = sanitizeToLength(raw.summary ?? raw.description ?? title, SUMMARY_MAX) || title;
  const publishedAt = parseDate(raw.pubDate ?? raw.date ?? raw.isoDate) ?? collectedAt.toISOString();
  const itemSource = pickString(raw.source) ?? feedSourceName;
  const category = sanitizeToLength(raw.category, 60) || undefined;

  const item: NewsItem = {
    title,
    summary,
    publishedAt,
    sourceName: sanitizeToLength(itemSource, 80),
    url,
  };
  if (category) item.category = category;
  return item;
}
