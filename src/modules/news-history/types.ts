/**
 * News History Types - Fase 2
 * Histórico persistido de notícias além do cache volátil
 */

export interface NewsHistoryItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  sourceName: string;
  sourceUrl: string;
  category?: string;
  region?: string;
  imageUrl?: string;
  collectedAt: string;
  dedupeHash: string;
}

export interface NewsHistoryPage {
  items: NewsHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastUpdated: string;
  status: 'ok' | 'stale' | 'error';
  errorMessage?: string;
}

export const NEWS_HISTORY_PAGE_SIZE = 20;
export const NEWS_HISTORY_RETENTION_DAYS = 365;