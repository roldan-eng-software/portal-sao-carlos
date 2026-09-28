import { describe, expect, it } from 'vitest';
import { SUMMARY_MAX, TITLE_MAX, normalizeNewsItem } from '@/modules/news/normalize';

const collectedAt = new Date('2026-09-28T12:00:00Z');

describe('normalizeNewsItem', () => {
  it('normaliza um item válido completo', () => {
    const item = normalizeNewsItem(
      {
        title: 'Prefeitura anuncia obras em bairros de São Carlos',
        link: 'https://exemplo.com/noticia/1',
        pubDate: 'Sun, 28 Sep 2026 10:00:00 GMT',
        description: '<p>Resumo da notícia com <b>formatação</b>.</p>',
        source: 'Portal de notícias',
      },
      'Feed padrão',
      collectedAt,
    );
    expect(item).not.toBeNull();
    expect(item!.title).toBe('Prefeitura anuncia obras em bairros de São Carlos');
    expect(item!.summary).toBe('Resumo da notícia com formatação.');
    expect(item!.publishedAt).toBe('2026-09-28T10:00:00.000Z');
    expect(item!.sourceName).toBe('Portal de notícias');
    expect(item!.url).toBe('https://exemplo.com/noticia/1');
  });

  it('usa o nome do feed quando o item não informa fonte', () => {
    const item = normalizeNewsItem(
      { title: 'Notícia sem fonte explícita', link: 'https://exemplo.com/n' },
      'Google News — São Carlos',
      collectedAt,
    );
    expect(item!.sourceName).toBe('Google News — São Carlos');
  });

  it('descarta item sem URL ou com protocolo inseguro', () => {
    expect(normalizeNewsItem({ title: 'Sem link' }, 'Feed', collectedAt)).toBeNull();
    expect(
      normalizeNewsItem({ title: 'Link inseguro', link: 'javascript:alert(1)' }, 'Feed', collectedAt),
    ).toBeNull();
  });

  it('descarta item sem título', () => {
    expect(normalizeNewsItem({ link: 'https://exemplo.com' }, 'Feed', collectedAt)).toBeNull();
  });

  it('trunca título em 200 chars e resumo em 500 chars', () => {
    const item = normalizeNewsItem(
      {
        title: 'x'.repeat(300),
        link: 'https://exemplo.com/t',
        description: 'y'.repeat(700),
      },
      'Feed',
      collectedAt,
    );
    expect(item!.title.length).toBe(TITLE_MAX);
    expect(item!.title.endsWith('…')).toBe(true);
    expect(item!.summary.length).toBe(SUMMARY_MAX);
    expect(item!.summary.endsWith('…')).toBe(true);
  });

  it('usa a data de coleta quando o item não tem data válida', () => {
    const item = normalizeNewsItem(
      { title: 'Sem data', link: 'https://exemplo.com/sd', pubDate: 'data-invalida' },
      'Feed',
      collectedAt,
    );
    expect(item!.publishedAt).toBe(collectedAt.toISOString());
  });

  it('remove HTML do título e do resumo', () => {
    const item = normalizeNewsItem(
      {
        title: '<script>alert(1)</script>Título <em>limpo</em>',
        link: 'https://exemplo.com/x',
        description: '<img src=x onerror=alert(1)>Resumo',
      },
      'Feed',
      collectedAt,
    );
    expect(item!.title).not.toContain('<');
    expect(item!.title).toBe('Título limpo');
    expect(item!.summary).toBe('Resumo');
  });
});
