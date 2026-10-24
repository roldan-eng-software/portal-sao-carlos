import type { MetadataRoute } from 'next';
import { env } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Área administrativa protegida por login: nunca rastrear (auditoria
        // Spec 01, achado 1). O noindex no HTML do /admin é a fonte
        // determinante para indexação; o Disallow economiza crawl budget.
        disallow: ['/admin', '/api/admin'],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
