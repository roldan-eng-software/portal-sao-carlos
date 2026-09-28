import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { ContactItem } from '@/modules/contacts/loader';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';
import { Section } from '@/components/ui/section';

interface ContactsSectionProps {
  result: ModuleResult<ContactItem[]>;
}

/** Identidade visual por serviço (id do contacts.json). */
const SERVICE_STYLES: Record<string, { icon: string; tile: string; number: string }> = {
  'bombeiros-193': {
    icon: 'local_fire_department',
    tile: 'bg-error-container text-error',
    number: 'text-error',
  },
  'samu-192': {
    icon: 'medical_services',
    tile: 'bg-accent-amber/20 text-accent-amber',
    number: 'text-accent-amber',
  },
  'defesa-civil-199': {
    icon: 'shield',
    tile: 'bg-secondary/10 text-secondary',
    number: 'text-secondary',
  },
  'prefeitura-sao-carlos': {
    icon: 'account_balance',
    tile: 'bg-primary/10 text-primary',
    number: 'text-primary',
  },
};

const DEFAULT_STYLE = {
  icon: 'call',
  tile: 'bg-surface-container text-secondary',
  number: 'text-primary',
};

function formatCategory(item: ContactItem): string {
  if (isSafeHttpUrl(item.value)) return 'Portal Cidadão';
  if (item.hours?.toLowerCase().includes('24')) return 'Emergência 24 Horas';
  return 'Serviço Público';
}

export function ContactsSection({ result }: ContactsSectionProps) {
  const items = result.data ?? [];

  return (
    <Section id="contatos" aria-labelledby="contatos-titulo" className="py-10">
      {/* Cabeçalho da seção */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-badge-emergency" aria-hidden="true" />
            <span className="text-label-sm uppercase tracking-wider text-badge-emergency">
              Central de Ajuda Cidadã
            </span>
          </div>
          <h2 id="contatos-titulo" className="font-display text-headline-lg text-primary">
            Telefones e Links Úteis de Emergência
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Discagem rápida e canais de resposta imediata com funcionamento 24 horas por dia.
          </p>
        </div>
        <p className="w-fit rounded-lg bg-surface-card px-3 py-1.5 text-body-sm text-outline shadow-card">
          Em emergências graves, disque direto pelo seu celular.
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const isUrl = isSafeHttpUrl(item.value);
            const style = SERVICE_STYLES[item.id] ?? DEFAULT_STYLE;
            const href = isUrl ? item.value : `tel:${item.value}`;
            const category = formatCategory(item);

            return (
              <li key={item.id}>
                <a
                  href={href}
                  {...(isUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex h-full flex-col justify-between rounded-2xl bg-surface-card p-4 shadow-card transition-all hover:bg-surface-bright hover:shadow-card-hover"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      aria-hidden="true"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.tile}`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
                    </div>
                    <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-bold text-on-surface">
                      {item.hours ?? (isUrl ? 'Oficial' : 'Disponível')}
                    </span>
                  </div>

                  <div>
                    <span className="mb-1 block text-label-md text-outline">{category}</span>
                    <h3 className="mb-1 font-display text-headline-sm leading-tight text-primary">
                      {item.name}
                    </h3>
                    {isUrl ? (
                      <span className="block truncate text-body-sm text-secondary">
                        {item.value.replace(/^https?:\/\//, '')}
                      </span>
                    ) : (
                      <span
                        className={`block font-display text-display-mobile font-extrabold leading-none transition-transform group-hover:scale-105 ${style.number}`}
                      >
                        {item.value}
                      </span>
                    )}
                    {item.address && (
                      <span className="mt-1 block text-body-sm text-on-surface-variant">
                        {item.address}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-label-md text-secondary">
                    <span>{isUrl ? 'Acessar canal oficial' : 'Ligar agora'}</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {isUrl ? 'open_in_new' : 'call'}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-2xl bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">
            Contatos indisponíveis no momento.
          </p>
        </div>
      )}

      {/* Rótulo semântico obrigatório (FR-008) + aviso de independência */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <ContentLabel kind="servico-publico" />
          <span className="text-body-sm text-outline">
            Serviços de interesse da população — este portal não substitui o atendimento de
            emergência.
          </span>
        </div>
        <div className="w-full md:w-auto">
          <StatusMessage result={result} />
        </div>
      </div>
    </Section>
  );
}
