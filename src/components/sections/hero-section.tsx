import { env } from '@/config/env';
import { whatsappLink } from '@/lib/contact-links';
import { Section } from '@/components/ui/section';

/** Números de destaque do portal (marketing) — edite aqui se necessário. */
const STATS = [
  { value: '+250k', label: 'Moradores na Região', tone: 'text-secondary' },
  { value: '100%', label: 'Acesso Gratuito', tone: 'text-primary' },
  { value: '24h', label: 'Plantão Cívico', tone: 'text-accent-amber' },
] as const;

function bulletinTime(): string {
  const now = new Date();
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(now);
  const date = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(now);
  return `Boletim das ${time} · ${date}`;
}

/**
 * Abertura editorial + card de captação de comerciantes.
 * Sem formulário (FR-009/SC-006): apenas canais de contato direto.
 */
export function HeroSection() {
  const wa = env.contactWhatsapp ? whatsappLink(env.contactWhatsapp) : null;

  return (
    <Section
      band="overflow-hidden bg-linear-to-b from-surface-container-low via-surface-bright to-surface-canvas"
      aria-labelledby="hero-titulo"
      className="space-y-6 pb-10 pt-8"
    >
      {/* Círculos atmosféricos (profundidade visual) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-32 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-accent-amber/10 blur-3xl"
      />

      {/* Indicador de tempo real */}
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-card px-3 py-1 font-display text-label-md text-on-surface shadow-sm">
          <span className="h-2 w-2 rounded-full bg-badge-success" aria-hidden="true" />
          Atualizado em tempo real · São Carlos / SP
        </span>
        <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">
            schedule
          </span>
          {bulletinTime()}
        </span>
      </div>

      <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Coluna editorial (7 col) */}
        <div className="space-y-5 lg:col-span-7">
          <span className="inline-flex rounded bg-secondary-fixed px-2 py-1 text-label-sm uppercase tracking-wider text-on-secondary-fixed">
            Utilidade Pública &amp; Negócios
          </span>
          <h1
            id="hero-titulo"
            className="font-display text-display-mobile font-extrabold leading-tight tracking-tight text-primary lg:text-display"
          >
            O Portal de Informação e Negócios de{' '}
            <span className="text-secondary underline decoration-secondary/30 decoration-wavy underline-offset-4">
              São Carlos
            </span>{' '}
            e Região
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            Clima em tempo real, notícias atualizadas, comunicados de utilidade pública e o guia
            completo para conectar moradores aos melhores comércios locais.
          </p>

          {/* Ticker de indicadores */}
          <div className="grid grid-cols-3 gap-2">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-surface-card p-3 shadow-card">
                <span
                  className={`block font-display text-headline-lg leading-none ${stat.tone}`}
                >
                  {stat.value}
                </span>
                <span className="mt-1 block text-label-sm uppercase text-outline">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card de captação de comerciantes (5 col) — sem formulário (FR-009) */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl bg-surface-card p-6 shadow-lead">
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 h-1.5 bg-linear-to-r from-accent-amber via-secondary to-accent-amber"
            />
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded bg-surface-container px-2 py-0.5 text-label-sm uppercase text-accent-amber">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  rocket_launch
                </span>
                Empresas Locais
              </span>
              <span className="flex items-center gap-1 text-label-sm font-bold text-badge-success">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  check_circle
                </span>
                Grátis p/ Pequenos
              </span>
            </div>
            <h2 className="font-display text-headline-md text-primary">
              Divulgue sua empresa para milhares de são-carlenses
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Cadastre seu estabelecimento no guia comercial mais consultado da cidade.
              Conquiste novos clientes direto pelo WhatsApp.
            </p>

            <ul className="my-4 space-y-2 text-body-sm text-on-surface">
              {[
                'Cadastro gratuito para pequenos negócios',
                'Contato direto pelo seu WhatsApp',
                'Opção de destaque patrocinado',
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[16px] text-badge-success"
                    aria-hidden="true"
                  >
                    verified
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              {wa ? (
                <a
                  href={`${wa}?text=${encodeURIComponent('Olá, gostaria de cadastrar meu comércio no Portal São Carlos')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg text-on-secondary shadow-md transition-all hover:bg-primary-container"
                >
                  <span>Quero Cadastrar Meu Comércio Grátis</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </a>
              ) : (
                <a
                  href="#anuncie"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg text-on-secondary shadow-md transition-all hover:bg-primary-container"
                >
                  <span>Quero Cadastrar Meu Comércio Grátis</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </a>
              )}
              <div className="flex items-center justify-between pt-1 text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-badge-success">
                    verified
                  </span>
                  Sem taxas ocultas
                </span>
                <a href="#anuncie" className="text-secondary hover:underline">
                  Fale com o responsável
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
