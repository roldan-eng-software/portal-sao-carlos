import promoSeed from '@/content/promo.json';
import { sanitizeToLength } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

const SOURCE_NAME = 'Divulgações do portal';

export interface Promo {
  id: string;
  kind: 'divulgacao-propria';
  /** 1–120 chars */
  title: string;
  /** 1–400 chars, texto puro */
  text: string;
  /** Rótulo obrigatório de publicidade (FR-007) */
  label: string;
  url: string | null;
  status: 'publicado' | 'oculto';
}

export function isValidPromo(value: unknown): value is Promo {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    item.kind === 'divulgacao-propria' &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    item.title.length <= 120 &&
    typeof item.text === 'string' &&
    item.text.trim().length > 0 &&
    item.text.length <= 400 &&
    typeof item.label === 'string' &&
    item.label.trim().length > 0 &&
    (item.url === null || typeof item.url === 'string') &&
    (item.status === 'publicado' || item.status === 'oculto')
  );
}

export function loadPromo(): ModuleResult<Promo[]> {
  try {
    const rawList: unknown = promoSeed;
    if (!Array.isArray(rawList)) {
      throw new Error('Arquivo de divulgações inválido');
    }
    const published = rawList.filter(isValidPromo).filter((item) => item.status === 'publicado');
    return okResult(
      published.map((item) => ({
        ...item,
        title: sanitizeToLength(item.title, 120),
        text: sanitizeToLength(item.text, 400),
      })),
      SOURCE_NAME,
      new Date(),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'content_load_failure',
        file: 'content/promo.json',
        error: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
    return errorResult(SOURCE_NAME);
  }
}
