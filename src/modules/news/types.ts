export interface NewsItem {
  /** 1–200 chars, texto puro (após sanitização). */
  title: string;
  /** 1–500 chars, texto puro. */
  summary: string;
  /** ISO 8601. */
  publishedAt: string;
  /** Nome do portal/feed, exibido ao visitante. */
  sourceName: string;
  /** http/https obrigatório; item sem URL válida é descartado. */
  url: string;
  category?: string;
  /** Imagem de destaque https quando o feed a publica (opcional). */
  imageUrl?: string;
}

/** Item bruto de um feed RSS/Atom antes da normalização. */
export interface RawFeedItem {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
  date?: unknown;
  isoDate?: unknown;
  description?: unknown;
  summary?: unknown;
  source?: unknown;
  category?: unknown;
  /** RSS enclosure (imagem/anexo). */
  enclosure?: unknown;
  /** Media RSS (namespace `media:`). */
  'media:content'?: unknown;
  'media:thumbnail'?: unknown;
}
