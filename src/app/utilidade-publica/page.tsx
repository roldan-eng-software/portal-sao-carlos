import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Utilidade pública de São Carlos',
  description:
    'Central de utilidade pública de São Carlos/SP: telefones úteis oficiais, previsão do tempo, avisos do SAAE e canais oficiais da Prefeitura, CPFL e Defesa Civil.',
  alternates: { canonical: '/utilidade-publica' },
};

/** Cartões de destino da central — apenas páginas que existem (sem link quebrado). */
const DESTINATIONS = [
  {
    href: '/utilidade-publica/telefones-uteis',
    icon: 'call',
    title: 'Telefones úteis',
    description:
      'Números oficiais de emergência, SAAE, CPFL, saúde, segurança e Prefeitura, com fonte e link para o canal oficial.',
  },
  {
    href: '/previsao-do-tempo/sao-carlos',
    icon: 'partly_cloudy_day',
    title: 'Previsão do tempo',
    description:
      'Previsão para São Carlos/SP com temperatura atual e os próximos dias, atualizada automaticamente.',
  },
  {
    href: '/avisos/saae',
    icon: 'water_drop',
    title: 'Avisos do SAAE',
    description:
      'Comunicados oficiais sobre abastecimento de água, manutenção da rede e orientações aos moradores.',
  },
  {
    href: '/avisos',
    icon: 'campaign',
    title: 'Todos os avisos',
    description: 'Informativos de utilidade pública da cidade, com data, fonte e link para o original.',
  },
];

/** Canais oficiais externos (somente órgãos reais; portal é independente). */
const OFFICIAL_CHANNELS = [
  { name: 'Prefeitura Municipal de São Carlos', url: 'https://saocarlos.sp.gov.br' },
  { name: 'SAAE São Carlos', url: 'https://saaesaocarlos.com.br' },
  { name: 'CPFL Paulista', url: 'https://www.cpfl.com.br' },
  { name: 'Defesa Civil de São Carlos', url: 'https://saocarlos.sp.gov.br/defesacivil' },
];

export default function UtilidadePublicaPage() {
  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Utilidade pública', href: '/utilidade-publica' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          Utilidade pública de São Carlos
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Central com o que ajuda no dia a dia da cidade: telefones oficiais, previsão do tempo e
          avisos de utilidade pública. O portal é independente e apenas organiza informações de
          fontes oficiais —{' '}
          <strong className="text-on-surface">
            em emergência, ligue direto para o canal oficial
          </strong>
          .
        </p>
      </header>

      <section aria-labelledby="up-emergencia" className="space-y-3">
        <h2 id="up-emergencia" className="font-display text-headline-md text-primary">
          Em caso de emergência
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { number: '192', name: 'SAMU — emergência médica' },
            { number: '193', name: 'Bombeiros — incêndio e resgate' },
            { number: '199', name: 'Defesa Civil — enchentes e desabamentos' },
          ].map((line) => (
            <li key={line.number}>
              <a
                href={`tel:${line.number}`}
                className="flex items-center gap-3 rounded-xl border border-error-container bg-error-container/30 p-4 transition-colors hover:bg-error-container/60"
              >
                <span
                  className="font-display text-display-mobile font-extrabold leading-none text-error"
                  aria-hidden="true"
                >
                  {line.number}
                </span>
                <span className="text-body-sm font-semibold text-on-surface">{line.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="up-servicos" className="space-y-3">
        <h2 id="up-servicos" className="font-display text-headline-md text-primary">
          Serviços e informações
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DESTINATIONS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block h-full rounded-xl border border-border-subtle bg-surface-bright p-4 transition-colors hover:bg-surface-container"
              >
                <span className="mb-1 flex items-center gap-2 font-display text-headline-sm text-primary">
                  <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.title}
                </span>
                <span className="block text-body-sm text-on-surface-variant">
                  {item.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="up-oficiais" className="space-y-3">
        <h2 id="up-oficiais" className="font-display text-headline-md text-primary">
          Canais oficiais diretos
        </h2>
        <p className="text-body-sm text-outline">
          Para assuntos do SAAE, da Prefeitura ou da CPFL, fale diretamente com o órgão
          responsável — os links abaixo levam aos sites oficiais.
        </p>
        <ul className="flex flex-wrap gap-2">
          {OFFICIAL_CHANNELS.map((channel) => (
            <li key={channel.url}>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-container px-3 py-2 text-body-sm font-semibold text-secondary hover:underline"
              >
                {channel.name}
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  open_in_new
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
