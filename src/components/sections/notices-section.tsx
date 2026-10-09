import type { ModuleResult } from '@/lib/module-result';
import type { Notice } from '@/modules/notices/loader';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';
import { Section } from '@/components/ui/section';

interface NoticesSectionProps {
  result: ModuleResult<Notice[]>;
}

/**
 * Máximo de informativos exibidos na home — decisão editorial de densidade
 * (2026-10-09): menos cards de conteúdo liberam espaço para os anúncios,
 * sem alterar o cache do adapter (que segue armazenando até 12 itens).
 * A lista do adapter já vem ordenada da mais recente para a mais antiga,
 * então o recorte equivale às últimas 3 atualizações.
 */
const MAX_DISPLAY_ITEMS = 3;

function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' })
    .format(parsed);
}

/** Ícone do emissor, quando reconhecível. */
function sourceIcon(sourceName: string): string {
  const name = sourceName.toLowerCase();
  if (name.includes('saae')) return 'water_drop';
  if (name.includes('cpfl') || name.includes('energia')) return 'bolt';
  if (name.includes('meio ambiente') || name.includes('coleta')) return 'recycling';
  if (name.includes('prefeitura')) return 'account_balance';
  return 'campaign';
}

export function NoticesSection({ result }: NoticesSectionProps) {
  const items = (result.data ?? []).slice(0, MAX_DISPLAY_ITEMS);

  return (
    <Section
      id="informativos"
      aria-labelledby="informativos-titulo"
      band="bg-surface-container-low"
      className="py-10"
    >
      {/* Cabeçalho do painel */}
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-surface-card p-6 shadow-card md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-amber/20 text-accent-amber"
          >
            <span className="material-symbols-outlined text-[28px]">notifications_active</span>
          </div>
          <div>
            <h2 id="informativos-titulo" className="font-display text-headline-md text-primary">
              Informativos e Avisos de Utilidade Pública
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Comunicação preventiva e avisos de interesse municipal. Conteúdo de terceiros —
              confirme sempre no canal oficial.
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-label-sm font-semibold text-on-surface">
          <span className="h-2 w-2 rounded-full bg-badge-success" aria-hidden="true" />
          Painel Atualizado:{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeZone: 'America/Sao_Paulo',
          }).format(result.lastUpdated ? new Date(result.lastUpdated) : new Date())}
        </span>
      </div>

      {/* Faixa de aviso (portal independente) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-primary p-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px] text-accent-amber" aria-hidden="true">
            info
          </span>
          <p className="text-body-sm text-surface-container-high">
            Atenção: este portal independente agrega comunicados do SAAE, CPFL e Prefeitura.
            Sempre consulte o canal oficial antes de tomar ações operacionais.
          </p>
        </div>
        <a
          href="https://www.saocarlos.sp.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-label-md text-accent-amber hover:underline"
        >
          Acessar Prefeitura
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            launch
          </span>
        </a>
      </div>

      {items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between rounded-2xl bg-surface-card p-6 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 text-label-sm font-bold uppercase text-secondary">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      {sourceIcon(item.sourceName)}
                    </span>
                    {item.sourceName}
                  </span>
                  <span className="text-label-sm text-outline">{formatDate(item.date)}</span>
                </div>
                <ContentLabel kind={item.kind} />
                <h3 className="mt-2 font-display text-headline-sm text-primary">{item.title}</h3>
                <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
                  {item.summary}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-body-sm">
                <span className="text-label-sm text-outline">Informação de terceiros</span>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-label-md text-secondary hover:underline"
                  >
                    Canal oficial
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      open_in_new
                    </span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">
            Nenhum informativo publicado no momento.
          </p>
        </div>
      )}

      <div className="mt-4">
        <StatusMessage result={result} />
      </div>
    </Section>
  );
}
