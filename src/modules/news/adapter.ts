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

async function fetchFeed(feed: FeedConfig, collectedAt: Date): Promise<NewsItem[]> {
  const xml = await fetchText(feed.url);
  const rawItems = extractFeedItems(xml) as RawFeedItem[];
  const items: NewsItem[] = [];
  for (const raw of rawItems) {
    if (items.length >= MAX_ITEMS_PER_FEED) break;
    const item = normalizeNewsItem(raw, feed.displayName, collectedAt);
    if (item) items.push(item);
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
    const merged = successes
      .flatMap((result) => result.value.items)
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
