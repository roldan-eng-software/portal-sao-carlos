import { describe, expect, it } from 'vitest';
import { isValidAd, selectPublishedAds } from '@/modules/ads/loader';

const baseAd = {
  id: 'ad-teste',
  kind: 'anuncio-gratuito',
  businessName: 'Comércio de Teste',
  category: 'Serviços',
  description: 'Descrição de teste.',
  neighborhood: 'Centro',
  phone: '(16) 3000-0000',
  whatsapp: null,
  url: null,
  hours: null,
  status: 'publicado',
  publishedAt: '2026-09-20',
  expiresAt: null,
};

describe('isValidAd (constraints do data-model.md)', () => {
  it('aceita anúncio gratuito válido com ao menos um contato', () => {
    expect(isValidAd(baseAd)).toBe(true);
  });

  it('businessName: 1–100 chars obrigatório', () => {
    expect(isValidAd({ ...baseAd, businessName: '' })).toBe(false);
    expect(isValidAd({ ...baseAd, businessName: 'x'.repeat(101) })).toBe(false);
    expect(isValidAd({ ...baseAd, businessName: 'x'.repeat(100) })).toBe(true);
  });

  it('description: 1–300 chars obrigatório', () => {
    expect(isValidAd({ ...baseAd, description: '' })).toBe(false);
    expect(isValidAd({ ...baseAd, description: 'x'.repeat(301) })).toBe(false);
  });

  it('rejeita anúncio sem nenhum contato (phone/whatsapp/url)', () => {
    expect(isValidAd({ ...baseAd, phone: null, whatsapp: null, url: null })).toBe(false);
  });

  it('rejeita status fora do enum', () => {
    expect(isValidAd({ ...baseAd, status: 'auto-publicado' })).toBe(false);
  });

  it('exige publishedAt válido quando status é publicado', () => {
    expect(isValidAd({ ...baseAd, publishedAt: null })).toBe(false);
    expect(isValidAd({ ...baseAd, publishedAt: '20/09/2026' })).toBe(false);
    expect(isValidAd({ ...baseAd, publishedAt: '2026-09-20' })).toBe(true);
  });

  it('rejeita url com protocolo inseguro', () => {
    expect(isValidAd({ ...baseAd, url: 'javascript:alert(1)' })).toBe(false);
  });
});

describe('selectPublishedAds', () => {
  const rascunho = { ...baseAd, id: 'rascunho', status: 'rascunho', publishedAt: null };
  const expirado = {
    ...baseAd,
    id: 'expirado',
    kind: 'anuncio-patrocinado',
    expiresAt: '2020-01-01',
    publishedAt: '2026-01-01',
  };
  const patrocinado = {
    ...baseAd,
    id: 'patrocinado',
    kind: 'anuncio-patrocinado',
    expiresAt: '2026-12-31',
    publishedAt: '2026-09-01',
  };
  const gratuito = { ...baseAd, id: 'gratuito', publishedAt: '2026-09-22' };

  it('exibe apenas publicados e não vencidos', () => {
    const result = selectPublishedAds([baseAd, rascunho, expirado], '2026-09-28');
    const ids = result.map((ad) => ad.id);
    expect(ids).toContain('ad-teste');
    expect(ids).not.toContain('rascunho');
    expect(ids).not.toContain('expirado');
  });

  it('ordena patrocinados antes dos gratuitos (destaque)', () => {
    const result = selectPublishedAds([gratuito, patrocinado], '2026-09-28');
    expect(result[0].kind).toBe('anuncio-patrocinado');
    expect(result[1].kind).toBe('anuncio-gratuito');
  });

  it('ignora itens inválidos sem derrubar o lote', () => {
    const invalido = { ...baseAd, id: 'invalido', businessName: '' };
    const result = selectPublishedAds([baseAd, invalido], '2026-09-28');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ad-teste');
  });
});
