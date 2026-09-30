import { env } from '@/config/env';

/**
 * Registro configurável de fontes (contrato content-source-adapter, regra 8):
 * remover ou trocar uma fonte não exige alteração de UI.
 *
 * Toda fonte DEVE passar pelo checklist da constituição (§Fontes Externas)
 * antes de ser adicionada: disponibilidade pública, limites de uso, termos,
 * direitos autorais, estabilidade, chave de API, removibilidade e alternativa.
 * Nenhuma "API oficial" de portais é pressuposta — somente RSS público.
 */

export interface FeedConfig {
  id: string;
  displayName: string;
  url: string;
}

/** Coordenadas fixas de São Carlos/SP para a previsão do tempo. */
export const WEATHER_LOCATION = {
  latitude: -22.0175,
  longitude: -47.8909,
  timezone: 'America/Sao_Paulo',
  forecastDays: 5,
} as const;

export function weatherUrl(): string {
  const params = new URLSearchParams({
    latitude: String(WEATHER_LOCATION.latitude),
    longitude: String(WEATHER_LOCATION.longitude),
    timezone: WEATHER_LOCATION.timezone,
    forecast_days: String(WEATHER_LOCATION.forecastDays),
    current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

const DEFAULT_NEWS_FEEDS: FeedConfig[] = [
  {
    id: 'google-news-sao-carlos',
    displayName: 'Google News — São Carlos',
    url: 'https://news.google.com/rss/search?q=S%C3%A3o%20Carlos%2C%20SP&hl=pt-BR&gl=BR&ceid=BR%3Apt-419',
  },
  // Fontes locais candidatas — acrescentar APÓS verificação individual do
  // checklist constitucional (research R3):
  // G1 São Carlos, ACidade ON, São Carlos Agora, Portal da Cidade São Carlos.
];

/**
 * Fontes do módulo de informativos (seção "Informativos e Avisos de
 * Utilidade Pública"). Checklist §Fontes Externas do SAAE: RSS público do
 * site oficial do órgão (disponibilidade pública), sem chave, cache ≈15 min,
 * somente título/resumo/data/link com atribuição e link ao canal oficial
 * (gate 13), removível apagando esta entrada — sem alteração de UI.
 * A curadoria manual em `content/notices.json` permanece e é combinada com
 * o feed no adapter.
 */
const DEFAULT_NOTICE_FEEDS: FeedConfig[] = [
  {
    id: 'saae-sao-carlos',
    displayName: 'SAAE São Carlos',
    url: 'https://saaesaocarlos.com.br/feed/',
  },
];

function overrideToFeeds(override: string, idPrefix: string): FeedConfig[] {
  return override
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url, index) => ({
      id: `${idPrefix}-${index + 1}`,
      displayName: `Fonte ${index + 1}`,
      url,
    }));
}

export function getNewsFeeds(): FeedConfig[] {
  const override = env.newsFeedsOverride;
  if (!override) return DEFAULT_NEWS_FEEDS;
  return overrideToFeeds(override, 'feed');
}

export function getNoticeFeeds(): FeedConfig[] {
  const override = env.noticeFeedsOverride;
  if (!override) return DEFAULT_NOTICE_FEEDS;
  return overrideToFeeds(override, 'notice-feed');
}
