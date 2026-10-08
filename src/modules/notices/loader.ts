import noticesSeed from '@/content/notices.json';
import { sanitizeToLength, isSafeHttpUrl } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

const SOURCE_NAME = 'Informativos do portal';

export interface Notice {
  id: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD */
  date: string;
  sourceName: string;
  sourceUrl: string | null;
  status: 'publicado' | 'arquivado';
  kind: 'informativo' | 'servico-publico';
}

/** Valida um item crudo de content/notices.json (constraints do data-model.md). */
export function isValidNotice(value: unknown): value is Notice {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const hasText = (field: unknown, max: number): boolean =>
    typeof field === 'string' && field.trim().length > 0 && field.length <= max;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    hasText(item.title, 200) &&
    hasText(item.summary, 500) &&
    typeof item.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
    typeof item.sourceName === 'string' &&
    item.sourceName.trim().length > 0 &&
    (item.sourceUrl === null || isSafeHttpUrl(item.sourceUrl)) &&
    (item.status === 'publicado' || item.status === 'arquivado') &&
    (item.kind === 'informativo' || item.kind === 'servico-publico')
  );
}

/**
 * Carrega e valida os informativos curados (moderação manual por edição
 * versionada — gate 6). Itens inválidos são descartados com `warn`;
 * itens válidos com status `arquivado` são estado legítimo do modelo e
 * registram apenas `info` (não são conteúdo inválido). JSON corrompido
 * resulta em `error` amigável, nunca em quebra de página (FR-013).
 *
 * `rawList` é opcional e existe para os testes injetarem cenários sem
 * depender do seed versionado.
 */
export function loadNotices(rawList: unknown = noticesSeed): ModuleResult<Notice[]> {
  try {
    if (!Array.isArray(rawList)) {
      throw new Error('Arquivo de informativos inválido');
    }
    const valid = rawList.filter(isValidNotice);
    const invalid = rawList.length - valid.length;
    const published = valid.filter((item) => item.status === 'publicado');
    const archived = valid.length - published.length;
    const at = new Date().toISOString();
    if (invalid > 0) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'invalid_content_items',
          file: 'content/notices.json',
          discarded: invalid,
          at,
        }),
      );
    }
    if (archived > 0) {
      console.info(
        JSON.stringify({
          level: 'info',
          event: 'archived_content_items',
          file: 'content/notices.json',
          archived,
          at,
        }),
      );
    }
    const sorted = [...published].sort((a, b) => b.date.localeCompare(a.date));
    const lastDate = sorted[0]?.date;
    return okResult(sorted, SOURCE_NAME, lastDate ? new Date(`${lastDate}T12:00:00Z`) : new Date());
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'content_load_failure',
        file: 'content/notices.json',
        error: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
    return errorResult(SOURCE_NAME);
  }
}

export { sanitizeToLength };
