'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { ValidatedAdData } from '@/lib/ads-validation';

const PENDING_ADS_PATH = path.join(process.cwd(), 'src/content/pending-ads.json');
const ADS_PATH = path.join(process.cwd(), 'src/content/ads.json');

interface AdItem {
  id: string;
  kind: 'anuncio-gratuito' | 'anuncio-patrocinado';
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  url: string | null;
  hours: string | null;
  imageUrl: null;
  status: 'rascunho' | 'publicado' | 'suspenso' | 'removido';
  publishedAt: string | null;
  expiresAt: string | null;
}

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

function readAds(): AdItem[] {
  try {
    const content = fs.readFileSync(ADS_PATH, 'utf-8');
    const data = JSON.parse(content);
    return data.items || [];
  } catch {
    return [];
  }
}

function writeAds(items: AdItem[]): void {
  const data = {
    _meta: {
      description: 'Anúncios do portal — moderação manual via edição deste arquivo + git commit',
      regras: {
        kind: 'NÃO EDITAR — enum fixo: \'anuncio-gratuito\' | \'anuncio-patrocinado\'',
        imageUrl: 'NÃO EDITAR — fotos não suportadas nesta fase (constituição Art. III)',
        status: 'EDITÁVEL — \'rascunho\' | \'publicado\' | \'suspenso\' | \'removido\'',
        publishedAt: 'EDITÁVEL se status=\'publicado\' (YYYY-MM-DD) | NÃO EDITAR se status=\'rascunho\' (deve ser null)',
        expiresAt: 'EDITÁVEL — YYYY-MM-DD ou null (fim do período combinado externamente)',
        contatos: 'PELO MENOS UM OBRIGATÓRIO: phone OU whatsapp OU url',
      },
    },
    items,
  };
  fs.writeFileSync(ADS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function approveAdAction(pendingAdId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pendingAds = readPendingAds();
    const adIndex = pendingAds.findIndex((ad) => ad.id === pendingAdId);

    if (adIndex === -1) {
      return { success: false, error: 'Anúncio pendente não encontrado' };
    }

    const pendingAd = pendingAds[adIndex];

    // Converte para formato ads.json
    const today = formatDate(new Date());
    const sponsoredExpiryDays = parseInt(process.env.SPONSORED_EXPIRY_DAYS || '90', 10);
    const isSponsored = pendingAd.kind === 'anuncio-patrocinado';

    const newAd = {
      id: pendingAd.id,
      kind: pendingAd.kind,
      businessName: pendingAd.businessName,
      category: pendingAd.category,
      description: pendingAd.description,
      neighborhood: pendingAd.neighborhood,
      phone: pendingAd.phone,
      whatsapp: pendingAd.whatsapp,
      url: pendingAd.url,
      hours: pendingAd.hours,
      imageUrl: null,
      status: 'publicado' as const,
      publishedAt: today,
      expiresAt: isSponsored ? formatDate(addDays(new Date(), sponsoredExpiryDays)) : null,
    };

    // Adiciona ao ads.json (topo - mais recente primeiro)
    const existingAds = readAds();
    existingAds.unshift(newAd);
    writeAds(existingAds);

    // Remove de pending-ads.json
    pendingAds.splice(adIndex, 1);
    writePendingAds(pendingAds);

    // Revalida páginas
    revalidatePath('/');
    revalidatePath('/anuncie');
    revalidatePath('/admin/anuncios');

    return { success: true };
  } catch (err) {
    console.error('[admin] Erro ao aprovar:', err);
    return { success: false, error: 'Erro interno ao aprovar' };
  }
}

export async function rejectAdAction(pendingAdId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pendingAds = readPendingAds();
    const adIndex = pendingAds.findIndex((ad) => ad.id === pendingAdId);

    if (adIndex === -1) {
      return { success: false, error: 'Anúncio pendente não encontrado' };
    }

    // Remove de pending-ads.json
    pendingAds.splice(adIndex, 1);
    writePendingAds(pendingAds);

    revalidatePath('/anuncie');
    revalidatePath('/admin/anuncios');

    return { success: true };
  } catch (err) {
    console.error('[admin] Erro ao rejeitar:', err);
    return { success: false, error: 'Erro interno ao rejeitar' };
  }
}