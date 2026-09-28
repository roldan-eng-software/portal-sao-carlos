import type { ModuleResult } from '@/lib/module-result';
import type { Notice } from '@/modules/notices/loader';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';

interface NoticesSectionProps {
  result: ModuleResult<Notice[]>;
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' })
    .format(parsed);
}

export function NoticesSection({ result }: NoticesSectionProps) {
  const items = result.data ?? [];

  return (
    <section id="informativos" aria-labelledby="informativos-titulo" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="informativos-titulo" className="text-xl font-bold text-slate-900">
          Informativos e avisos
        </h2>
        <span className="text-xs text-slate-500">
          Conteúdo de terceiros — confirme no canal oficial
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <article className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
                <ContentLabel kind={item.kind} />
                <h3 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{item.summary}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
                  <time dateTime={item.date}>{formatDate(item.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{item.sourceName}</span>
                  {item.sourceUrl && (
                    <>
                      <span aria-hidden="true">·</span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        Canal oficial
                      </a>
                    </>
                  )}
                </p>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">Nenhum informativo publicado no momento.</p>
        </div>
      )}

      <div className="mt-3">
        <StatusMessage result={result} />
      </div>
    </section>
  );
}
