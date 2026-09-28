import type { DailyForecast, OpenMeteoResponse, WeatherData } from './types';

/** Códigos WMO de tempo → texto em pt-BR. */
const WMO_TEXT: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Encoberto',
  45: 'Névoa',
  48: 'Névoa com geada',
  51: 'Chuvisco fraco',
  53: 'Chuvisco',
  55: 'Chuvisco intenso',
  56: 'Chuvisco gelado fraco',
  57: 'Chuvisco gelado',
  61: 'Chuva fraca',
  63: 'Chuva',
  65: 'Chuva forte',
  66: 'Chuva gelada fraca',
  67: 'Chuva gelada forte',
  71: 'Neve fraca',
  73: 'Neve',
  75: 'Neve forte',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva',
  82: 'Pancadas de chuva fortes',
  85: 'Pancadas de neve',
  86: 'Pancadas de neve fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade forte com granizo',
};

export function wmoToText(code: number): string {
  return WMO_TEXT[code] ?? 'Condição não identificada';
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** Converte a resposta bruta em WeatherData; lança erro se inválida (FR-021). */
export function normalizeWeather(raw: unknown): WeatherData {
  const response = raw as OpenMeteoResponse;
  const current = response?.current;
  const daily = response?.daily;

  const temperatureC = asNumber(current?.temperature_2m);
  const weatherCode = asNumber(current?.weather_code);
  if (temperatureC === null || weatherCode === null) {
    throw new Error('Resposta de previsão do tempo sem dados atuais válidos');
  }

  const dates = Array.isArray(daily?.time) ? daily.time : null;
  const codes = Array.isArray(daily?.weather_code) ? daily.weather_code : null;
  const maxes = Array.isArray(daily?.temperature_2m_max) ? daily.temperature_2m_max : null;
  const mins = Array.isArray(daily?.temperature_2m_min) ? daily.temperature_2m_min : null;
  if (!dates || !codes || !maxes || !mins || dates.length === 0) {
    throw new Error('Resposta de previsão do tempo sem previsão diária válida');
  }

  const dailyForecasts: DailyForecast[] = [];
  for (let i = 0; i < dates.length && dailyForecasts.length < 7; i += 1) {
    const date = asString(dates[i]);
    const minC = asNumber(mins[i]);
    const maxC = asNumber(maxes[i]);
    const code = asNumber(codes[i]);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || minC === null || maxC === null || code === null) {
      continue;
    }
    dailyForecasts.push({
      date,
      minC: Math.round(minC * 10) / 10,
      maxC: Math.round(maxC * 10) / 10,
      weatherCode: code,
      conditionText: wmoToText(code),
    });
  }
  if (dailyForecasts.length === 0) {
    throw new Error('Resposta de previsão do tempo sem dias válidos');
  }

  const wind = asNumber(current?.wind_speed_10m);

  return {
    city: 'São Carlos/SP',
    temperatureC: Math.round(temperatureC * 10) / 10,
    weatherCode,
    conditionText: wmoToText(weatherCode),
    windKmh: wind === null ? null : Math.round(wind),
    daily: dailyForecasts,
  };
}
