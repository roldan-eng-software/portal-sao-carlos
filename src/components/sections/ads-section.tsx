import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { Ad } from '@/modules/ads/loader';
import { ContentLabel } from '@/components/ui/content-label';
import { StatusMessage } from '@/components/ui/status-message';

interface AdsSectionProps {
  result: ModuleResult<Ad[]>;
}

function AdContact({ ad }: { ad: Ad }) {
  return (
    <p className="mt-2 space-y-0.5 text-sm text-slate-700">
      <span className="block">
        <span className="font-semibold">Contato:</span>{' '}
        {[ad.phone, ad.whatsapp].filter(Boolean).join(' · ')}
        {ad.hours && <span className="block text-slate-600">Horário: {ad.hours}</span>}
      </span>
      {isSafeHttpUrl(ad.url) && (
        <a
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-700 hover:underline"
        >
          Visitar site do anunciante
        </a>
      )}
    </p>
  );
}

export function AdsSection({ result }: AdsSectionProps) {
  const items = result.data ?? [];
  const sponsored = items.filter((ad) => ad.kind === 'anuncio-patrocinado');
  const free = items.filter((ad) => ad.kind === 'anuncio-gratuito');

  return (
    <section id="anuncios" aria-labelledby="anuncios-titulo" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="anuncios-titulo" className="text-xl font-bold text-slate-900">
          Anúncios locais
        </h2>
        <span className="text-xs text-slate-500">
          Anúncios de comerciantes — publicidade, não notícia
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            Nenhum anúncio publicado no momento.{' '}
            <a href="#anuncie" className="text-blue-700 hover:underline">
              Anuncie aqui
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sponsored.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
                Destaque comercial
              </h3>
              <ul className="space-y-3">
                {sponsored.map((ad) => (
                  <li
                    key={ad.id}
                    className="rounded-lg border-2 border-amber-400 bg-amber-50/70 p-4"
                  >
                    <ContentLabel kind="anuncio-patrocinado" />
                    <p className="mt-2 text-lg font-bold text-slate-900">{ad.businessName}</p>
                    <p className="text-sm text-slate-600">
                      {ad.category} · {ad.neighborhood}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{ad.description}</p>
                    <AdContact ad={ad} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {free.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                Classificados gratuitos
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {free.map((ad) => (
                  <li key={ad.id} className="rounded-lg border border-violet-200 bg-white p-4">
                    <ContentLabel kind="anuncio-gratuito" />
                    <p className="mt-2 font-bold text-slate-900">{ad.businessName}</p>
                    <p className="text-sm text-slate-600">
                      {ad.category} · {ad.neighborhood}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{ad.description}</p>
                    <AdContact ad={ad} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <StatusMessage result={result} />
      </div>
    </section>
  );
}
