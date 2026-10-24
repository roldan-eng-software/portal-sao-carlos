import { normalizeTitleKey } from '@/modules/news/adapter';
import type { NewsHistoryItem } from './types';
import { sanitizeToLength } from '@/lib/sanitize';
import type { NewsItem } from '@/modules/news/types';

/**
 * Gera hash de deduplicação baseado em título normalizado + fonte + data
 * (compatível com a deduplicação existente do módulo de notícias).
 */
export function generateDedupeHash(item: NewsItem): string {
  const key = normalizeTitleKey(item.title);
  const source = item.sourceName.toLowerCase().trim();
  const date = item.publishedAt.split('T')[0]; // YYYY-MM-DD
  return `${key}|${source}|${date}`;
}

/**
 * Normaliza NewsItem para NewsHistoryItem adicionando metadados de persistência.
 */
export function toNewsHistoryItem(item: NewsItem): NewsHistoryItem {
  const collectedAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: item.title,
    summary: item.summary,
    date: item.publishedAt,
    sourceName: item.sourceName,
    sourceUrl: item.url,
    category: item.category,
    region: undefined,
    imageUrl: item.imageUrl,
    collectedAt,
    dedupeHash: generateDedupeHash(item),
  };
}

/**
 * Merge de notícias atuais com histórico existente, deduplicando por hash.
 * Mantém o item mais recente (pela data de coleta) em caso de conflito.
 */
export function mergeWithHistory(
  currentItems: NewsItem[],
  history: NewsHistoryItem[],
): NewsHistoryItem[] {
  const historyMap = new Map<string, NewsHistoryItem>();

  // Primeiro, adiciona o histórico existente
  for (const h of history) {
    historyMap.set(h.dedupeHash, h);
  }

  // Depois, merge com itens atuais (mais recentes)
  for (const item of currentItems) {
    const historyItem = toNewsHistoryItem(item);
    const existing = historyMap.get(historyItem.dedupeHash);
    if (!existing || new Date(historyItem.collectedAt) > new Date(existing.collectedAt)) {
      historyMap.set(historyItem.dedupeHash, historyItem);
    }
  }

  // Ordena por data decrescente (mais recentes primeiro)
  return Array.from(historyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Sanitiza título para exibição segura (consistente com módulo de notícias).
 */
export function sanitizeHistoryTitle(title: string): string {
  return sanitizeToLength(title, 200);
}

/**
 * Sanitiza resumo para exibição segura.
 */
export function sanitizeHistorySummary(summary: string): string {
  return sanitizeToLength(summary, 500);
}