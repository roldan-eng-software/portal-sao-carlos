import contactsSeed from '@/content/contacts.json';
import { isSafeHttpUrl } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

const SOURCE_NAME = 'Contatos úteis do portal';

export interface ContactItem {
  id: string;
  name: string;
  kind: 'servico-publico' | 'contato';
  /** Telefone formatado ou URL http(s). */
  value: string;
  address: string | null;
  hours: string | null;
  officialUrl: string | null;
  urgent: boolean;
}

export function isValidContact(value: unknown): value is ContactItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const isHttp = (v: unknown) => v === null || isSafeHttpUrl(v);
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    item.name.length <= 120 &&
    (item.kind === 'servico-publico' || item.kind === 'contato') &&
    typeof item.value === 'string' &&
    item.value.trim().length > 0 &&
    item.value.length <= 200 &&
    (item.address === null || typeof item.address === 'string') &&
    (item.hours === null || typeof item.hours === 'string') &&
    isHttp(item.officialUrl) &&
    typeof item.urgent === 'boolean'
  );
}

export function loadContacts(): ModuleResult<ContactItem[]> {
  try {
    const rawList: unknown = contactsSeed;
    if (!Array.isArray(rawList)) {
      throw new Error('Arquivo de contatos inválido');
    }
    const valid = rawList.filter(isValidContact);
    if (valid.length !== rawList.length) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'invalid_content_items',
          file: 'content/contacts.json',
          discarded: rawList.length - valid.length,
          at: new Date().toISOString(),
        }),
      );
    }
    return okResult(valid, SOURCE_NAME, new Date());
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'content_load_failure',
        file: 'content/contacts.json',
        error: error instanceof Error ? error.message : String(error),
        at: new Date().toISOString(),
      }),
    );
    return errorResult(SOURCE_NAME);
  }
}
