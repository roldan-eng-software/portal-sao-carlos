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

export interface NewsFeedConfig {
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
    current: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

const DEFAULT_NEWS_FEEDS: NewsFeedConfig[] = [
  {
    id: 'google-news-sao-carlos',
    displayName: 'Google News — São Carlos',
    url: 'https://news.google.com/rss/search?q=S%C3%A3o%20Carlos%2C%20SP&hl=pt-BR&gl=BR&ceid=BR%3Apt-419',
  },
  // Fontes locais candidatas — acrescentar APÓS verificação individual do
  // checklist constitucional (research R3):
  // G1 São Carlos, ACidade ON, São Carlos Agora, Portal da Cidade São Carlos.
];

export function getNewsFeeds(): NewsFeedConfig[] {
  const override = env.newsFeedsOverride;
  if (!override) return DEFAULT_NEWS_FEEDS;
  return override
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url, index) => ({
      id: `feed-${index + 1}`,
      displayName: `Fonte ${index + 1}`,
      url,
    }));
}
