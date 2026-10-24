/**
 * Ads Pending Types - Fase 2
 * Fila de moderação para anúncios gratuitos
 */

export type AdSubmissionStatus = 'pendente' | 'aprovado' | 'recusado';

export interface AdSubmission {
  id: string;
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone?: string;
  whatsapp?: string;
  url?: string;
  hours?: string;
  cnpj?: string;
  status: AdSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  sourceIp?: string;
}

export type AdPublishedStatus = 'publicado' | 'suspenso' | 'removido';

export interface AdPublished {
  id: string;
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone?: string;
  whatsapp?: string;
  url?: string;
  hours?: string;
  cnpj?: string;
  kind: 'anuncio-gratuito';
  status: AdPublishedStatus;
  approvedAt: string;
  suspendedAt?: string;
  removedAt?: string;
  updatedAt: string;
}

export const AD_CATEGORIES = [
  'Alimentação',
  'Serviços',
  'Comércio',
  'Saúde',
  'Educação',
  'Automotivo',
  'Construção',
  'Beleza',
  'Outros',
] as const;

export type AdCategory = typeof AD_CATEGORIES[number];

export function isValidCategory(category: string): category is AdCategory {
  return AD_CATEGORIES.includes(category as AdCategory);
}

/**
 * Dados para ações de gerenciamento de anúncios publicados (edição)
 */
export interface ManageActionData {
  businessName?: string;
  category?: string;
  description?: string;
  neighborhood?: string;
  phone?: string;
  whatsapp?: string;
  url?: string;
  hours?: string;
}