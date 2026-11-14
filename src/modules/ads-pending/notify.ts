import type { AdSubmission, AdPublished } from './types';
import { approveSubmission, rejectSubmission, ModerationError } from './loader';

const ANUNCIE_URL = 'https://www.meubairro.dev.br/anuncie';

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
  const body = `Olá!\n\nSeu anúncio gratuito foi aprovado e já está publicado no Portal São Carlos.\n\nDetalhes:\n- Nome: ${ad.businessName}\n- Categoria: ${ad.category}\n- Bairro: ${ad.neighborhood}\n- Descrição: ${ad.description}\n${ad.phone ? `- Telefone: ${ad.phone}\n` : ''}${ad.whatsapp ? `- WhatsApp: ${ad.whatsapp}\n` : ''}${ad.url ? `- Site: ${ad.url}\n` : ''}${ad.hours ? `- Horário: ${ad.hours}\n` : ''}\n\nAcesse: ${ANUNCIE_URL}\n\nAtenciosamente,\nEquipe Portal São Carlos`;
  const whatsapp = `Olá! Seu anúncio "${ad.businessName}" foi aprovado e está publicado no Portal São Carlos. Acesse: ${ANUNCIE_URL}`;

  return { subject, body, whatsapp };
}

/**
 * Mensagem padrão para notificação de recusa.
 */
export function rejectionMessage(ad: AdSubmission, reason: string): { subject: string; body: string; whatsapp: string } {
  const subject = `Seu anúncio "${ad.businessName}" não foi aprovado no Portal São Carlos`;
  const body = `Olá!\n\nSeu anúncio gratuito não foi aprovado pela moderação.\n\nMotivo: ${reason}\n\nVocê pode corrigir as informações e enviar novamente em: ${ANUNCIE_URL}\n\nAtenciosamente,\nEquipe Portal São Carlos`;
  const whatsapp = `Olá! Seu anúncio "${ad.businessName}" não foi aprovado. Motivo: ${reason}. Envie novamente corrigido: ${ANUNCIE_URL}`;

  return { subject, body, whatsapp };
}

/**
 * Aprova anúncio pendente. Transação única no Neon (ver loader.approveSubmission).
 */
export async function approveAdSubmission(
  submissionId: string,
): Promise<{ success: boolean; publishedAd?: AdPublished; errors?: string[] }> {
  try {
    const publishedAd = await approveSubmission(submissionId);
    return { success: true, publishedAd };
  } catch (error) {
    if (error instanceof ModerationError) return { success: false, errors: [error.message] };
    throw error;
  }
}

/**
 * Recusa anúncio pendente com motivo obrigatório. Retorna o pendente original
 * para a montagem da notificação.
 */
export async function rejectAdSubmission(
  submissionId: string,
  reason: string,
): Promise<{ success: boolean; submission?: AdSubmission; errors?: string[] }> {
  try {
    const submission = await rejectSubmission(submissionId, reason);
    return { success: true, submission };
  } catch (error) {
    if (error instanceof ModerationError) return { success: false, errors: [error.message] };
    throw error;
  }
}
