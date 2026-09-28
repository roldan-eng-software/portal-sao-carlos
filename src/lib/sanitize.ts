/**
 * Sanitização de conteúdo vindo de fontes externas (gate 11 da constituição):
 * todo texto é convertido para TEXTO PURO antes de qualquer exibição.
 * `dangerouslySetInnerHTML` é proibido no projeto — este módulo é o único
 * caminho para conteúdo de terceiros chegar à UI.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
};

function safeFromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return ' ';
  try {
    return String.fromCodePoint(code);
  } catch {
    return ' ';
  }
}

/** Remove toda estrutura HTML (incluindo script/style) e devolve texto puro. */
export function stripHtml(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0) return '';
  let text = input.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) =>
    safeFromCodePoint(Number.parseInt(hex, 16)),
  );
  text = text.replace(/&#(\d+);/g, (_m, dec: string) => safeFromCodePoint(Number(dec)));
  text = text.replace(/&([a-z]+);/gi, (_m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? ' ');
  text = text.replace(/\s+/g, ' ');
  // remove espaços órfãos deixados pela remoção de tags junto à pontuação
  text = text.replace(/\s+([.,;:!?])/g, '$1');
  text = text.replace(/([(\[])\s+/g, '$1');
  return text.trim();
}

/** Sanitiza e trunca em `maxLength` caracteres, reticuando na pontuação. */
export function sanitizeToLength(input: unknown, maxLength: number): string {
  const text = stripHtml(input);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

/** Aceita somente URLs http/https absolutas válidas. */
export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
