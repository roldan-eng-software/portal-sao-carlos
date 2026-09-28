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
 * versionada — gate 6). Itens inválidos são descartados; JSON corrompido
 * resulta em `error` amigável, nunca em quebra de página (FR-013).
 */
export function loadNotices(): ModuleResult<Notice[]> {
  try {
    const rawList: unknown = noticesSeed;
    if (!Array.isArray(rawList)) {
      throw new Error('Arquivo de informativos inválido');
    }
    const published = rawList.filter(isValidNotice).filter((item) => item.status === 'publicado');
    if (published.length !== rawList.length) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'invalid_content_items',
          file: 'content/notices.json',
          discarded: rawList.length - published.length,
          at: new Date().toISOString(),
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
