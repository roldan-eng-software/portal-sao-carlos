'use server';

import { revalidatePath } from 'next/cache';
import { validateAdFormData, type AdFormData, type ValidatedAdData } from '@/lib/ads-validation';
import { savePendingAd } from '@/modules/ads-pending/loader';

interface SubmitResult {
  success: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

async function sendWebhook(ad: ValidatedAdData): Promise<void> {
  const webhookUrl = process.env.AD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ad_submitted',
        ad: {
          id: ad.id,
          kind: ad.kind,
          businessName: ad.businessName,
          category: ad.category,
          neighborhood: ad.neighborhood,
          phone: ad.phone,
          whatsapp: ad.whatsapp,
          url: ad.url,
          hours: ad.hours,
          contactEmail: ad.contactEmail,
          submittedAt: ad.submittedAt,
        },
      }),
    });
  } catch {
    console.warn('[ads] Webhook notification failed');
  }
}

export async function submitAdAction(formData: FormData): Promise<SubmitResult> {
  const rawData: AdFormData = {
    kind: formData.get('kind') as AdFormData['kind'],
    businessName: formData.get('businessName') as string,
    category: formData.get('category') as string,
    description: formData.get('description') as string,
    neighborhood: formData.get('neighborhood') as string,
    phone: formData.get('phone') as string || undefined,
    whatsapp: formData.get('whatsapp') as string || undefined,
    url: formData.get('url') as string || undefined,
    hours: formData.get('hours') as string || undefined,
    contactEmail: formData.get('contactEmail') as string,
    website: formData.get('website') as string || undefined, // honeypot
  };

  const validation = validateAdFormData(rawData);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  const ad = validation.data;

  try {
    await savePendingAd({
      id: ad.id,
      kind: ad.kind,
      businessName: ad.businessName,
      category: ad.category,
      description: ad.description,
      neighborhood: ad.neighborhood,
      phone: ad.phone ?? undefined,
      whatsapp: ad.whatsapp ?? undefined,
      url: ad.url ?? undefined,
      hours: ad.hours ?? undefined,
      contactEmail: ad.contactEmail,
      status: 'pendente',
      submittedAt: ad.submittedAt,
    });
  } catch (error) {
    console.error('[ads] Falha ao salvar anúncio pendente:', error);
    return {
      success: false,
      message: 'Não foi possível enviar seu anúncio agora. Tente novamente em instantes.',
    };
  }

  await sendWebhook(ad);
  revalidatePath('/anuncie');

  return {
    success: true,
    message: 'Anúncio enviado com sucesso! Vamos revisar e responder no e-mail informado.',
  };
}
