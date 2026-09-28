import type { ModuleResult } from '@/lib/module-result';
import type { NewsItem } from '@/modules/news/types';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';

interface NewsSectionProps {
  result: ModuleResult<NewsItem[]>;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

export function NewsSection({ result }: NewsSectionProps) {
  const items = result.data ?? [];

  return (
    <section id="noticias" aria-labelledby="noticias-titulo" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="noticias-titulo" className="text-xl font-bold text-slate-900">
          Notícias de São Carlos e região
        </h2>
        <span className="text-xs text-slate-500">Títulos e resumos com link para a fonte original</span>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.url}>
              <article className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-1">
                  <ContentLabel kind="noticia" />
                </div>
                <h3 className="text-base font-semibold leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 hover:text-blue-700 hover:underline"
                  >
                    {item.title}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{item.sourceName}</span>
                  <span aria-hidden="true">·</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    Ver na fonte
                  </a>
                </p>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            {result.status === 'ok'
              ? 'Nenhuma notícia nova no momento. Confira os informativos e contatos úteis abaixo.'
              : 'As notícias não puderam ser carregadas agora.'}
          </p>
          <div className="mt-2">
            <StatusMessage result={result} />
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-3">
          <StatusMessage result={result} />
        </div>
      )}
    </section>
  );
}
