import { describe, expect, it } from 'vitest';
import { normalizeNoticeItem } from '@/modules/notices/normalize';

const feed = { id: 'saae-sao-carlos', displayName: 'SAAE São Carlos' };
const collectedAt = new Date('2026-09-30T12:00:00Z');
const link = 'https://saaesaocarlos.com.br/2026/09/29/interdicao-vila-sao-jose/';

describe('normalizeNoticeItem', () => {
  it('normaliza um item válido do feed para o modelo Notice', () => {
    const item = normalizeNoticeItem(
      {
        title: 'SAAE informa interdição na Vila São José',
        link,
        guid: link,
        pubDate: 'Tue, 29 Sep 2026 09:15:00 -0300',
        description: '<p>Interação na Rua Dr. Walter, das <strong>8h às 11h</strong>.</p>',
      },
      feed,
      collectedAt,
    );

    expect(item).not.toBeNull();
    expect(item!.title).toBe('SAAE informa interdição na Vila São José');
    expect(item!.summary).toBe('Interação na Rua Dr. Walter, das 8h às 11h.');
    expect(item!.date).toBe('2026-09-29');
    expect(item!.sourceName).toBe('SAAE São Carlos');
    expect(item!.sourceUrl).toBe(link);
    expect(item!.status).toBe('publicado');
    expect(item!.kind).toBe('informativo');
    expect(item!.id).toBe(
      'saae-sao-carlos-saaesaocarlos-com-br-2026-09-29-interdicao-vila-sao-jose',
    );
  });

  it('interpreta a data no fuso de São Paulo (comunicado à noite não pula de dia)', () => {
    // 29/09 22:00 em SP = 30/09 01:00 em UTC — a data exibida deve ser 29/09.
    const item = normalizeNoticeItem(
      { title: 'Aviso noturno', link, pubDate: 'Tue, 29 Sep 2026 22:00:00 -0300' },
      feed,
      collectedAt,
    );
    expect(item!.date).toBe('2026-09-29');
  });

  it('usa a data da coleta quando o item não traz data', () => {
    const item = normalizeNoticeItem({ title: 'Aviso sem data', link }, feed, collectedAt);
    expect(item!.date).toBe('2026-09-30');
  });

  it('cai para content:encoded quando description está vazia', () => {
    const item = normalizeNoticeItem(
      {
        title: 'Aviso com corpo completo',
        link,
        description: '',
        'content:encoded': '<p>Corpo do aviso com <a href="https://example.com">link</a>.</p>',
      },
      feed,
      collectedAt,
    );
    expect(item!.summary).toBe('Corpo do aviso com link.');
  });

  it('usa o título como resumo quando o item não traz descrição', () => {
    const item = normalizeNoticeItem({ title: 'Só o título do aviso', link }, feed, collectedAt);
    expect(item!.summary).toBe('Só o título do aviso');
  });

  it('trunca o resumo no limite do modelo (500 chars)', () => {
    const item = normalizeNoticeItem(
      { title: 'Aviso longo', link, description: 'A'.repeat(600) },
      feed,
      collectedAt,
    );
    expect(item!.summary.length).toBeLessThanOrEqual(500);
    expect(item!.summary.endsWith('…')).toBe(true);
  });

  it('descarta item sem link ou com protocolo inseguro (gate 13)', () => {
    expect(normalizeNoticeItem({ title: 'Sem link' }, feed, collectedAt)).toBeNull();
    expect(
      normalizeNoticeItem(
        { title: 'Link inseguro', link: 'javascript:alert(1)' },
        feed,
        collectedAt,
      ),
    ).toBeNull();
  });

  it('descarta item sem título', () => {
    expect(normalizeNoticeItem({ title: '   ', link }, feed, collectedAt)).toBeNull();
  });
});
