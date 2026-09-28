import { weatherUrl } from '@/config/sources';
import { fetchJson, getLastGood, setLastGood } from '@/lib/fetch-cached';
import { logSourceFailure, logSourceRecovery } from '@/lib/logger';
import { errorResult, okResult, staleResult, type ModuleResult } from '@/lib/module-result';
import { normalizeWeather } from './normalize';
import type { WeatherData } from './types';

const SOURCE_ID = 'open-meteo';
const SOURCE_NAME = 'Open-Meteo';
const CACHE_KEY = 'weather';

/**
 * Adapter da previsão do tempo (contrato content-source-adapter).
 * Busca no servidor com cache/revalidação; em falha, último valor válido
 * (`stale`) ou mensagem amigável (`error`) — nunca exceção propaga (gate 10).
 */
export async function getWeather(): Promise<ModuleResult<WeatherData>> {
  try {
    const raw = await fetchJson<unknown>(weatherUrl());
    const data = normalizeWeather(raw);
    const lastUpdated = setLastGood(CACHE_KEY, data);
    logSourceRecovery(SOURCE_ID);
    return okResult(data, SOURCE_NAME, new Date(lastUpdated));
  } catch (error) {
    logSourceFailure(SOURCE_ID, error);
    const last = getLastGood<WeatherData>(CACHE_KEY);
    if (last) {
      return staleResult(last.data, last.at, SOURCE_NAME);
    }
    return errorResult(SOURCE_NAME);
  }
}
