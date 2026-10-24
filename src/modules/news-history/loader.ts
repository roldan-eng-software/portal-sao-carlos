import fs from 'fs/promises';
import path from 'path';
import { getNews } from '@/modules/news/adapter';
import { mergeWithHistory } from './normalize';
import { applyRetentionFilter } from './retention';
import type { NewsHistoryItem, NewsHistoryPage } from './types';
import { NEWS_HISTORY_PAGE_SIZE } from './types';

const HISTORY_FILE = path.resolve(process.cwd(), 'src/content/news-history.json');

/**
 * Carrega o histórico de notícias do arquivo JSON.
 * Retorna array vazio se arquivo não existir ou for inválido.
 */
export async function loadHistory(): Promise<NewsHistoryItem[]> {
  try {
    const content = await fs.readFile(HISTORY_FILE, 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data as NewsHistoryItem[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Salva o histórico de notícias no arquivo JSON (escrita atômica via temp + rename).
 */
export async function saveHistory(items: NewsHistoryItem[]): Promise<void> {
  const tempFile = `${HISTORY_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(items, null, 2), 'utf-8');
  await fs.rename(tempFile, HISTORY_FILE);
}

/**
 * Carrega página paginada do histórico de notícias.
 * Busca notícias atuais, mergeia com histórico, aplica retenção e pagina.
 */
export async function getNewsHistoryPage(page = 1): Promise<NewsHistoryPage> {
  // 1. Carrega histórico persistido
  const history = await loadHistory();

  // 2. Busca notícias atuais dos feeds
  const currentResult = await getNews();

  // 3. Merge atual + histórico
  let mergedItems: NewsHistoryItem[];
  let status: 'ok' | 'stale' | 'error';
  let errorMessage: string | undefined;
  let lastUpdated: string;

  if (currentResult.status === 'ok' && currentResult.data) {
    mergedItems = mergeWithHistory(currentResult.data, history);
    status = 'ok';
    lastUpdated = currentResult.lastUpdated ?? new Date().toISOString();
  } else if (currentResult.status === 'stale') {
    mergedItems = applyRetentionFilter(history);
    status = 'stale';
    errorMessage = currentResult.errorMessage ?? undefined;
    lastUpdated = currentResult.lastUpdated ?? new Date().toISOString();
  } else {
    mergedItems = applyRetentionFilter(history);
    status = 'error';
    errorMessage = currentResult.errorMessage ?? undefined;
    lastUpdated = new Date().toISOString();
  }

  // 4. Aplica filtro de retenção (12 meses)
  mergedItems = applyRetentionFilter(mergedItems);

  // 5. Paginação
  const total = mergedItems.length;
  const totalPages = Math.ceil(total / NEWS_HISTORY_PAGE_SIZE) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * NEWS_HISTORY_PAGE_SIZE;
  const end = start + NEWS_HISTORY_PAGE_SIZE;
  const items = mergedItems.slice(start, end);

  return {
    items,
    total,
    page: safePage,
    pageSize: NEWS_HISTORY_PAGE_SIZE,
    totalPages,
    lastUpdated,
    status,
    errorMessage,
  };
}

/**
 * Atualiza o histórico com as notícias mais recentes dos feeds.
 * Usado pelo script de limpeza ou job agendado.
 */
export async function updateHistory(): Promise<{ added: number; total: number }> {
  const history = await loadHistory();
  const currentResult = await getNews();

  if (currentResult.status === 'ok' && currentResult.data) {
    const { toNewsHistoryItem } = await import('./normalize');
    currentResult.data.map(toNewsHistoryItem);
  }

  const merged = mergeWithHistory(
    currentResult.status === 'ok' && currentResult.data ? currentResult.data : [],
    history,
  );

  const filtered = applyRetentionFilter(merged);
  await saveHistory(filtered);

  return {
    added: filtered.length - history.length,
    total: filtered.length,
  };
}