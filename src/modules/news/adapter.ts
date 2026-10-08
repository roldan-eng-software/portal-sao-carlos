import { getNewsFeeds, type FeedConfig } from '@/config/sources';
import { extractFeedItems } from '@/lib/feed';
import { fetchText, getLastGood, setLastGood } from '@/lib/fetch-cached';
import { logSourceFailure, logSourceRecovery } from '@/lib/logger';
import { errorResult, okResult, staleResult, type ModuleResult } from '@/lib/module-result';
import { normalizeNewsItem } from './normalize';
import type { NewsItem, RawFeedItem } from './types';

const CACHE_KEY = 'news';
const MAX_ITEMS_PER_FEED = 10;
const MAX_TOTAL_ITEMS = 20;

/** Título reduzido a chave de comparação: sem acentos, caixa ou pontuação. */
export function normalizeTitleKey(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Duas chaves são a mesma matéria quando são iguais ou uma é prefixo
 * da outra (cobre o sufixo de saída do Google News, ex.: "título - G1").
 * O comprimento mínimo evita falso positivo em títulos curtos genéricos.
 */
export function isDuplicateTitle(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 30 && long.startsWith(short);
}

/** Filtro de relevância da fonte (FeedConfig.filterTerms) sobre o título. */
export function matchesFilterTerms(title: string, terms: string[] | undefined): boolean {
  if (!terms || terms.length === 0) return true;
  const lower = title.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

async function fetchFeed(feed: FeedConfig, collectedAt: Date): Promise<NewsItem[]> {
  const xml = await fetchText(feed.url);
  const rawItems = extractFeedItems(xml) as RawFeedItem[];
  if (rawItems.length === 0) {
    // HTTP 200 com corpo que não é o feed (WAF/anti-bot/redirecionamento
    // de blade) — sem este log a fonte some em silêncio no ISR (observação
    // mínima da constituição; visto em build de 2026-10-08).
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'feed_sem_itens',
        source: feed.id,
        host: (() => {
          try {
            return new URL(feed.url).host;
          } catch {
            return feed.url;
          }
        })(),
        bytes: xml.length,
        at: collectedAt.toISOString(),
      }),
    );
    throw new Error(`Feed sem itens: ${feed.id}`);
  }
  const items: NewsItem[] = [];
  for (const raw of rawItems) {
    if (items.length >= MAX_ITEMS_PER_FEED) break;
    const item = normalizeNewsItem(raw, feed.displayName, collectedAt);
    if (!item) continue;
    if (!matchesFilterTerms(item.title, feed.filterTerms)) continue;
    items.push(item);
  }
  return items;
}

/**
 * Adapter de notícias (contrato content-source-adapter): lê o registro
 * configurável de feeds, normaliza para NewsItem[] e isola falhas por feed —
 * um feed que falha não derruba os demais.
 */
export async function getNews(): Promise<ModuleResult<NewsItem[]>> {
  const feeds = getNewsFeeds();
  const collectedAt = new Date();
  const settled = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const items = await fetchFeed(feed, collectedAt);
        logSourceRecovery(feed.id);
        return { feed, items };
      } catch (error) {
        logSourceFailure(feed.id, error);
        throw error;
      }
    }),
  );

  const successes = settled.filter(
    (result): result is PromiseFulfilledResult<{ feed: FeedConfig; items: NewsItem[] }> =>
      result.status === 'fulfilled',
  );

  if (successes.length > 0) {
    const sourceNames = successes.map((result) => result.value.feed.displayName).join(', ');
    // Dedupe por título normalizado, respeitando a ordem das fontes em
    // sources.ts: a fonte direta processada primeiro mantém o link original
    // e o duplicata do agregador é descartado (SC-002 — um link por matéria).
    const seenKeys: string[] = [];
    const merged = successes
      .flatMap((result) => result.value.items)
      .filter((item) => {
        const key = normalizeTitleKey(item.title);
        if (seenKeys.some((seen) => isDuplicateTitle(seen, key))) return false;
        seenKeys.push(key);
        return true;
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, MAX_TOTAL_ITEMS);
    const lastUpdated = setLastGood(CACHE_KEY, merged);
    return okResult(merged, sourceNames, new Date(lastUpdated));
  }

  const last = getLastGood<NewsItem[]>(CACHE_KEY);
  if (last) {
    return staleResult(last.data, last.at, feeds[0]?.displayName ?? 'Notícias externas');
  }
  return errorResult(feeds[0]?.displayName ?? 'Notícias externas');
}
