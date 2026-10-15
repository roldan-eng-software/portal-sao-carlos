/**
 * Validação compartilhada para anúncios (formulário público + loader).
 * Replica as regras de `src/modules/ads/loader.ts` (`isValidAd`)
 * e usa `src/lib/sanitize.ts` para sanitização.
 */

import { stripHtml, isSafeHttpUrl } from './sanitize';

export const AD_KINDS = ['anuncio-gratuito', 'anuncio-patrocinado'] as const;
export type AdKind = (typeof AD_KINDS)[number];

export const AD_STATUSES = ['rascunho', 'publicado', 'suspenso', 'removido'] as const;
export type AdStatus = (typeof AD_STATUSES)[number];

export const AD_CATEGORIES = [
  'Alimentação',
  'Mecânica',
  'Móveis',
  'Animais de estimação',
  'Varejo',
  'Serviços',
  'Saúde',
  'Beleza',
  'Educação',
  'Automotivo',
  'Construção',
  'Tecnologia',
  'Outros',
] as const;

export type AdCategory = (typeof AD_CATEGORIES)[number];

export interface AdFormData {
  kind: AdKind;
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone?: string;
  whatsapp?: string;
  url?: string;
  hours?: string;
  contactEmail: string;
  // honeypot field (deve vir vazio)
  website?: string;
}

export interface AdValidationError {
  field: string;
  message: string;
}

export interface ValidatedAdData {
  id: string;
  kind: AdKind;
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
  imageUrl: null;
  status: 'rascunho';
  publishedAt: null;
  expiresAt: null;
  submittedAt: string;
  contactEmail: string;
}

/** Gera slug único para ID do anúncio */
export function generateAdId(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/** Sanitiza e valida um campo de texto simples */
function validateTextField(
  value: unknown,
  fieldName: string,
  minLength: number,
  maxLength: number,
  required: boolean,
): { sanitized: string | null; error?: string } {
  const str = typeof value === 'string' ? value.trim() : '';
  if (required && str.length === 0) {
    return { sanitized: null, error: `${fieldName} é obrigatório.` };
  }
  if (str.length === 0) {
    return { sanitized: null, error: undefined };
  }
  if (str.length < minLength) {
    return { sanitized: null, error: `${fieldName} deve ter pelo menos ${minLength} caracteres.` };
  }
  if (str.length > maxLength) {
    return { sanitized: null, error: `${fieldName} deve ter no máximo ${maxLength} caracteres.` };
  }
  // Sanitiza: remove HTML e entidades
  const sanitized = stripHtml(str);
  return { sanitized, error: undefined };
}

/** Valida URL (http/https apenas) */
function validateUrlField(value: unknown, fieldName: string): { sanitized: string | null; error?: string } {
  const str = typeof value === 'string' ? value.trim() : '';
  if (str.length === 0) {
    return { sanitized: null, error: undefined };
  }
  if (!isSafeHttpUrl(str)) {
    return { sanitized: null, error: `${fieldName} deve ser uma URL válida (http ou https).` };
  }
  return { sanitized: str, error: undefined };
}

/** Valida e-mail básico */
function validateEmail(value: unknown, fieldName: string): { sanitized: string | null; error?: string } {
  const str = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (str.length === 0) {
    return { sanitized: null, error: `${fieldName} é obrigatório.` };
  }
  // Regex simples para e-mail (RFC 5322 simplificado)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) {
    return { sanitized: null, error: `${fieldName} inválido.` };
  }
  return { sanitized: str, error: undefined };
}

/** Valida telefone/WhatsApp (apenas dígitos, comprimento) */
function validatePhoneField(value: unknown, fieldName: string, maxLen: number): { sanitized: string | null; error?: string } {
  const str = typeof value === 'string' ? value.trim() : '';
  if (str.length === 0) {
    return { sanitized: null, error: undefined };
  }
  // Remove tudo que não for dígito
  const digits = str.replace(/\D/g, '');
  if (digits.length < 8) {
    return { sanitized: null, error: `${fieldName} deve ter pelo menos 8 dígitos.` };
  }
  if (digits.length > maxLen) {
    return { sanitized: null, error: `${fieldName} deve ter no máximo ${maxLen} dígitos.` };
  }
  return { sanitized: digits, error: undefined };
}

/** Valida kind (enum fixo) */
function validateKind(value: unknown): { sanitized: AdKind | null; error?: string } {
  if (typeof value === 'string' && AD_KINDS.includes(value as AdKind)) {
    return { sanitized: value as AdKind, error: undefined };
  }
  return { sanitized: null, error: 'Tipo de anúncio inválido. Escolha: anuncio-gratuito ou anuncio-patrocinado.' };
}

/** Valida categoria (deve estar na lista permitida) */
function validateCategory(value: unknown): { sanitized: string | null; error?: string } {
  const str = typeof value === 'string' ? value.trim() : '';
  if (str.length === 0) {
    return { sanitized: null, error: 'Categoria é obrigatória.' };
  }
  if (!AD_CATEGORIES.includes(str as AdCategory)) {
    return { sanitized: null, error: `Categoria inválida. Opções: ${AD_CATEGORIES.join(', ')}` };
  }
  return { sanitized: str, error: undefined };
}

