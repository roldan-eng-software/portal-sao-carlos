import { getNoticeFeeds, type FeedConfig } from '@/config/sources';
import { extractFeedItems } from '@/lib/feed';
import { fetchText, getLastGood, setLastGood } from '@/lib/fetch-cached';
import { logSourceFailure, logSourceRecovery } from '@/lib/logger';
import { okResult, staleResult, type ModuleResult } from '@/lib/module-result';
import { isValidNotice, loadNotices, type Notice } from './loader';
import { normalizeNoticeItem } from './normalize';
import type { RawNoticeFeedItem } from './types';

const CACHE_KEY = 'notices-feed';
const SOURCE_NAME = 'Informativos do portal';
const MAX_ITEMS_PER_FEED = 10;
const MAX_TOTAL_ITEMS = 12;

async function fetchFeed(feed: FeedConfig, collectedAt: Date): Promise<Notice[]> {
  const xml = await fetchText(feed.url);
  const items: Notice[] = [];
  for (const raw of extractFeedItems(xml)) {
    if (items.length >= MAX_ITEMS_PER_FEED) break;
    const item = normalizeNoticeItem(raw as RawNoticeFeedItem, feed, collectedAt);
    // Camada extra de garantia: só entra o que satisfaz as constraints do
    // modelo Notice (data-model.md), idêntico ao gate do arquivo curado.
    if (item && isValidNotice(item)) items.push(item);
  }
  return items;
}

/** Combina curadoria + feed, removendo ids repetidos e mantendo os mais recentes. */
function mergeNotices(curated: Notice[], feedItems: Notice[]): Notice[] {
  const seen = new Set<string>();
  return [...curated, ...feedItems]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_TOTAL_ITEMS);
}

function joinSourceNames(curated: Notice[], feedNames: string[]): string {
  const curatedName = curated.length > 0 ? SOURCE_NAME : null;
  return [curatedName, ...feedNames].filter((name): name is string => name !== null).join(', ');
}

/**
 * Adapter do módulo informativos (contrato content-source-adapter): combina a
 * curadoria manual (`content/notices.json`, gate 6) com os feeds RSS
 * registrados em `config/sources.ts` — remover ou trocar a fonte ali não
 * exige alteração de UI. A normalização do feed vive em `normalize.ts`
 * (texto puro validado, URL http(s), atribuição + link ao original).
 *
 * Isolamento de falha (gate 10/FR-013), por fonte:
 * - feed ok → `ok` com curadoria + feed (último feed válido fica em cache);
 * - feed falha com histórico → `stale` com curadoria + último feed válido;
 * - feed falha sem histórico → a curadoria segue em `ok` (nada de conteúdo
 *   do feed havia sido exibido; a falha fica registrada em `logSourceFailure`);
 * - curadoria corrompida → curadoria em `error`, a menos que o feed tenha
 *   itens válidos para exibir.
 */
export async function getNotices(): Promise<ModuleResult<Notice[]>> {
  const curated = loadNotices();
  const feeds = getNoticeFeeds();
  const collectedAt = new Date();

  if (feeds.length === 0) return curated;

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
    (result): result is PromiseFulfilledResult<{ feed: FeedConfig; items: Notice[] }> =>
      result.status === 'fulfilled',
  );

  const curatedItems = curated.data ?? [];

  if (successes.length > 0) {
    const feedItems = successes.flatMap((result) => result.value.items);
    const lastUpdated = setLastGood(CACHE_KEY, feedItems);
    const merged = mergeNotices(curatedItems, feedItems);
    if (merged.length === 0 && curated.status === 'error') return curated;
    const feedNames = successes.map((result) => result.value.feed.displayName);
    return okResult(merged, joinSourceNames(curatedItems, feedNames), new Date(lastUpdated));
  }

  // Todo o feed falhou nesta atualização.
  const last = getLastGood<Notice[]>(CACHE_KEY);
  if (last) {
    const merged = mergeNotices(curatedItems, last.data);
    const feedNames = feeds.map((feed) => feed.displayName);
    return staleResult(merged, last.at, joinSourceNames(curatedItems, feedNames));
  }
  // Feed ainda sem histórico: curadoria é conteúdo válido e atual — `ok`.
  return curated;
}

export type { Notice };
