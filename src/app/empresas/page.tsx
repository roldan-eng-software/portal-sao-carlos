import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { ContentLabel } from '@/components/ui/content-label';
import { loadAds, type Ad } from '@/modules/ads/loader';

/**
 * Página de hub do guia comercial - lista todas as empresas publicadas.
 * Cada seção é um anúncio publicado com categorias e rótulo de publicidade.
 * 
 * @see Spec 06 - Guia comercial: /empresas e /empresas/[slug]
 */
export const metadata: Metadata = {
  title: 'Guia comercial de São Carlos/SP',
  description: 'Encontre empresas e serviços locais de São Carlos/SP: anúncios gratuitos e patrocinados com contatos, horários e avaliações.',
  alternates: { canonical: '/empresas' },
};

export default async function EmpresasPage() {
  const adsResult = await loadAds();
  const ads: Ad[] = adsResult.data ?? [];

  // Agrupar anúncios publicados por categoria (a categoria já foi filtrada no loader)
  const adsByCategory = ads.reduce<Record<string, Ad[]>>((acc, ad) => {
    const category = ad.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ad);
    return acc;
  }, {});

  return (
    <div className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs
        items={[
          { name: 'Guia comercial', href: '/guia-comercial' },
          { name: 'Empresas', href: '/empresas' },
        ]}
      />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          Guia comercial de São Carlos/SP
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Encontre empresas e serviços locais de São Carlos/SP. Anúncios com
          categorias, bairro, contatos e horários de atendimento.
        </p>
      </header>

      <section className="mt-6">
        <h2 className="text-headline-md text-primary">
          Empresas publicadas
        </h2>

        {Object.entries(adsByCategory).map(([category, adsInCategory]) => (
          <div key={category} className="mb-8">
            <h2 className="text-headline-md text-primary mb-4">
              {category}
            </h2>
            <ul className="space-y-3 sm:space-y-6">
              {adsInCategory.map((ad) => (
                <li key={ad.id}>
                  <Link href={`/empresas/${ad.id}`} className="block group">
                    <div className="flex items-center gap-3">
                      <ContentLabel kind={ad.kind} />
                      <div className="flex-1">
                        <h3 className="font-display text-headline-sm text-primary">
                          {ad.businessName}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {ad.category} • {ad.neighborhood}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {ad.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          {ad.phone && (
                            <span className="inline-flex items-center gap-1">
                              <span>📞</span>
                              <a href={`tel:${ad.phone.replace(/\s/g, '')}`} className="text-secondary hover:underline">
                                {ad.phone}
                              </a>
                            </span>
                          )}
                          {ad.whatsapp && (
                            <span className="inline-flex items-center gap-1">
                              <span>💬</span>
                              <a href={`https://wa.me/${ad.whatsapp}`} className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer">
                                WhatsApp
                              </a>
                            </span>
                          )}
                          {ad.url && (
                            <span className="inline-flex items-center gap-1">
                              <span>🔗</span>
                              <a href={ad.url} className="text-secondary hover:underline" target="_blank" rel="noopener noreferrer">
                                Site
                              </a>
                            </span>
                          )}
                          {ad.hours && (
                            <span className="inline-flex items-center gap-1">
                              <span>⏰</span>
                              <span className="text-on-surface-variant">{ad.hours}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
