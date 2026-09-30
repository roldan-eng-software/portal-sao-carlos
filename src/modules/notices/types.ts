/** Item bruto do feed RSS de informativos antes da normalização. */
export interface RawNoticeFeedItem {
  title?: unknown;
  link?: unknown;
  /** Identificador do item no CMS (WordPress `guid`) — base do `id` estável. */
  guid?: unknown;
  pubDate?: unknown;
  date?: unknown;
  isoDate?: unknown;
  description?: unknown;
  summary?: unknown;
  /** Conteúdo completo do item (WordPress `content:encoded`, HTML). */
  'content:encoded'?: unknown;
}
