import { describe, expect, it } from 'vitest';
import { normalizeWeather, wmoToText } from '@/modules/weather/normalize';

const validPayload = {
  current: { temperature_2m: 25.34, weather_code: 2, wind_speed_10m: 12.4 },
  daily: {
    time: ['2026-09-28', '2026-09-29', '2026-09-30'],
    weather_code: [2, 61, 0],
    temperature_2m_max: [28.2, 24.9, 27.0],
    temperature_2m_min: [16.1, 15.4, 14.8],
  },
};

describe('normalizeWeather', () => {
  it('converte resposta válida no modelo interno', () => {
    const data = normalizeWeather(validPayload);
    expect(data.city).toBe('São Carlos/SP');
    expect(data.temperatureC).toBe(25.3);
    expect(data.conditionText).toBe('Parcialmente nublado');
    expect(data.windKmh).toBe(12);
    expect(data.daily).toHaveLength(3);
    expect(data.daily[1]).toMatchObject({
      date: '2026-09-29',
      minC: 15.4,
      maxC: 24.9,
      conditionText: 'Chuva fraca',
    });
  });

  it('expõe umidade relativa quando presente e a ignora quando ausente', () => {
    const withHumidity = normalizeWeather({
      ...validPayload,
      current: { ...validPayload.current, relative_humidity_2m: 20.4 },
    });
    expect(withHumidity.humidityPercent).toBe(20);

    const withoutHumidity = normalizeWeather(validPayload);
    expect(withoutHumidity.humidityPercent).toBeNull();
  });

  it('lança erro quando os dados atuais estão ausentes', () => {
    expect(() => normalizeWeather({ current: {}, daily: validPayload.daily })).toThrow();
    expect(() => normalizeWeather(null)).toThrow();
  });

  it('lança erro quando a previsão diária é vazia', () => {
    expect(() =>
      normalizeWeather({
        current: validPayload.current,
        daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] },
      }),
    ).toThrow();
  });

  it('descarta dias com data inválida e mantém os válidos', () => {
    const data = normalizeWeather({
      current: validPayload.current,
      daily: {
        time: ['28/09/2026', '2026-09-29'],
        weather_code: [2, 3],
        temperature_2m_max: [28, 24],
        temperature_2m_min: [16, 15],
      },
    });
    expect(data.daily).toHaveLength(1);
    expect(data.daily[0].date).toBe('2026-09-29');
  });
});

describe('wmoToText', () => {
  it('mapeia códigos WMO para pt-BR', () => {
    expect(wmoToText(0)).toBe('Céu limpo');
    expect(wmoToText(65)).toBe('Chuva forte');
    expect(wmoToText(95)).toBe('Tempestade');
  });

  it('retorna texto neutro para códigos desconhecidos', () => {
    expect(wmoToText(1234)).toBe('Condição não identificada');
  });
});
