import { afterEach, describe, expect, it, vi } from 'vitest';
import { isValidNotice, loadNotices, type Notice } from '@/modules/notices/loader';

const publicado: Notice = {
  id: 'aviso-publicado',
  title: 'Aviso de manutenção na rede',
  summary: 'Resumo do aviso publicado para o teste do loader.',
  date: '2026-10-01',
  sourceName: 'SAAE São Carlos',
  sourceUrl: 'https://example.com/aviso',
  status: 'publicado',
  kind: 'informativo',
};

const arquivado: Notice = {
  ...publicado,
  id: 'aviso-arquivado',
  title: 'Aviso antigo já encerrado',
  date: '2026-09-01',
  status: 'arquivado',
};

/** Lê o payload JSON do log estruturado mais recente de um spy. */
function lastLog(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> | null {
  const call = spy.mock.calls.at(-1);
  if (!call || typeof call[0] !== 'string') return null;
  try {
    return JSON.parse(call[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

describe('isValidNotice (constraints do data-model.md)', () => {
  it('aceita item publicado completo', () => {
    expect(isValidNotice(publicado)).toBe(true);
  });

  it('também aceita status arquivado (estado válido do enum)', () => {
    expect(isValidNotice(arquivado)).toBe(true);
  });

  it('title: 1–200 chars obrigatório', () => {
    expect(isValidNotice({ ...publicado, title: '' })).toBe(false);
    expect(isValidNotice({ ...publicado, title: 'x'.repeat(201) })).toBe(false);
  });

  it('date: formato YYYY-MM-DD obrigatório', () => {
    expect(isValidNotice({ ...publicado, date: '01/10/2026' })).toBe(false);
    expect(isValidNotice({ ...publicado, date: '2026-10-01' })).toBe(true);
  });

  it('rejeita sourceUrl com protocolo inseguro', () => {
    expect(isValidNotice({ ...publicado, sourceUrl: 'javascript:alert(1)' })).toBe(false);
  });

  it('rejeita status fora do enum', () => {
    expect(isValidNotice({ ...publicado, status: 'rascunho' })).toBe(false);
  });
});

describe('loadNotices', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mantém apenas itens publicados, ordenados por data (mais recente primeiro)', () => {
    const maisRecente = { ...publicado, id: 'novo', date: '2026-10-05' };
    const result = loadNotices([publicado, maisRecente, arquivado]);
    expect(result.status).toBe('ok');
    expect(result.data?.map((item) => item.id)).toEqual(['novo', 'aviso-publicado']);
  });

  it('item arquivado válido NÃO gera warn — registra apenas info (archived_content_items)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = loadNotices([publicado, arquivado]);

    expect(result.status).toBe('ok');
    expect(warn).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
    expect(lastLog(info)).toMatchObject({ level: 'info', event: 'archived_content_items', archived: 1 });
  });

  it('item inválido gera warn invalid_content_items com a contagem de descartes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});

    const invalido = { ...publicado, id: 'invalido', title: '' };
    const result = loadNotices([publicado, invalido, { ...publicado, id: 'outro-invalido', date: 'x' }]);

    expect(result.status).toBe('ok');
    expect(result.data).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(lastLog(warn)).toMatchObject({
      level: 'warn',
      event: 'invalid_content_items',
      discarded: 2,
    });
  });

  it('inválido e arquivado no mesmo lote: warn para inválidos e info para arquivados', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    loadNotices([publicado, arquivado, { ...publicado, id: 'quebrado', summary: '' }]);

    expect(lastLog(warn)).toMatchObject({ event: 'invalid_content_items', discarded: 1 });
    expect(lastLog(info)).toMatchObject({ event: 'archived_content_items', archived: 1 });
  });

  it('entrada não-array resulta em error amigável, nunca exceção', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = loadNotices('não é uma lista');

    expect(result.status).toBe('error');
    expect(result.data).toBeNull();
    expect(result.errorMessage).toBeTruthy();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('lista vazia resulta em ok sem itens', () => {
    const result = loadNotices([]);
    expect(result.status).toBe('ok');
    expect(result.data).toEqual([]);
  });
});
