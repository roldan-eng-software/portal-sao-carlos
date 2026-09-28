import type { ModuleResult } from '@/lib/module-result';
import type { NewsItem } from '@/modules/news/types';
import { StatusMessage } from '@/components/ui/status-message';
import { Section } from '@/components/ui/section';
import { NewsBento } from './news-bento';

interface NewsSectionProps {
  result: ModuleResult<NewsItem[]>;
}

export function NewsSection({ result }: NewsSectionProps) {
  const items = result.data ?? [];

  return (
    <Section id="noticias" aria-labelledby="noticias-titulo" className="py-10">
      {/* Cabeçalho com filtros (grid bento abaixo) */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
            <span className="text-label-sm uppercase tracking-wider text-secondary">
              Jornalismo &amp; Atualizações
            </span>
          </div>
          <h2 id="noticias-titulo" className="font-display text-headline-lg text-primary">
            Notícias de São Carlos e Região
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Cobertura em tempo real com apuração independente e curadoria das principais fontes
            oficiais. Títulos e resumos com link para a fonte original.
          </p>
        </div>
      </div>

      {items.length > 0 ? (
        <NewsBento items={items} />
      ) : (
        <div className="rounded-2xl bg-surface-card p-6 shadow-card">
          <p className="text-body-md text-on-surface-variant">
            {result.status === 'ok'
              ? 'Nenhuma notícia nova no momento. Confira os informativos e contatos úteis abaixo.'
              : 'As notícias não puderam ser carregadas agora.'}
          </p>
        </div>
      )}

      <div className="mt-4">
        <StatusMessage result={result} />
      </div>
    </Section>
  );
}
