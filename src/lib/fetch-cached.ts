/**
 * Busca de fontes externas no servidor com cache/revalidação e timeout.
 * Regras do contrato content-source-adapter:
 * - nunca chamar APIs a cada visita (revalidação ≈ 15 min)
 * - timeout ≈ 5 s por fonte
 * - qualquer chave futura somente em variável de ambiente (gate 9)
 */

const DEFAULT_REVALIDATE_SECONDS = 15 * 60;
const DEFAULT_TIMEOUT_MS = 5000;

export interface FetchCachedOptions {
  revalidateSeconds?: number;
  timeoutMs?: number;
}

export async function fetchText(url: string, options: FetchCachedOptions = {}): Promise<string> {
  const { revalidateSeconds = DEFAULT_REVALIDATE_SECONDS, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: revalidateSeconds },
    headers: { Accept: 'application/rss+xml, application/xml, text/xml, application/json, */*' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ao buscar ${new URL(url).host}`);
  }
  return response.text();
}

export async function fetchJson<T>(url: string, options: FetchCachedOptions = {}): Promise<T> {
  const text = await fetchText(url, options);
  return JSON.parse(text) as T;
}

/**
 * Último conteúdo válido em memória do processo — base do estado `stale`
 * quando uma fonte falha (FR-012/FR-013).
 */
interface LastGoodEntry {
  data: unknown;
  at: string;
}

const globalStore = globalThis as unknown as { __portalLastGood?: Map<string, LastGoodEntry> };
const lastGood: Map<string, LastGoodEntry> = (globalStore.__portalLastGood ??= new Map());

export function getLastGood<T>(key: string): { data: T; at: string } | null {
  const entry = lastGood.get(key);
  if (!entry) return null;
  return { data: entry.data as T, at: entry.at };
}

export function setLastGood<T>(key: string, data: T): string {
  const at = new Date().toISOString();
  lastGood.set(key, { data, at });
  return at;
}
