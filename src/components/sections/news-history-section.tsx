'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsHistoryItemCard } from '@/components/ui/news-history-item-card';
import { Pagination } from '@/components/ui/pagination';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';
import type { NewsHistoryPage } from '@/modules/news-history/types';

interface NewsHistorySectionProps {
  initialData: NewsHistoryPage;
}

function NewsHistoryContent({ initialData }: { initialData: NewsHistoryPage }) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<NewsHistoryPage>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);

  // Atualiza dados quando a página muda (client-side navigation)
  if (page !== data.page) {
    setIsLoading(true);
    fetch(`${window.location.pathname}?page=${page}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.json())
      .then((newData) => {
        setData(newData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  if (data.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ContentLabel kind="noticia" />
        <p className="text-neutral-500 dark:text-neutral-400 mt-4">
          Nenhuma notícia encontrada no histórico.
        </p>
      </div>
    );
  }

  return (
    <section aria-labelledby="news-history-heading" className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ContentLabel kind="noticia" />
          <h2 id="news-history-heading" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Histórico de Notícias
          </h2>
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          {data.total} notícia{data.total !== 1 ? 's' : ''} • Página {data.page} de {data.totalPages}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <NewsHistoryItemCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            date={item.date}
            sourceName={item.sourceName}
            sourceUrl={item.sourceUrl}
            imageUrl={item.imageUrl}
            category={item.category}
          />
        ))}
      </div>

      <Pagination currentPage={data.page} totalPages={data.totalPages} />

      <StatusMessage
        result={{
          status: data.status,
          lastUpdated: data.lastUpdated,
          errorMessage: data.errorMessage ?? null,
        }}
      />
    </section>
  );
}

export function NewsHistorySection({ initialData }: NewsHistorySectionProps) {
  return (
    <Suspense fallback={<div className="space-y-4" aria-busy="true" />}>
      <NewsHistoryContent initialData={initialData} />
    </Suspense>
  );
}