import Image from 'next/image';
import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { Ad } from '@/modules/ads/loader';
import { ContentLabel } from '@/components/ui/content-label';
import { StatusMessage } from '@/components/ui/status-message';
import { Section } from '@/components/ui/section';

interface AdsSectionProps {
  result: ModuleResult<Ad[]>;
}

function AdCard({ ad, sponsored }: { ad: Ad; sponsored: boolean }) {
  const waDigits = ad.whatsapp?.replace(/\D/g, '');
  const waLink = waDigits && waDigits.length >= 10 ? `https://wa.me/${waDigits}` : null;
  const telDigits = ad.phone?.replace(/\D/g, '');
  const telLink = telDigits && telDigits.length >= 8 ? `tel:+55${telDigits}` : null;

  return (
    <li
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-card p-6 shadow-card transition-shadow hover:shadow-card-hover ${
        sponsored ? 'shadow-[0_4px_12px_rgba(245,158,11,0.08)]' : ''
      }`}
    >
      {sponsored && (
        <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-1 bg-accent-amber" />
      )}
      <div>
        {/* Foto do estabelecimento, quando cadastrada; fallback tipográfico. */}
        {isSafeHttpUrl(ad.imageUrl) && (
          <div className="relative mb-4 h-36 w-full overflow-hidden rounded-xl bg-linear-to-br from-primary to-primary-container">
            <Image
              src={ad.imageUrl}
              alt={`${ad.businessName} — ${ad.category} em ${ad.neighborhood}`}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="mb-3 flex items-center justify-between gap-2">
          <ContentLabel kind={ad.kind} />
          <span className="text-label-sm text-outline">
            {ad.category} · {ad.neighborhood}
          </span>
        </div>
        <h3 className="font-display text-headline-md text-primary">{ad.businessName}</h3>
        <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
          {ad.description}
        </p>

        <div className="mt-4 space-y-2 text-body-sm text-outline">
          {ad.hours && (
            <p className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                aria-hidden="true"
              >
                schedule
              </span>
              {ad.hours}
            </p>
          )}
          {ad.phone && (
            <p className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-primary"
                aria-hidden="true"
              >
                phone
              </span>
              {telLink ? (
                <a href={telLink} className="font-medium text-primary hover:text-secondary">
                  {ad.phone}
                </a>
              ) : (
                <span className="font-medium text-on-surface">{ad.phone}</span>
              )}
            </p>
          )}
          {waLink && (
            <p className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[18px] text-badge-success"
                aria-hidden="true"
              >
                chat
              </span>
              <span className="font-medium text-on-surface">WhatsApp disponível</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
        <span className="text-label-sm text-outline">
          {sponsored ? 'Destaque patrocinado' : 'Verificado pela moderação'}
        </span>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-label-md text-secondary hover:underline"
          >
            Conversar no WhatsApp
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_forward
            </span>
          </a>
        ) : (
          isSafeHttpUrl(ad.url) && (
            <a
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-label-md text-secondary hover:underline"
            >
              Visitar site do anunciante
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                open_in_new
              </span>
            </a>
          )
        )}
      </div>
    </li>
  );
}

export function AdsSection({ result }: AdsSectionProps) {
  const items = result.data ?? [];
  const sponsored = items.filter((ad) => ad.kind === 'anuncio-patrocinado');
  const free = items.filter((ad) => ad.kind === 'anuncio-gratuito');

  return (
    <Section
      id="anuncios"
      aria-labelledby="anuncios-titulo"
      band="bg-surface-container-low"
      className="py-10"
    >
      {/* Cabeçalho da seção */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-amber" aria-hidden="true" />
            <span className="text-label-sm uppercase tracking-wider text-accent-amber">
              Fomento ao Comércio São-carlense
            </span>
          </div>
          <h2 id="anuncios-titulo" className="font-display text-headline-lg text-primary">
            Guia Comercial de São Carlos
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Encontre fornecedores, lojas físicas, gastronomia e prestadores de serviço recomendados
            na cidade. Publicidade — não notícia.
          </p>
        </div>
        <a
          href="#anuncie"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-label-md text-on-secondary shadow-sm transition-colors hover:bg-primary"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            add_business
          </span>
          Cadastrar Meu Negócio
        </a>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">
            Nenhum anúncio publicado no momento.{' '}
            <a href="#anuncie" className="text-secondary hover:underline">
              Anuncie aqui
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {sponsored.length > 0 && (
            <div className="space-y-4 lg:col-span-7">
              <h3 className="text-label-md uppercase tracking-wide text-accent-amber">
                Destaque comercial
              </h3>
              <ul className="space-y-4">
                {sponsored.map((ad) => (
                  <AdCard key={ad.id} ad={ad} sponsored />
                ))}
              </ul>
            </div>
          )}
          {free.length > 0 && (
            <div className="space-y-4 lg:col-span-5">
              <h3 className="text-label-md uppercase tracking-wide text-outline">
                Classificados gratuitos
              </h3>
              <ul className="space-y-4">
                {free.map((ad) => (
                  <AdCard key={ad.id} ad={ad} sponsored={false} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <StatusMessage result={result} />
      </div>
    </Section>
  );
}
