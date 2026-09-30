/**
 * Parsing compartilhado de feeds RSS/Atom (contrato content-source-adapter):
 * converte o XML bruto em estruturas `unknown` e auxiliares de leitura — a
 * normalização para o modelo interno de cada módulo continua no próprio
 * adapter. Reutilizado por `modules/news` e `modules/notices` para que a
 * lógica de leitura de feed exista em um único lugar.
 */

import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreDeclaration: true,
  parseTagValue: false,
  trimValues: true,
});

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
export function pickLink(value: unknown): string | null {
  const direct = pickString(value);
  if (direct) return direct;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return pickString((value as Record<string, unknown>)['@_href']);
  }
  if (Array.isArray(value) && value.length > 0) return pickLink(value[0]);
  return null;
}

/** Data de item do feed (pubDate/Date/isoDate); `null` quando ausente ou inválida. */
export function parseFeedDate(value: unknown): Date | null {
  const text = pickString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Itens brutos de um documento RSS 2.0 ou Atom, sem nenhuma interpretação de
 * conteúdo — cada módulo decide o que aceita (contrato content-source-adapter,
 * regra 3: normalização no próprio adapter).
 */
export function extractFeedItems(xml: string): Record<string, unknown>[] {
  const doc = parser.parse(xml) as {
    rss?: { channel?: { item?: Record<string, unknown> | Record<string, unknown>[] } };
    feed?: { entry?: Record<string, unknown> | Record<string, unknown>[] };
  };
  const rssItems = doc?.rss?.channel?.item;
  if (rssItems) return Array.isArray(rssItems) ? rssItems : [rssItems];
  const atomItems = doc?.feed?.entry;
  if (atomItems) return Array.isArray(atomItems) ? atomItems : [atomItems];
  return [];
}
