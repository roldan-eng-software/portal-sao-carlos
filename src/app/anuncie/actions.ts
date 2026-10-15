'use server';

import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { validateAdFormData, type AdFormData, type ValidatedAdData } from '@/lib/ads-validation';

interface SubmitResult {
  success: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

const PENDING_ADS_PATH = path.join(process.cwd(), 'src/content/pending-ads.json');

function readPendingAds(): ValidatedAdData[] {
  try {
    const content = fs.readFileSync(PENDING_ADS_PATH, 'utf-8');
    const data = JSON.parse(content);
    return data.items || [];
  } catch {
    return [];
  }
}

function writePendingAds(items: ValidatedAdData[]): void {
  const data = {
    _meta: {
      description: 'Anúncios pendentes de aprovação — preenchidos via formulário público /anuncie',
      regras: {
        kind: 'NÃO EDITAR — enum fixo: \'anuncio-gratuito\' | \'anuncio-patrocinado\'',
        status: 'NÃO EDITAR — sempre \'rascunho\' para submissões do formulário',
        submittedAt: 'AUTO — ISO 8601 timestamp da submissão',
        ip: 'OPCIONAL — IP do remetente (para moderação)',
        honeypot: 'NÃO EDITAR — campo anti-bot (deve vir vazio)',
      },
    },
    items,
  };
  fs.writeFileSync(PENDING_ADS_PATH, JSON.stringify(data, null, 2), 'utf-8');
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
    // Silencioso - não falha a submissão se webhook falhar
    console.warn('[ads] Webhook notification failed');
  }
}

export async function submitAdAction(formData: FormData): Promise<SubmitResult> {
  // Extrai dados do FormData
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

  // Valida
  const validation = validateAdFormData(rawData);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  // Lê pendentes atuais e adiciona novo
  const pending = readPendingAds();
  pending.unshift(validation.data); // mais recente primeiro
  writePendingAds(pending);

  // Notifica via webhook (se configurado)
  await sendWebhook(validation.data);

  // Revalida a página de anúncios (se necessário)
  revalidatePath('/anuncie');

  return {
    success: true,
    message: 'Anúncio enviado para análise! Entraremos em contato pelo e-mail informado.',
  };
}