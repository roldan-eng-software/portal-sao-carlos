import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather } from '@/modules/weather/adapter';

const validWeatherPayload = {
  current: { temperature_2m: 25, weather_code: 1, wind_speed_10m: 10 },
  daily: {
    time: ['2026-09-28'],
    weather_code: [1],
    temperature_2m_max: [28],
    temperature_2m_min: [16],
  },
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Cenário quickstart V5 no nível do adapter: falha de fonte externa nunca
 * propaga exceção — resulta em `error` amigável sem dado prévio, ou `stale`
 * preservando o último conteúdo válido (SC-004 / FR-012 / FR-013).
 * Ordem importa: o teste de `error` roda antes de semear o cache em memória.
 */
describe('isolamento de falha de fonte externa', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falha sem dado prévio → status error com mensagem amigável', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED detalhe técnica')),
    );

    const result = await getWeather();
    expect(result.status).toBe('error');
    expect(result.data).toBeNull();
    expect(result.errorMessage).toBeTruthy();
    // nunca expor detalhe técnico ao visitante
    expect(result.errorMessage).not.toMatch(/ECONNREFUSED|HTTP|Error|exception/i);
  });

  it('sucesso seguido de falha → stale com último valor válido', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(validWeatherPayload))
      .mockRejectedValueOnce(new Error('rede indisponível'));
    vi.stubGlobal('fetch', fetchMock);

    const first = await getWeather();
    expect(first.status).toBe('ok');
    expect(first.data?.temperatureC).toBe(25);

    const second = await getWeather();
    expect(second.status).toBe('stale');
    expect(second.data?.temperatureC).toBe(25);
    expect(second.lastUpdated).toBe(first.lastUpdated);
    expect(second.errorMessage).toMatch(/temporariamente indisponível/i);
  });
});
