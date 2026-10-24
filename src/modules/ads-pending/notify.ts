import type { AdSubmission, AdPublished, AdSubmissionStatus } from './types';
import { loadAds, saveAds } from '@/modules/ads/loader';
import { loadPendingAds, updatePendingAd } from './loader';

/**
 * Gera link WhatsApp (wa.me) com mensagem pré-formatada.
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Gera link mailto com assunto e corpo pré-formatados.
 */
export function generateMailtoLink(email: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${email}?${params.toString()}`;
}

/**
 * Mensagem padrão para notificação de aprovação.
 */
export function approvalMessage(ad: AdSubmission): { subject: string; body: string; whatsapp: string } {
  const subject = `Seu anúncio "${ad.businessName}" foi aprovado no Portal São Carlos`;
  const body = `Olá!\n\nSeu anúncio gratuito foi aprovado e já está publicado no Portal São Carlos.\n\nDetalhes:\n- Nome: ${ad.businessName}\n- Categoria: ${ad.category}\n- Bairro: ${ad.neighborhood}\n- Descrição: ${ad.description}\n${ad.phone ? `- Telefone: ${ad.phone}\n` : ''}${ad.whatsapp ? `- WhatsApp: ${ad.whatsapp}\n` : ''}${ad.url ? `- Site: ${ad.url}\n` : ''}${ad.hours ? `- Horário: ${ad.hours}\n` : ''}\n\nAcesse: https://www.meubairro.dev.br/anunciar\n\nAtenciosamente,\nEquipe Portal São Carlos`;
  const whatsapp = `Olá! Seu anúncio "${ad.businessName}" foi aprovado e está publicado no Portal São Carlos. Acesse: https://www.meubairro.dev.br/anunciar`;

  return { subject, body, whatsapp };
}

/**
 * Mensagem padrão para notificação de recusa.
 */
export function rejectionMessage(ad: AdSubmission, reason: string): { subject: string; body: string; whatsapp: string } {
  const subject = `Seu anúncio "${ad.businessName}" não foi aprovado no Portal São Carlos`;
  const body = `Olá!\n\nSeu anúncio gratuito não foi aprovado pela moderação.\n\nMotivo: ${reason}\n\nVocê pode corrigir as informações e enviar novamente em: https://www.meubairro.dev.br/anunciar\n\nAtenciosamente,\nEquipe Portal São Carlos`;
  const whatsapp = `Olá! Seu anúncio "${ad.businessName}" não foi aprovado. Motivo: ${reason}. Envie novamente corrigido: https://www.meubairro.dev.br/anunciar`;

  return { subject, body, whatsapp };
}

/**
 * Aprova anúncio pendente: move para ads.json como 'anuncio-gratuito'.
 */
export async function approveAdSubmission(
  submissionId: string,
): Promise<{ success: boolean; publishedAd?: AdPublished; errors?: string[] }> {
  const pending = await loadPendingAds();
  const index = pending.findIndex((ad) => ad.id === submissionId);

  if (index === -1) {
    return { success: false, errors: ['Anúncio pendente não encontrado.'] };
  }

  const submission = pending[index];
  if (submission.status !== 'pendente') {
    return { success: false, errors: ['Apenas anúncios pendentes podem ser aprovados.'] };
  }

  // Verifica duplicidade CNPJ novamente (concorrência)
  if (submission.cnpj) {
    const published = await loadAds();
    const publishedAds = Array.isArray(published) ? published : (published as any).data || [];
    const duplicate = publishedAds.some((ad: AdPublished) => ad.cnpj === submission.cnpj && ad.status === 'publicado');
    if (duplicate) {
      return { success: false, errors: ['Já existe anúncio publicado para este CNPJ.'] };
    }
  }

  // Cria anúncio publicado
  const now = new Date().toISOString();
  const publishedAd: AdPublished = {
    id: crypto.randomUUID(),
    businessName: submission.businessName,
    category: submission.category,
    description: submission.description,
    neighborhood: submission.neighborhood,
    phone: submission.phone,
    whatsapp: submission.whatsapp,
    url: submission.url,
    hours: submission.hours,
    cnpj: submission.cnpj,
    kind: 'anuncio-gratuito',
    status: 'publicado',
    approvedAt: now,
    updatedAt: now,
  };

  // Salva publicado
  const ads = await loadAds();
  const adsArray = Array.isArray(ads) ? ads : (ads as any).data || [];
  adsArray.push(publishedAd);
  await saveAds(adsArray);

  // Remove da fila de pendentes (marca como aprovado)
  const updatedSubmission: AdSubmission = { ...pending[index], status: 'aprovado' as AdSubmissionStatus, reviewedAt: now };
  await updatePendingAd(updatedSubmission);

  return { success: true, publishedAd };
}

/**
 * Recusa anúncio pendente.
 */
export async function rejectAdSubmission(
  submissionId: string,
  reason: string,
): Promise<{ success: boolean; errors?: string[] }> {
  const pending = await loadPendingAds();
  const index = pending.findIndex((ad) => ad.id === submissionId);

  if (index === -1) {
    return { success: false, errors: ['Anúncio pendente não encontrado.'] };
  }

  const submission = pending[index];
  if (submission.status !== 'pendente') {
    return { success: false, errors: ['Apenas anúncios pendentes podem ser recusados.'] };
  }

  if (!reason.trim()) {
    return { success: false, errors: ['Motivo da recusa é obrigatório.'] };
  }

  const updatedSubmission: AdSubmission = { ...pending[index], status: 'recusado' as AdSubmissionStatus, reviewedAt: new Date().toISOString(), rejectionReason: reason.trim() };
  await updatePendingAd(updatedSubmission);

  return { success: true };
}