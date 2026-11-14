import Link from 'next/link';
import { env } from '@/config/env';
import { phoneLink, whatsappLink } from '@/lib/contact-links';
import { Section } from '@/components/ui/section';

const BENEFITS = [
  { icon: 'check_circle', tone: 'text-badge-success', text: 'Cadastro básico gratuito' },
  { icon: 'verified', tone: 'text-secondary', text: 'Revisão humana antes da publicação' },
  { icon: 'chat', tone: 'text-accent-amber', text: 'Contato direto com clientes' },
] as const;

/**
 * Chamada de publicidade com cadastro público e canais diretos de atendimento.
 */
export function AnnounceCTA() {
  const wa = env.contactWhatsapp ? whatsappLink(env.contactWhatsapp) : null;
  const tel = env.contactPhone ? phoneLink(env.contactPhone) : null;

  return (
    <Section id="anuncie" aria-labelledby="anuncie-titulo" className="py-10">
      <div className="relative overflow-hidden rounded-3xl bg-surface-card p-6 shadow-lead lg:p-10">
        {/* Glow decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Coluna explicativa (7 col) */}
          <div className="space-y-5 lg:col-span-7">
            <h2
              id="anuncie-titulo"
              className="font-display text-display-mobile font-extrabold leading-tight tracking-tight text-primary lg:text-display"
            >
              Cadastre seu negócio no Guia Comercial.
            </h2>
            <p className="max-w-xl text-body-lg text-on-surface-variant">
              Envie os dados do seu comércio ou serviço. A solicitação é revisada antes da
              publicação, e você recebe o retorno pelo contato informado.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              {BENEFITS.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-[20px] ${benefit.tone}`}
                    aria-hidden="true"
                  >
                    {benefit.icon}
                  </span>
                  <span className="text-body-sm font-medium text-on-surface">{benefit.text}</span>
                </div>
              ))}
            </div>
            <p className="text-body-sm text-outline">
              * Nota de transparência: este portal independente não processa pagamentos via site.
              Todo o relacionamento de contratação é feito de forma segura e direta via e-mail ou
              atendimento humano.
            </p>
          </div>

          {/* Caixa de ação (5 col) */}
          <div className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-6 lg:col-span-5">
            <div className="space-y-3">
              <h3 className="font-display text-headline-md text-primary">Precisa de ajuda?</h3>
              <p className="text-body-sm text-on-surface-variant">
                Envie sua solicitação comercial, esclareça dúvidas ou solicite a inclusão dos
                dados da sua empresa no nosso catálogo.
              </p>
              {env.contactEmail && (
                <div className="flex items-center gap-3 rounded-xl bg-surface-card p-3 shadow-card">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      mail
                    </span>
                  </span>
                  <div className="min-w-0">
                    <span className="block text-label-sm text-outline">E-mail Comercial</span>
                    <a
                      href={`mailto:${env.contactEmail}`}
                      className="block truncate font-display text-headline-sm text-secondary hover:underline"
                    >
                      {env.contactEmail}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <Link
                href="/anuncie"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg text-on-secondary shadow-md transition-all hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  send
                </span>
                <span>Cadastrar anúncio gratuito</span>
              </Link>
              {wa && (
                <a
                  href={`${wa}?text=${encodeURIComponent('Olá, gostaria de anunciar meu comércio no Portal São Carlos')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-card py-3 text-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-variant"
                >
                  <span
                    className="material-symbols-outlined text-[20px] text-badge-success"
                    aria-hidden="true"
                  >
                    chat
                  </span>
                  <span>Atendimento via WhatsApp</span>
                </a>
              )}
              {tel && (
                <a
                  href={tel}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-card py-3 text-label-lg text-on-surface shadow-sm transition-all hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    call
                  </span>
                  <span>Telefone: {env.contactPhone}</span>
                </a>
              )}
              {!wa && !tel && !env.contactEmail && (
                <p className="text-body-sm text-on-surface-variant">
                  Canais de contato serão informados em breve. Solicite informações sobre
                  publicidade local.
                </p>
              )}
              <p className="text-center text-label-sm text-outline">
                Dúvidas sobre destaque comercial são tratadas diretamente com o portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
