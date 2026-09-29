'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { NewsItem } from '@/modules/news/types';
import { ContentLabel } from '@/components/ui/content-label';

interface NewsBentoProps {
  items: NewsItem[];
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

/** Grid bento do design: destaque 8 col, lateral 4 col, depois 4/4/4 e 6/6. */
function spanClass(index: number): string {
  if (index === 0) return 'md:col-span-8';
  if (index <= 4) return 'md:col-span-4';
  return 'md:col-span-6';
}

function SourceLink({ item, featured }: { item: NewsItem; featured?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-label-md text-secondary hover:underline"
    >
      <span>{featured ? 'Ler reportagem completa' : 'Ver na fonte'}</span>
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        open_in_new
      </span>
    </a>
  );
}

export function NewsBento({ items }: NewsBentoProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) {
      if (item.category) seen.add(item.category);
      if (seen.size >= 4) break;
    }
    return [...seen];
  }, [items]);

  const visible = useMemo(
    () => (filter ? items.filter((item) => item.category === filter) : items),
    [items, filter],
  );

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-card p-6 shadow-card">
        <p className="text-body-md text-on-surface-variant">
          Nenhuma notícia nesta categoria no momento. Confira os informativos e contatos úteis
          abaixo.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filtros por categoria */}
      {categories.length > 0 && (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar notícias por categoria"
        >
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`rounded-full px-4 py-1.5 text-label-md shadow-sm transition-all ${
              filter === null
                ? 'bg-primary text-on-primary'
                : 'bg-surface-card text-on-surface hover:bg-surface-container'
            }`}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              className={`rounded-full px-4 py-1.5 text-label-md shadow-sm transition-all ${
                filter === category
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-card text-on-surface hover:bg-surface-container'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {visible.map((item, index) =>
          index === 0 ? (
            /* Card destaque (8 col) com imagem + gradiente */
            <article
              key={item.url}
              className={`group flex flex-col overflow-hidden rounded-2xl bg-surface-card shadow-card transition-shadow hover:shadow-card-hover ${spanClass(index)}`}
            >
              <div className="relative h-64 w-full overflow-hidden bg-linear-to-br from-primary to-primary-container sm:h-72">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/30 to-transparent"
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="rounded-md bg-secondary px-2.5 py-1 text-label-sm font-bold uppercase tracking-wider text-on-secondary">
                    Destaque Regional
                  </span>
                  {item.category && (
                    <span className="rounded-md bg-surface-card/90 px-2.5 py-1 text-label-sm text-primary backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="mb-1 block text-label-sm text-surface-variant">
                    {item.sourceName} · {formatDate(item.publishedAt)}
                  </span>
                  <h3 className="font-display text-headline-md font-bold leading-tight text-surface-bright">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <p className="mb-4 line-clamp-2 text-body-md text-on-surface-variant">
                  {item.summary}
                </p>
                <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-body-sm">
                  <span className="flex items-center gap-1 text-outline">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      calendar_today
                    </span>
                    {formatDate(item.publishedAt)}
                  </span>
                  <SourceLink item={item} featured />
                </div>
              </div>
            </article>
          ) : (
            /* Cards menores */
            <article
              key={item.url}
              className={`flex flex-col justify-between rounded-2xl bg-surface-card p-4 shadow-card transition-shadow hover:shadow-card-hover ${spanClass(index)}`}
            >
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <ContentLabel kind="noticia" />
                  <span className="truncate text-label-sm text-outline">{item.sourceName}</span>
                </div>
                <h3 className="mb-2 font-display text-headline-sm leading-snug text-primary">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-secondary hover:underline"
                  >
                    {item.title}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </h3>
                <p className="line-clamp-3 text-body-sm text-on-surface-variant">{item.summary}</p>
                {item.category && (
                  <p className="mt-2 text-label-sm uppercase tracking-wide text-secondary">
                    {item.category}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-body-sm">
                <span className="text-label-sm text-outline">{formatDate(item.publishedAt)}</span>
                <SourceLink item={item} />
              </div>
            </article>
          ),
        )}
      </div>
    </>
  );
}
