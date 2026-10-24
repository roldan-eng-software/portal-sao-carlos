import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

/**
 * Rotas de SEO — Spec 02 (SEO técnico base).
 * Garante que o sitemap cobre as páginas públicas (incluindo /anuncie,
 * achado 2 da auditoria) e que nenhuma rota administrativa vaza para o
 * sitemap ou para o robots.txt (achado 1).
 */
describe('sitemap', () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);

  it('inclui as páginas públicas', () => {
    expect(urls).toContain('/');
    expect(urls).toContain('/anuncie');
    expect(urls).toContain('/aviso-editorial');
    expect(urls).toContain('/politica-de-privacidade');
  });

  it('nunca inclui rotas administrativas ou de API', () => {
    expect(urls.some((url) => url.startsWith('/admin'))).toBe(false);
    expect(urls.some((url) => url.startsWith('/api'))).toBe(false);
  });

  it('usa URLs canônicas absolutas', () => {
    for (const entry of sitemap()) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });
});

describe('robots', () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];

  it('permite o rastreio das páginas públicas', () => {
    expect(rules).toEqual(
      expect.arrayContaining([expect.objectContaining({ allow: '/' })]),
    );
  });

  it('bloqueia /admin e /api/admin', () => {
    const disallow = rules.flatMap((rule) => rule.disallow ?? []);
    expect(disallow).toContain('/admin');
    expect(disallow).toContain('/api/admin');
  });

  it('referencia o sitemap', () => {
    expect(config.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
