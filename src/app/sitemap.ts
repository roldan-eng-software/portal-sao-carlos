import type { MetadataRoute } from 'next';
import { env } from '@/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl;
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    {
      // Captação de anúncios — página pública (auditoria Spec 01, achado 2).
      url: `${base}/anuncie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
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
}
