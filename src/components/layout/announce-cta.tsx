import { env } from '@/config/env';
import { phoneLink, whatsappLink } from '@/lib/contact-links';
import { Section } from '@/components/ui/section';

const BENEFITS = [
  { icon: 'check_circle', tone: 'text-badge-success', text: 'Sem taxas ocultas' },
  { icon: 'chat', tone: 'text-secondary', text: 'Contato no seu WhatsApp' },
  { icon: 'verified', tone: 'text-accent-amber', text: '100% Grátis p/ MEI' },
] as const;

/**
 * Chamada de publicidade com contratação FORA do sistema (FR-009):
 * nenhum pagamento, checkout ou formulário — apenas canais de contato
 * do responsável (SC-006: alcançável em ≤ 2 interações via link do header).
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
            <span className="inline-flex rounded-full bg-secondary-fixed px-3 py-1 text-label-sm font-bold uppercase text-on-secondary-fixed">
              Visibilidade sem burocracia
            </span>
            <h2
              id="anuncie-titulo"
              className="font-display text-display-mobile font-extrabold leading-tight tracking-tight text-primary lg:text-display"
            >
              Alcance clientes em São Carlos todos os dias sem complicação.
            </h2>
            <p className="max-w-xl text-body-lg text-on-surface-variant">
              Divulgue seu comércio ou serviço para moradores da nossa cidade. Oferecemos
              anúncios gratuitos mediante moderação editorial e opções de destaque patrocinado
              direto com o portal.
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
              <span className="text-label-sm uppercase text-outline">
                Canais Oficiais de Contratação
              </span>
              <h3 className="font-display text-headline-md text-primary">Fale com o Responsável</h3>
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
              <a
                href="https://wa.me/5516981442301?text=Para%20o%20cadastro%20gratuito%20escreva%20abaixo%20os%20seguintes%20dados...%0ANome%20do%20Comercio:%0ABreve%20descri%C3%A7%C3%A3o:%0AHor%C3%A1rio%20de%20atendimento:%0AEndere%C3%A7o:%0ANumero%20do%20seu%20WhatsApp:%0ASite%20de%20sua%20empresa:"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg text-on-secondary shadow-md transition-all hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  send
                </span>
                <span>Anuncie no Portal Agora</span>
              </a>
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
                Contrate destaque pelos canais acima. Este portal não processa pagamentos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
