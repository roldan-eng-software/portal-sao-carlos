import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * env.siteUrl é resolvido no load do módulo — cada caso importa de novo
 * com as env vars do cenário (vi.stubEnv + vi.resetModules).
 * String vazia equivale a ausente (optional() do env.ts trata assim).
 */
async function loadSiteUrl(vars: Record<string, string | undefined>) {
  vi.resetModules();
  vi.stubEnv('SITE_URL', '');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
  vi.stubEnv('VERCEL_URL', '');
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) vi.stubEnv(key, value);
  }
  const { env } = await import('@/config/env');
  return env.siteUrl;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('env.siteUrl — URL canônica', () => {
  it('prioriza SITE_URL explícita (domínio canônico www.meubairro.dev.br)', async () => {
    const url = await loadSiteUrl({
      SITE_URL: 'https://www.meubairro.dev.br',
      VERCEL_PROJECT_PRODUCTION_URL: 'outro-dominio.com',
    });
    expect(url).toBe('https://www.meubairro.dev.br');
  });

  it('normaliza SITE_URL sem protocolo para https', async () => {
    const url = await loadSiteUrl({ SITE_URL: 'www.meubairro.dev.br' });
    expect(url).toBe('https://www.meubairro.dev.br');
  });

  it('cai em VERCEL_PROJECT_PRODUCTION_URL quando SITE_URL está vazia', async () => {
    const url = await loadSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: 'www.meubairro.dev.br',
      VERCEL_URL: 'portal-abc123.vercel.app',
    });
    expect(url).toBe('https://www.meubairro.dev.br');
  });

  it('usa VERCEL_URL (sem https://) como fallback na Vercel sem domínio custom', async () => {
    const url = await loadSiteUrl({ VERCEL_URL: 'portal-abc123.vercel.app' });
    expect(url).toBe('https://portal-abc123.vercel.app');
  });

  it('usa localhost como último recurso (dev local sem env)', async () => {
    const url = await loadSiteUrl({});
    expect(url).toBe('http://localhost:3000');
  });
});
