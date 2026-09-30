import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNotices } from '@/modules/notices/adapter';

/**
 * Curadoria fixa para o teste: o arquivo real de conteúdo muda com a
 * editorial (novos avisos, arquivamentos) e o teste não deve depender dele.
 * Inclui um item `arquivado` para garantir que ele nunca chegue à UI.
 */
vi.mock('@/content/notices.json', () => ({
  default: [
    {
      id: 'fixture-manutencao',
      title: 'Aviso curado de manutenção na rede',
      summary: 'Resumo do informativo curado para teste de composição.',
      date: '2026-09-27',
      sourceName: 'Conteúdo de exemplo',
      sourceUrl: null,
      status: 'publicado',
      kind: 'informativo',
    },
    {
      id: 'fixture-coleta',
      title: 'Aviso curado de coleta seletiva',
      summary: 'Segundo informativo curado para teste de composição.',
      date: '2026-09-25',
      sourceName: 'Conteúdo de exemplo',
      sourceUrl: null,
      status: 'publicado',
      kind: 'informativo',
    },
    {
      id: 'fixture-arquivado',
      title: 'Aviso arquivado que não deve aparecer',
      summary: 'Item com status arquivado — fora da exibição.',
      date: '2026-09-20',
      sourceName: 'Conteúdo de exemplo',
      sourceUrl: null,
      status: 'arquivado',
      kind: 'informativo',
    },
  ],
}));

const SAAE_ITEM = {
  title: 'SAAE INFORMA INTERDIÇÃO NA VILA SÃO JOSÉ',
  link: 'https://saaesaocarlos.com.br/2026/09/29/interdicao-vila-sao-jose/',
  pubDate: 'Tue, 29 Sep 2026 09:15:00 -0300',
  description: 'Troca de ligação de água e esgoto na Rua Dr. Walter, das 8h às 11h.',
};

function rssXml(item: typeof SAAE_ITEM): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel><title>SAAE – São Carlos</title>',
    '<item>',
    `<title><![CDATA[${item.title}]]></title>`,
    `<link>${item.link}</link>`,
    `<guid isPermaLink="false">${item.link}</guid>`,
    `<pubDate>${item.pubDate}</pubDate>`,
    `<description><![CDATA[${item.description}]]></description>`,
    '</item>',
    '</channel></rss>',
  ].join('');
}

function xmlResponse(xml: string): Response {
  return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/rss+xml' } });
}

/**
 * Cenário quickstart V5 para o módulo informativos: o feed do SAAE é fonte
 * externa e segue o mesmo isolamento dos demais adapters (SC-004/FR-012/FR-013).
 * Ordem importa: o caso "falha sem histórico" roda antes de semear o cache em
 * memória (`notices-feed`).
 */
describe('isolamento de falha do feed de informativos', () => {
  beforeEach(() => {
    // loadNotices registra warn ao descartar o fixture arquivado — esperado.
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('falha sem histórico do feed → curadoria publicada segue em ok', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede indisponível')));

    const result = await getNotices();
    expect(result.status).toBe('ok');
    expect(result.errorMessage).toBeNull();
    const items = result.data ?? [];
    // apenas os 2 itens curados publicados; o arquivado nunca aparece
    expect(items.length).toBe(2);
    expect(items.some((item) => item.id === 'fixture-arquivado')).toBe(false);
    expect(items.every((item) => item.sourceName !== 'SAAE São Carlos')).toBe(true);
  });

  it('feed ok → ok com curadoria + avisos do SAAE, mais recentes primeiro', async () => {
    const fetchMock = vi.fn().mockResolvedValue(xmlResponse(rssXml(SAAE_ITEM)));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getNotices();
    expect(fetchMock).toHaveBeenCalledWith('https://saaesaocarlos.com.br/feed/', expect.anything());
    expect(result.status).toBe('ok');
    expect(result.errorMessage).toBeNull();

    const items = result.data ?? [];
    // curadoria (2 itens publicados) + 1 aviso do SAAE
    expect(items.length).toBe(3);
    // ordenação decrescente por data: 29/09 do SAAE antes de 27/09 curado
    expect(items[0].sourceName).toBe('SAAE São Carlos');
    expect(items[0].kind).toBe('informativo');
    expect(items[0].sourceUrl).toBe(SAAE_ITEM.link);
    expect(items[0].date).toBe('2026-09-29');
    expect(items[1].id).toBe('fixture-manutencao');
    expect(result.sourceName).toContain('SAAE São Carlos');
    expect(result.sourceName).toContain('Informativos do portal');
  });

  it('sucesso seguido de falha → stale com curadoria + último aviso do SAAE', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede indisponível')));

    const result = await getNotices();
    expect(result.status).toBe('stale');
    expect(result.errorMessage).toMatch(/temporariamente indisponível/i);
    expect(result.lastUpdated).toBeTruthy();

    const items = result.data ?? [];
    expect(items.length).toBe(3);
    expect(items[0].sourceName).toBe('SAAE São Carlos');
  });
});
