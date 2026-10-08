import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNews } from '@/modules/news/adapter';

/** Fixtures reais capturadas em 2026-10-08 (research.md, R3.1). */
const scaXml = readFileSync(join(process.cwd(), 'tests/fixtures/sao-carlos-agora.xml'), 'utf8');
const g1Xml = readFileSync(
  join(process.cwd(), 'tests/fixtures/g1-sao-carlos-regiao.xml'),
  'utf8',
);

/**
 * Google News: uma matéria é a MESMA do São Carlos Agora com o sufixo de
 * saída do agregador (deve ser deduplicada, mantendo o link direto) e uma
 * é exclusiva (deve ser mantida).
 */
const DUPLICATA_SCA =
  'Veja o que abre e fecha no feriado de 12 de outubro';
const googleNewsXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Google News</title>
<item>
  <title>${DUPLICATA_SCA} - G1</title>
  <link>https://news.google.com/rss/articles/abc123</link>
  <pubDate>Thu, 08 Oct 2026 12:00:00 GMT</pubDate>
</item>
<item>
  <title>Novo posto de saúde é inaugurado em São Carlos</title>
  <link>https://news.google.com/rss/articles/def456</link>
  <pubDate>Thu, 08 Oct 2026 11:00:00 GMT</pubDate>
</item>
</channel></rss>`;

function xmlResponse(body: string): Response {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml' } });
}

describe('composição das fontes de notícias (3 feeds)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('filtra o G1 por "São Carlos", deduplica o agregador e mantém link direto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('saocarlosagora')) return xmlResponse(scaXml);
        if (url.includes('g1.globo.com')) return xmlResponse(g1Xml);
        if (url.includes('news.google.com')) return xmlResponse(googleNewsXml);
        throw new Error(`URL inesperada no teste: ${url}`);
      }),
    );

    const result = await getNews();
    expect(result.status).toBe('ok');
    const items = result.data ?? [];

    // Fontes todas alcançadas e identificadas
    expect(result.sourceName).toContain('São Carlos Agora');
    expect(result.sourceName).toContain('G1');
    expect(result.sourceName).toContain('Google News');

    // Filtro do G1: nenhum item do G1 sem "São Carlos" no título
    const g1Items = items.filter((item) => item.url.includes('g1.globo.com'));
    expect(g1Items.length).toBeGreaterThanOrEqual(5);
    expect(g1Items.length).toBeLessThanOrEqual(10);
    for (const item of g1Items) {
      expect(item.title.toLowerCase()).toContain('são carlos');
    }

    // Dedupe: a cópia agregadora da matéria do SCA foi descartada…
    expect(items.some((item) => item.title.includes('- G1'))).toBe(false);
    // …e o vencedor é o link direto do SCA…
    const feriado = items.filter((item) => item.title === DUPLICATA_SCA);
    expect(feriado).toHaveLength(1);
    expect(feriado[0].url).toContain('saocarlosagora.com.br');

    // …enquanto a matéria exclusiva do agregador permanece
    expect(items.some((item) => item.url.includes('news.google.com'))).toBe(true);

    // Limites do módulo preservados
    expect(items.length).toBeLessThanOrEqual(20);
  });
});
