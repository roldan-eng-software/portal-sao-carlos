import { isSafeHttpUrl, sanitizeToLength } from '@/lib/sanitize';
import type { NewsItem, RawFeedItem } from './types';

export const TITLE_MAX = 200;
export const SUMMARY_MAX = 500;
const IMAGE_URL_MAX = 500;

/** Extrai string de valores heterogêneos vindo do parser XML. */
export function pickString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim().length > 0 ? value : null;
  if (Array.isArray(value) && value.length > 0) return pickString(value[0]);
  if (value && typeof value === 'object' && '#text' in value) {
    return pickString((value as { '#text'?: unknown })['#text']);
  }
  return null;
}

/**
 * Link de item: RSS usa string; Atom usa `<link href="…">`
 * (objeto com atributos `@_href`).
 */
function pickLink(value: unknown): string | null {
  const direct = pickString(value);
  if (direct) return direct;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return pickString((value as Record<string, unknown>)['@_href']);
  }
  if (Array.isArray(value) && value.length > 0) return pickLink(value[0]);
  return null;
}

function parseDate(raw: unknown): string | null {
  const text = pickString(raw);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * URL de imagem aceita apenas quando https (evita mixed content),
 * http(s) válido e dentro do limite de tamanho.
 */
function toSafeImageUrl(url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.length > IMAGE_URL_MAX) return null;
  if (!trimmed.startsWith('https://')) return null;
  return isSafeHttpUrl(trimmed) ? trimmed : null;
}

/** URL de um anexo Media/enclosure, considerando objeto ou array. */
function annexUrl(value: unknown, opts: { requireImageType: boolean }): string | null {
  const entries = Array.isArray(value) ? value : [value];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const attrs = entry as Record<string, unknown>;
    const url = pickString(attrs['@_url']);
    if (!url) continue;
    const type = pickString(attrs['@_type']);
    const medium = pickString(attrs['@_medium']);
    // Metadado explícito não-imagem (audio/…, video/…, medium diverso de image)
    // descarta o anexo — mesmo quando o chamador não exige type (enclosure/thumbnail).
    const declaredNonImage =
      (type !== null && !type.startsWith('image/')) || (medium !== null && medium !== 'image');
    if (declaredNonImage) continue;
    if (opts.requireImageType) {
      const looksImage =
        (type !== null && type.startsWith('image/')) || (medium !== null && medium === 'image');
      if (!looksImage) continue;
    }
    const safe = toSafeImageUrl(url);
    if (safe) return safe;
  }
  return null;
}

/** `<link rel="enclosure" type="image/…" href="…">` do Atom. */
function annexLinkUrl(value: unknown): string | null {
  const entries = Array.isArray(value) ? value : [value];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const attrs = entry as Record<string, unknown>;
    const rel = pickString(attrs['@_rel']);
    const type = pickString(attrs['@_type']);
    // type explícito não-imagem descarta o link, mesmo com rel="enclosure".
    if (type !== null && !type.startsWith('image/')) continue;
    const isAnnex = rel === 'enclosure' || rel === 'image' || type !== null;
    if (!isAnnex) continue;
    const safe = toSafeImageUrl(pickString(attrs['@_href']));
    if (safe) return safe;
  }
  return null;
}

/** Primeira tag <img src="…"> válida dentro do HTML do resumo. */
function firstImgInHtml(html: unknown): string | null {
  const text = pickString(html);
  if (!text || !text.includes('<img')) return null;
  const match = /<img[^>]*\ssrc=["']([^"']+)["']/i.exec(text);
  return match ? match[1].trim() : null;
}

/**
 * Extrai imagem de destaque do item bruto, nesta ordem:
 * RSS enclosure → media:content → media:thumbnail → link Atom de anexo →
 * <img> do resumo em HTML. Retorna `undefined` quando não há imagem segura.
 */
export function extractImageUrl(raw: RawFeedItem): string | undefined {
  const candidates: (string | null)[] = [
    annexUrl(raw.enclosure, { requireImageType: false }),
    annexUrl(raw['media:content'], { requireImageType: true }),
    annexUrl(raw['media:thumbnail'], { requireImageType: false }),
    annexLinkUrl(raw.link),
    firstImgInHtml(raw.description) ?? firstImgInHtml(raw.summary),
  ];
  for (const candidate of candidates) {
    const safe = toSafeImageUrl(candidate);
    if (safe) return safe;
  }
  return undefined;
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

  const url = pickLink(raw.link);
  if (!isSafeHttpUrl(url)) return null;

  const summary = sanitizeToLength(raw.summary ?? raw.description ?? title, SUMMARY_MAX) || title;
  const publishedAt =
    parseDate(raw.pubDate ?? raw.date ?? raw.isoDate) ?? collectedAt.toISOString();
  const itemSource = pickString(raw.source) ?? feedSourceName;
  const category = sanitizeToLength(raw.category, 60) || undefined;
  const imageUrl = extractImageUrl(raw);

  const item: NewsItem = {
    title,
    summary,
    publishedAt,
    sourceName: sanitizeToLength(itemSource, 80),
    url,
  };
  if (category) item.category = category;
  if (imageUrl) item.imageUrl = imageUrl;
  return item;
}
