import contactsSeed from '@/content/contacts.json';
import { isSafeHttpUrl } from '@/lib/sanitize';
import { errorResult, okResult, type ModuleResult } from '@/lib/module-result';

const SOURCE_NAME = 'Contatos úteis do portal';

/** Categorias fixas de agrupamento da página de telefones úteis (Spec 05). */
export const CONTACT_CATEGORIES = [
  'emergencia',
  'agua-e-esgoto',
  'energia-e-gas',
  'saude',
  'seguranca',
  'transporte',
  'prefeitura-e-servicos',
  'outras-informacoes',
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

/** Títulos de categoria exibidos ao visitante (pt-BR). */
export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  emergencia: 'Emergência',
  'agua-e-esgoto': 'Água e esgoto (SAAE)',
  'energia-e-gas': 'Energia elétrica (CPFL)',
  saude: 'Saúde',
  seguranca: 'Segurança pública',
  transporte: 'Transporte',
  'prefeitura-e-servicos': 'Prefeitura e serviços municipais',
  'outras-informacoes': 'Outras informações úteis',
};

export interface ContactItem {
  id: string;
  name: string;
  kind: 'servico-publico' | 'contato';
  /** Agrupamento na página de telefones úteis (categorização é manual no JSON). */
  category: ContactCategory;
  /** Telefone formatado ou URL http(s). */
  value: string;
  address: string | null;
  hours: string | null;
  officialUrl: string | null;
  urgent: boolean;
  /** true = também exibido na seção de contatos da home (composição fixa de 4 tiles). */
  homeSection: boolean;
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
    typeof item.category === 'string' &&
    (CONTACT_CATEGORIES as readonly string[]).includes(item.category) &&
    typeof item.value === 'string' &&
    item.value.trim().length > 0 &&
    item.value.length <= 200 &&
    (item.address === null || typeof item.address === 'string') &&
    (item.hours === null || typeof item.hours === 'string') &&
    isHttp(item.officialUrl) &&
    typeof item.urgent === 'boolean' &&
    typeof item.homeSection === 'boolean'
  );
}

export function loadContacts(): ModuleResult<ContactItem[]> {
  try {
    const raw = contactsSeed as { items?: unknown[]; _meta?: unknown };
    const rawList = Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw) ? raw : []);
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