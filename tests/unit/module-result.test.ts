import { describe, expect, it } from 'vitest';
import {
  ERROR_MESSAGE,
  STALE_MESSAGE,
  errorResult,
  okResult,
  staleResult,
} from '@/lib/module-result';

describe('ModuleResult factories', () => {
  it('okResult cria envelope ok com dados e data/hora', () => {
    const at = new Date('2026-09-28T12:00:00Z');
    const result = okResult({ temp: 25 }, 'Open-Meteo', at);
    expect(result.status).toBe('ok');
    expect(result.data).toEqual({ temp: 25 });
    expect(result.lastUpdated).toBe(at.toISOString());
    expect(result.errorMessage).toBeNull();
    expect(result.sourceName).toBe('Open-Meteo');
  });

  it('staleResult preserva o último dado válido e traz mensagem amigável', () => {
    const result = staleResult({ temp: 24 }, '2026-09-28T10:00:00Z', 'Open-Meteo');
    expect(result.status).toBe('stale');
    expect(result.data).toEqual({ temp: 24 });
    expect(result.lastUpdated).toBe('2026-09-28T10:00:00Z');
    expect(result.errorMessage).toBe(STALE_MESSAGE);
  });

  it('errorResult não expõe dados nem detalhes técnicos', () => {
    const result = errorResult('Google News — São Carlos');
    expect(result.status).toBe('error');
    expect(result.data).toBeNull();
    expect(result.lastUpdated).toBeNull();
    expect(result.errorMessage).toBe(ERROR_MESSAGE);
    // mensagem amigável em pt-BR, sem termos técnicos
    expect(result.errorMessage).not.toMatch(/HTTP|Error|exception|stack/i);
  });
});
