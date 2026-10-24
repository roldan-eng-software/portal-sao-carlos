import type { ModuleResult } from '@/lib/module-result';
import type { NewsItem } from '@/modules/news/types';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';

interface NewsListProps {
  result: ModuleResult<NewsItem[]>;
}

/** Data/hora reais em fuso America/Sao_Paulo (regra do PRD — nunca datar como atual sem ser). */
function formatDateTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(parsed);
}

/**
 * Listagem completa de notícias agregadas dos feeds (Spec 04 do PRD de SEO
 * local) — a home exibe apenas as 5 mais recentes; aqui vão até o limite do
 * adapter (20), ordenadas por data. Cada item leva o visitante ao original:
 * título + resumo + data + fonte + link, nunca cópia da matéria (constituição,
 * Regras Editoriais).
 */
export function NewsList({ result }: NewsListProps) {
  const items = result.data ?? [];
  // Em `error` o StatusMessage é a única mensagem honesta a exibir — uma
  // "lista vazia" ao lado dele sugeriria que não há notícias em vez de
  // indisponibilidade temporária (regra do PRD sobre datas/estados honestos).
  const showErrorOnly = items.length === 0 && result.status === 'error';

  return (
    <div className="space-y-4">
      {showErrorOnly ? null : items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <li
              key={`${item.url}-${item.publishedAt}`}
              className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-card sm:p-6"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-surface-container px-2.5 py-1 text-label-sm font-bold uppercase text-secondary">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    campaign
                  </span>
                  {item.sourceName}
                </span>
                <span className="text-label-sm text-outline">
                  <time dateTime={item.publishedAt}>{formatDateTime(item.publishedAt)}</time>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ContentLabel kind="noticia" />
                {item.category && (
                  <span className="rounded border border-border-subtle bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                    {item.category}
                  </span>
                )}
              </div>

              <h2 className="mt-2 font-display text-headline-sm text-primary">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary hover:underline"
                >
                  {item.title}
                </a>
              </h2>
              <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
                {item.summary}
              </p>

              <div className="mt-4 border-t border-border-subtle pt-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-label-md text-secondary hover:underline"
                >
                  Ler na fonte original
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    open_in_new
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">
            Nenhuma notícia disponível no momento. Tente novamente mais tarde.
          </p>
        </div>
      )}

      <StatusMessage result={result} />
    </div>
  );
}
