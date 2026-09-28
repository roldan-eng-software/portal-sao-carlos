/**
 * Envelope compartilhado de todo módulo de conteúdo (data-model.md).
 * A UI consome somente este formato — nunca respostas brutas de fontes.
 */

export type ModuleStatus = 'ok' | 'stale' | 'error';

export interface ModuleResult<T> {
  status: ModuleStatus;
  data: T | null;
  /** ISO 8601 da última atualização bem-sucedida; exibido ao visitante (FR-012). */
  lastUpdated: string | null;
  /** Mensagem amigável em pt-BR; nunca detalhe técnico (gate 10). */
  errorMessage: string | null;
  /** Nome da fonte exibida ao visitante quando apropriado. */
  sourceName: string | null;
}

export const STALE_MESSAGE =
  'Atualização temporariamente indisponível. Exibindo o último conteúdo conhecido.';

export const ERROR_MESSAGE =
  'Não foi possível atualizar esta informação agora. Tente novamente em alguns minutos.';

export function okResult<T>(data: T, sourceName: string, at: Date = new Date()): ModuleResult<T> {
  return {
    status: 'ok',
    data,
    lastUpdated: at.toISOString(),
    errorMessage: null,
    sourceName,
  };
}

export function staleResult<T>(
  data: T,
  lastUpdated: string | null,
  sourceName: string,
  errorMessage: string = STALE_MESSAGE,
): ModuleResult<T> {
  return { status: 'stale', data, lastUpdated, errorMessage, sourceName };
}

export function errorResult<T>(sourceName: string, errorMessage: string = ERROR_MESSAGE): ModuleResult<T> {
  return { status: 'error', data: null, lastUpdated: null, errorMessage, sourceName };
}
