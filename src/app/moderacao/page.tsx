import { Metadata } from 'next';
import { loadPendingAds } from '@/modules/ads-pending/loader';
import { loadAds } from '@/modules/ads/loader';
import type { AdPublished } from '@/modules/ads-pending/types';
import { ModerationClient } from './moderation-client';

export const metadata: Metadata = {
  title: 'Moderação de Anúncios — Portal São Carlos',
  description: 'Área restrita para moderação de anúncios gratuitos.',
  robots: {
    index: false,
    follow: false,
  },
}

// Carrega dados no servidor (sem cache)
async function getModerationData() {
  const pending = await loadPendingAds();
  const publishedResult = await loadAds();

  // Se o retorno for um ModuleResult, extraímos o array de dados
  const publishedAds = Array.isArray(publishedResult) 
    ? publishedResult 
    : (publishedResult as any).data || [];

  const freeAds = publishedAds.filter(
    (ad: any) => ad.kind === 'anuncio-gratuito'
  ) as AdPublished[];

  return { pending, published: freeAds };
}

export default async function ModerationPage() {
  const data = await getModerationData();

  return <ModerationClient initialPending={data.pending} initialPublished={data.published} />;
}