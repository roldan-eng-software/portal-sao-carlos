import type { ModuleResult } from '@/lib/module-result';
import type { Notice } from '@/modules/notices/loader';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';

interface NoticesListProps {
  result: ModuleResult<Notice[]>;
  /** Mensagem exibida quando não há itens (ex.: filtro do SAAE sem avisos). */
  emptyMessage: string;
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(parsed);
}

/** Ícone do emissor, quando reconhecível (mesmo mapeamento da home). */
function sourceIcon(sourceName: string): string {
  const name = sourceName.toLowerCase();
  if (name.includes('saae')) return 'water_drop';
  if (name.includes('cpfl') || name.includes('energia')) return 'bolt';
  if (name.includes('meio ambiente') || name.includes('coleta')) return 'recycling';
  if (name.includes('prefeitura')) return 'account_balance';
  return 'campaign';
}

/**
 * Listagem completa de avisos de utilidade pública (Spec 04 do PRD de SEO
 * local) — usada em /avisos e /avisos/saae. A home exibe só os 3 mais
 * recentes; aqui vão até o limite do adapter (12), ordenados por data.
 * Cada aviso preserva fonte, data e link para o canal oficial.
 */
export function NoticesList({ result, emptyMessage }: NoticesListProps) {
  const items = result.data ?? [];
  // Em `error` o StatusMessage é a única mensagem honesta a exibir (ver
  // comentário equivalente em news-list.tsx).
  const showErrorOnly = items.length === 0 && result.status === 'error';

  return (
    <div className="space-y-4">
      {showErrorOnly ? null : items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-card sm:p-6"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 text-label-sm font-bold uppercase text-secondary">
                    <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                      {sourceIcon(item.sourceName)}
                    </span>
                    {item.sourceName}
                  </span>
                  <span className="text-label-sm text-outline">{formatDate(item.date)}</span>
                </div>
                <ContentLabel kind={item.kind} />
                <h2 className="mt-2 font-display text-headline-sm text-primary">{item.title}</h2>
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
                    className="inline-flex items-center gap-1 text-label-md text-secondary hover:underline"
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
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">{emptyMessage}</p>
        </div>
      )}

      <StatusMessage result={result} />
    </div>
  );
}
