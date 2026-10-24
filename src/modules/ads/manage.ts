import { AdPublished, AdPublishedStatus } from '@/modules/ads-pending/types';
import { loadAds, saveAds } from './loader';
import type { ModuleResult } from '@/lib/module-result';
import type { Ad } from '@/modules/ads/loader';

/**
 * Edita campos de um anúncio publicado.
 */
export async function editPublishedAd(
  adId: string,
  updates: Partial<Omit<AdPublished, 'id' | 'kind' | 'approvedAt'>>
): Promise<{ success: boolean; ad?: AdPublished; errors?: string[] }> {
  const adsResult = await loadAds();
  const ads = Array.isArray(adsResult) ? adsResult : (adsResult as ModuleResult<Ad[]>).data || [];
  const index = ads.findIndex((ad: Ad) => ad.id === adId);

  if (index === -1) {
    return { success: false, errors: ['Anúncio não encontrado.'] };
  }

  // Só permite editar anúncios gratuitos (segurança)
  if (ads[index].kind !== 'anuncio-gratuito') {
    return { success: false, errors: ['Apenas anúncios gratuitos podem ser editados por este módulo.'] };
  }

  const updatedAd: AdPublished = {
    ...ads[index] as AdPublished,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  ads[index] = updatedAd;
  await saveAds(ads);

  return { success: true, ad: updatedAd };
}

/**
 * Altera o status de um anúncio publicado (suspenso, reativado, removido).
 */
export async function updateAdStatus(
  adId: string,
  status: AdPublishedStatus
): Promise<{ success: boolean; errors?: string[] }> {
  const adsResult = await loadAds();
  const ads = Array.isArray(adsResult) ? adsResult : (adsResult as ModuleResult<Ad[]>).data || [];
  const index = ads.findIndex((ad: Ad) => ad.id === adId);

  if (index === -1) {
    return { success: false, errors: ['Anúncio não encontrado.'] };
  }

  const now = new Date().toISOString();
  const ad = ads[index] as AdPublished;
  
  ad.status = status;
  ad.updatedAt = now;

  if (status === 'suspenso') {
    ad.suspendedAt = now;
  } else if (status === 'removido') {
    ad.removedAt = now;
  }

  ads[index] = ad;
  await saveAds(ads);

  return { success: true };
}