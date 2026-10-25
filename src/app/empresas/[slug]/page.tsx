import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { ContentLabel } from '@/components/ui/content-label';
import { loadAds, type Ad } from '@/modules/ads/loader';

/** Empresas com anúncio expirado deixam de ser indexadas (regra: expirado → 404). */
function isExpired(ad: Ad): boolean {
  if (!ad.expiresAt) return false;
  return ad.expiresAt < new Date().toISOString().slice(0, 10);
}

/** Busca um anúncio publicado e não expirado pelo slug (id). */
async function findAdBySlug(slug: string): Promise<Ad | null> {
  const result = await loadAds();
  const ads = result.data ?? [];
  const ad = ads.find((item) => item.id === slug);
  if (!ad) return null;
  if (isExpired(ad)) return null;
  return ad;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = await findAdBySlug(slug);
  if (!ad) {
    return { title: 'Empresa não encontrada' };
  }

  const title = `${ad.businessName} - ${ad.category} em ${ad.neighborhood} | São Carlos/SP`;
  return {
    title,
    description:
      `${ad.businessName} - ${ad.category} em ${ad.neighborhood}, São Carlos/SP. ${ad.description}`,
    alternates: { canonical: `/empresas/${ad.id}` },
  };
}

/**
 * Página individual de empresa do guia comercial (Spec 06).
 * Usa o id do anúncio como slug (URLs estáveis). Dados de contato vêm apenas
 * do próprio anúncio — nada é inventado (Regra 1).
 * 
 * JSON-LD LocalBusiness (schema.org): sem campos que o anúncio não possui
 * (sem image, sem geoCoordinates, sem priceRange — fotos não são suportadas
 * nesta fase, constituição Art. III).
 */
export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ad = await findAdBySlug(slug);

  if (!ad) {
    notFound();
  }

  const isService = ad.kind === 'anuncio-patrocinado' ? 'LocalBusiness' : 'LocalBusiness';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': isService,
    name: ad.businessName,
    description: ad.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Carlos',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    telephone: ad.phone ?? ad.whatsapp ?? undefined,
    ...(ad.url
      ? { url: ad.url }
      : { url: `https://www.meubairro.dev.br/empresas/${ad.id}` }),
    ...(ad.hours ? { openingHoursSpecification: { '@type': 'OpeningHoursSpecification', description: ad.hours } } : {}),
  };

  return (
    <div className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      {/* JSON-LD LocalBusiness (sem inventar campos) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { name: 'Guia comercial', href: '/empresas' },
          { name: ad.businessName, href: `/empresas/${ad.id}` },
        ]}
      />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          {ad.businessName}
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          {ad.category} • {ad.neighborhood}
        </p>
      </header>

      {/* Rótulos de publicidade obrigatórios (Regra 8) */}
      <div className="inline-flex items-center gap-2">
        <ContentLabel kind={ad.kind} />
        {ad.kind === 'anuncio-patrocinado' && (
          <span className="rounded bg-secondary-container px-2 py-0.5 text-label-sm font-bold text-on-secondary-container">
            Patrocinado
          </span>
        )}
      </div>

      <p className="text-body-lg text-on-surface">{ad.description}</p>

      {/* Informações da empresa */}
      <section>
        <h2 className="text-headline-md text-primary">Informações</h2>
        <ul className="mt-3 space-y-2 text-body-md">
          <li><span className="font-semibold">Categoria:</span> {ad.category}</li>
          <li><span className="font-semibold">Bairro/Região:</span> {ad.neighborhood}</li>
          {ad.hours && (
            <li><span className="font-semibold">Horário:</span> {ad.hours}</li>
          )}
        </ul>
      </section>

      {/* Contatos com canais verificáveis */}
      {ad.phone && (
        <section>
          <h2 className="text-headline-md text-primary">Telefone</h2>
          <a
            href={`tel:${ad.phone.replace(/\s/g, '')}`}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container px-4 py-3 text-body-md font-semibold text-secondary hover:underline"
          >
            📞 {ad.phone}
          </a>
        </section>
      )}

      {(ad.whatsapp || ad.url) && (
        <section>
          <h2 className="text-headline-md text-primary">Contato online</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {ad.whatsapp && (
              <a
                href={`https://wa.me/${ad.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container px-4 py-3 text-body-md font-semibold text-secondary hover:underline"
              >
                💬 WhatsApp
              </a>
            )}
            {ad.url && (
              <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container px-4 py-3 text-body-md font-semibold text-secondary hover:underline"
              >
                🔗 {ad.url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Aviso da publicidade e do portal */}
      <section className="border-t border-border-subtle pt-4">
        <p className="text-body-sm text-outline">
          Dados fornecidos pelo próprio anunciante. O Portal São Carlos é uma
          iniciativa independente e não garante a exatidão das informações
          divulgadas. Consulte sempre o estabelecimento antes de comparecer.
        </p>
      </section>

      <div className="pt-2">
        <Link
          href="/empresas"
          className="inline-flex items-center gap-1.5 text-body-md font-semibold text-secondary hover:underline"
        >
          ← Voltar ao guia comercial
        </Link>
      </div>
    </div>
  );
}