/** Validação principal do formulário */
export function validateAdFormData(data: AdFormData): {
  success: true;
  data: ValidatedAdData;
} | {
  success: false;
  errors: AdValidationError[];
} {
  const errors: AdValidationError[] = [];

  // Honeypot: se preenchido, rejeita silenciosamente (bot detectado)
  if (data.website && data.website.trim().length > 0) {
    return {
      success: false,
      errors: [{ field: 'form', message: 'Submissão inválida.' }],
    };
  }

  // kind
  const kindResult = validateKind(data.kind);
  if (kindResult.error) errors.push({ field: 'kind', message: kindResult.error });

  // businessName
  const businessNameResult = validateTextField(data.businessName, 'Nome do estabelecimento', 1, 100, true);
  if (businessNameResult.error) errors.push({ field: 'businessName', message: businessNameResult.error });

  // category
  const categoryResult = validateCategory(data.category);
  if (categoryResult.error) errors.push({ field: 'category', message: categoryResult.error });

  // description
  const descriptionResult = validateTextField(data.description, 'Descrição', 1, 300, true);
  if (descriptionResult.error) errors.push({ field: 'description', message: descriptionResult.error });

  // neighborhood
  const neighborhoodResult = validateTextField(data.neighborhood, 'Bairro', 1, 80, true);
  if (neighborhoodResult.error) errors.push({ field: 'neighborhood', message: neighborhoodResult.error });

  // phone
  const phoneResult = validatePhoneField(data.phone, 'Telefone', 30);
  if (phoneResult.error) errors.push({ field: 'phone', message: phoneResult.error });

  // whatsapp
  const whatsappResult = validatePhoneField(data.whatsapp, 'WhatsApp', 30);
  if (whatsappResult.error) errors.push({ field: 'whatsapp', message: whatsappResult.error });

  // url
  const urlResult = validateUrlField(data.url, 'Site');
  if (urlResult.error) errors.push({ field: 'url', message: urlResult.error });

  // hours
  const hoursResult = validateTextField(data.hours, 'Horário de funcionamento', 1, 120, false);
  if (hoursResult.error) errors.push({ field: 'hours', message: hoursResult.error });

  // contactEmail
  const emailResult = validateEmail(data.contactEmail, 'E-mail de contato');
  if (emailResult.error) errors.push({ field: 'contactEmail', message: emailResult.error });

  // Regra de negócio: pelo menos um contato
  const hasPhone = phoneResult.sanitized && phoneResult.sanitized.length > 0;
  const hasWhatsapp = whatsappResult.sanitized && whatsappResult.sanitized.length > 0;
  const hasUrl = urlResult.sanitized && urlResult.sanitized.length > 0;

  if (!hasPhone && !hasWhatsapp && !hasUrl) {
    errors.push({
      field: 'contacts',
      message: 'Pelo menos um contato é obrigatório: Telefone, WhatsApp ou Site.',
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Dados validados e sanitizados
  const validatedData: ValidatedAdData = {
    id: generateAdId(businessNameResult.sanitized!),
    kind: kindResult.sanitized!,
    businessName: businessNameResult.sanitized!,
    category: categoryResult.sanitized!,
    description: descriptionResult.sanitized!,
    neighborhood: neighborhoodResult.sanitized!,
    phone: phoneResult.sanitized ?? null,
    whatsapp: whatsappResult.sanitized ?? null,
    url: urlResult.sanitized ?? null,
    hours: hoursResult.sanitized ?? null,
    imageUrl: null,
    status: 'rascunho',
    publishedAt: null,
    expiresAt: null,
    submittedAt: new Date().toISOString(),
    contactEmail: emailResult.sanitized!,
  };

  return { success: true, data: validatedData };
}

/** Validação para compatibilidade com o loader existente (isValidAd) */
export function isValidPendingAd(item: unknown): item is ValidatedAdData {
  if (!item || typeof item !== 'object') return false;
  const ad = item as Record<string, unknown>;

  // Campos obrigatórios
  if (typeof ad.id !== 'string' || ad.id.length === 0) return false;
  if (typeof ad.kind !== 'string' || !AD_KINDS.includes(ad.kind as AdKind)) return false;
  if (typeof ad.businessName !== 'string' || ad.businessName.length < 1 || ad.businessName.length > 100) return false;
  if (typeof ad.category !== 'string' || ad.category.length < 1 || ad.category.length > 60) return false;
  if (typeof ad.description !== 'string' || ad.description.length < 1 || ad.description.length > 300) return false;
  if (typeof ad.neighborhood !== 'string' || ad.neighborhood.length < 1 || ad.neighborhood.length > 80) return false;
  if (typeof ad.status !== 'string' || !AD_STATUSES.includes(ad.status as AdStatus)) return false;

  // Status rascunho -> publishedAt deve ser null
  if (ad.status !== 'publicado' && ad.publishedAt !== null) return false;
  if (ad.status === 'publicado' && (typeof ad.publishedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ad.publishedAt))) return false;

  // Contatos: pelo menos um
  const phone = ad.phone;
  const whatsapp = ad.whatsapp;
  const url = ad.url;
  const hasContact =
    (typeof phone === 'string' && phone.length > 0) ||
    (typeof whatsapp === 'string' && whatsapp.length > 0) ||
    (typeof url === 'string' && url.length > 0 && isSafeHttpUrl(url));
  if (!hasContact) return false;

  // URL se presente deve ser segura
  if (url && typeof url === 'string' && url.length > 0 && !isSafeHttpUrl(url)) return false;

  // Datas
  if (ad.expiresAt !== null && (typeof ad.expiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ad.expiresAt))) return false;

  return true;
}