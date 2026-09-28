export interface DailyForecast {
  /** ISO date YYYY-MM-DD */
  date: string;
  minC: number;
  maxC: number;
  weatherCode: number;
  conditionText: string;
}

export interface WeatherData {
  city: string;
  temperatureC: number;
  weatherCode: number;
  conditionText: string;
  windKmh: number | null;
  daily: DailyForecast[];
}

/** Forma bruta aceita da API de previsão (validada em normalize.ts). */
export interface OpenMeteoResponse {
  current?: {
    temperature_2m?: unknown;
    weather_code?: unknown;
    wind_speed_10m?: unknown;
  };
  daily?: {
    time?: unknown;
    weather_code?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
  };
}
