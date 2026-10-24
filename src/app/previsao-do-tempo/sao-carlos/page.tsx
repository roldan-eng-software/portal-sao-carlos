import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { WeatherSection } from '@/components/sections/weather-section';
import { getWeather } from '@/modules/weather/adapter';

/** Mesmo intervalo da home — o Open-Meteo não é consultado a cada visita. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Previsão do tempo em São Carlos/SP',
  description:
    'Previsão do tempo para São Carlos/SP: temperatura atual, condição do céu, vento, umidade e previsão para os próximos dias, com dados do Open-Meteo e horário da última atualização.',
  alternates: { canonical: '/previsao-do-tempo/sao-carlos' },
};

/**
 * Página dedicada da previsão do tempo (Spec 05 do PRD de SEO local).
 * Reutiliza o WeatherSection da home — os estados ok/stale/error e a
 * honestidade de datas vêm do mesmo módulo (FR-012/SC-004).
 */
export default async function PrevisaoDoTempoSaoCarlosPage() {
  const weather = await getWeather();

  return (
    <div className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-2">
      <article className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
        <Breadcrumbs
          items={[
            { name: 'Utilidade pública', href: '/utilidade-publica' },
            { name: 'Previsão do tempo', href: '/previsao-do-tempo/sao-carlos' },
          ]}
        />

        <header>
          <h1 className="font-display text-headline-lg text-primary">
            Previsão do tempo em São Carlos/SP
          </h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Temperatura atual e previsão para os próximos dias em São Carlos/SP, com dados do
            Open-Meteo (estação meteorológica de referência da cidade). Quando a fonte não
            responde, o portal avisa claramente em vez de exibir dado velho como se fosse novo.
          </p>
        </header>

        <div className="mt-6">
          <WeatherSection result={weather} />
        </div>
      </article>

      <p className="px-2 text-body-sm text-outline">
        Veja também os{' '}
        <Link href="/utilidade-publica/telefones-uteis" className="text-secondary hover:underline">
          telefones úteis de São Carlos
        </Link>{' '}
        e os{' '}
        <Link href="/avisos" className="text-secondary hover:underline">
          avisos de utilidade pública
        </Link>
        .
      </p>
    </div>
  );
}
