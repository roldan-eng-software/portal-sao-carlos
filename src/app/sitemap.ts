import type { MetadataRoute } from 'next';
import { env } from '@/config/env';
import { loadAds, type Ad } from '@/modules/ads/loader';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;

  // Carregar anúncios publicados e não expirados para gerar URLs individuais
  const adsResult = await loadAds();
  const publishedAds = (adsResult.data ?? []).filter((ad: Ad) => {
    if (!ad.expiresAt) return true;
    return ad.expiresAt >= new Date().toISOString().slice(0, 10);
  });

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      // Captação de anúncios — página pública (auditoria Spec 01, achado 2).
      url: `${base}/anuncie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${base}/contato`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${base}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      // Listagens de conteúdo (Spec 04) — itens individuais de feed NÃO
      // entram: são efêmeros e apontam para fontes externas.
      url: `${base}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/avisos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/avisos/saae`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      // Central de utilidade pública (Spec 05).
      url: `${base}/utilidade-publica`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/utilidade-publica/telefones-uteis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/previsao-do-tempo/sao-carlos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      // Guia comercial (Spec 06).
      url: `${base}/empresas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${base}/aviso-editorial`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const companyUrls: MetadataRoute.Sitemap = publishedAds.map((ad) => ({
    url: `${base}/empresas/${ad.id}`,
    lastModified: ad.publishedAt ? new Date(`${ad.publishedAt}T12:00:00Z`) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticUrls, ...companyUrls];
}
