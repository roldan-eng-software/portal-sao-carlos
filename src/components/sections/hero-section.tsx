import Link from 'next/link';
import { Section } from '@/components/ui/section';

const SERVICE_LINKS = [
  { href: '#clima', icon: 'wb_sunny', label: 'Previsão do tempo' },
  { href: '#noticias', icon: 'notifications_active', label: 'Notícias locais' },
  { href: '#contatos', icon: 'call', label: 'Telefones úteis' },
] as const;

export function HeroSection() {
  return (
    <Section
      band="bg-surface-container-low"
      aria-labelledby="hero-titulo"
      className="py-10"
    >
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <h1
            id="hero-titulo"
            className="font-display text-display-mobile font-extrabold leading-tight tracking-tight text-primary lg:text-display"
          >
            Informações de São Carlos para orientar o seu dia.
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            Consulte a previsão do tempo, notícias locais, avisos de utilidade pública e contatos
            importantes da cidade em um só lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            {SERVICE_LINKS.map((service) => (
              <a
                key={service.href}
                href={service.href}
                className="inline-flex items-center gap-2 rounded-full bg-surface-card px-4 py-2.5 text-label-lg text-primary shadow-card transition-colors hover:bg-surface-container focus-visible:outline-secondary"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
                  {service.icon}
                </span>
                {service.label}
              </a>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card lg:col-span-4">
          <h2 className="font-display text-headline-md text-primary">Tem um negócio local?</h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            O cadastro básico é gratuito e cada solicitação passa por revisão humana antes de
            aparecer no Guia Comercial.
          </p>
          <Link
            href="/anuncie"
            className="mt-4 inline-flex items-center gap-2 text-label-lg text-secondary hover:underline"
          >
            Conheça os critérios de cadastro
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </aside>
      </div>
    </Section>
  );
}
