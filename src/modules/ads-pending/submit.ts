import { sanitizeText, sanitizeUrl, sanitizePhone } from '@/lib/sanitize';
import { checkRateLimit } from '@/lib/rate-limit';
import { isValidCnpj as validateCNPJ, formatCnpj as formatCNPJ } from '@/lib/cnpj';
import { loadAds } from '@/modules/ads/loader';
import { loadPendingAds, savePendingAds } from './loader';
import type { AdSubmission } from './types';
import { isValidCategory } from './types';

interface SubmitValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: Partial<AdSubmission>;
}

interface SubmitResult {
  success: boolean;
  submission?: AdSubmission;
  errors?: Record<string, string>;
  rateLimitInfo?: ReturnType<typeof checkRateLimit>;
}

/**
 * Valida e sanitiza dados do formulário no servidor.
 */
export function validateAndSanitizeAdForm(
  rawData: Record<string, unknown>,
  ip: string,
): SubmitValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Partial<AdSubmission> = {};

  // Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    errors._rateLimit = `Muitas tentativas. Tente novamente em ${Math.ceil((rateLimit.resetAt - Date.now()) / 60000)} minutos.`;
    return { valid: false, errors, sanitizedData };
  }

  // Campos obrigatórios
  const requiredFields: Array<{ key: keyof AdSubmission; label: string; maxLength: number }> = [
    { key: 'businessName', label: 'Nome do comércio/serviço', maxLength: 120 },
    { key: 'category', label: 'Categoria', maxLength: 40 },
    { key: 'description', label: 'Descrição', maxLength: 500 },
    { key: 'neighborhood', label: 'Bairro/região', maxLength: 80 },
  ] as const;

  for (const field of requiredFields) {
    const value = rawData[field.key];
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      errors[field.key] = `${field.label} é obrigatório.`;
    } else {
      sanitizedData[field.key] = sanitizeText(value, field.maxLength) as any;
      if (!sanitizedData[field.key]) {
        errors[field.key] = `${field.label} inválido.`;
      }
    }
  }

  // Valida categoria
  if (sanitizedData.category && !isValidCategory(sanitizedData.category)) {
    errors.category = 'Categoria inválida.';
    delete sanitizedData.category;
  }

  // Telefone (opcional mas se informado, valida)
  if (rawData.phone) {
    const phone = sanitizePhone(rawData.phone);
    if (phone.length < 10 || phone.length > 11) {
      errors.phone = 'Telefone deve ter 10 ou 11 dígitos (com DDD).';
    } else {
      sanitizedData.phone = phone;
    }
  }

  // WhatsApp (opcional mas se informado, valida)
  if (rawData.whatsapp) {
    const whatsapp = sanitizePhone(rawData.whatsapp);
    if (whatsapp.length < 10 || whatsapp.length > 11) {
      errors.whatsapp = 'WhatsApp deve ter 10 ou 11 dígitos (com DDD).';
    } else {
      sanitizedData.whatsapp = whatsapp;
    }
  }

  // Pelo menos telefone OU WhatsApp obrigatório
  if (!sanitizedData.phone && !sanitizedData.whatsapp) {
    errors.phone = 'Informe pelo menos telefone ou WhatsApp.';
    errors.whatsapp = 'Informe pelo menos telefone ou WhatsApp.';
  }

  // URL externa (opcional)
  if (rawData.url) {
    const url = sanitizeUrl(rawData.url);
    if (rawData.url && !url) {
      errors.url = 'URL deve ser http:// ou https:// válida.';
    } else {
      sanitizedData.url = url;
    }
  }

  // Horário (opcional)
  if (typeof rawData.hours === 'string') {
    sanitizedData.hours = sanitizeText(rawData.hours, 200);
  }

  // CNPJ (opcional para dedup)
  if (rawData.cnpj) {
    const cnpj = sanitizeText(rawData.cnpj, 18);
    if (cnpj) {
      if (!validateCNPJ(cnpj)) {
        errors.cnpj = 'CNPJ inválido.';
      } else {
        sanitizedData.cnpj = formatCNPJ(cnpj);
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Verifica duplicidade de CNPJ em anúncios pendentes e publicados.
 */
export async function checkCNPJDuplicate(cnpj: string): Promise<boolean> {
  if (!cnpj) return false;

  // Verifica pendentes
  const { loadPendingAds } = await import('./loader');
  const pending = await loadPendingAds();
  if (pending.some((ad) => ad.cnpj === cnpj && ad.status === 'pendente')) {
    return true;
  }

  // Verifica publicados
  const published = await loadAds();
  const publishedAds = Array.isArray(published) ? published : (published as any).data || [];
  if (publishedAds.some((ad: any) => ad.cnpj === cnpj && ad.status === 'publicado')) {
    return true;
  }

  return false;
}

/**
 * Cria submissão de anúncio pendente.
 */
export async function createAdSubmission(
  data: Partial<AdSubmission>,
  ip: string,
): Promise<SubmitResult> {
  const validation = validateAndSanitizeAdForm(data, ip);

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
      rateLimitInfo: checkRateLimit(ip),
    };
  }

  // Verifica duplicidade CNPJ
  if (validation.sanitizedData.cnpj) {
    const duplicate = await checkCNPJDuplicate(validation.sanitizedData.cnpj);
    if (duplicate) {
      return {
        success: false,
        errors: { cnpj: 'Já existe um anúncio ativo ou pendente para este CNPJ.' },
      };
    }
  }

  // Cria submissão
  const submission: AdSubmission = {
    id: crypto.randomUUID(),
    businessName: validation.sanitizedData.businessName!,
    category: validation.sanitizedData.category!,
    description: validation.sanitizedData.description!,
    neighborhood: validation.sanitizedData.neighborhood!,
    phone: validation.sanitizedData.phone,
    whatsapp: validation.sanitizedData.whatsapp,
    url: validation.sanitizedData.url,
    hours: validation.sanitizedData.hours,
    cnpj: validation.sanitizedData.cnpj,
    status: 'pendente',
    submittedAt: new Date().toISOString(),
    sourceIp: ip,
  };

  // Salva
  const pending = await loadPendingAds();
  pending.push(submission as AdSubmission);
  await savePendingAds(pending);

  return {
    success: true,
    submission,
    rateLimitInfo: checkRateLimit(ip),
  };
}