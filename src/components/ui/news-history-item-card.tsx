'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ContentLabel } from '@/components/ui/content-label';

interface NewsHistoryItemCardProps {
  title: string;
  summary: string;
  date: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl?: string;
  category?: string;
}

export function NewsHistoryItemCard({
  title,
  summary,
  date,
  sourceName,
  sourceUrl,
  imageUrl,
  category,
}: NewsHistoryItemCardProps) {
  const displayDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <article className="flex flex-col gap-3 p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ContentLabel kind="noticia" />
          {category && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
              {category}
            </span>
          )}
          <time className="text-xs text-neutral-500 dark:text-neutral-400 ml-auto" dateTime={date}>
            {displayDate}
          </time>
        </div>

        {imageUrl && (
          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
            {summary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[60%]">
            Fonte: {sourceName}
          </span>
          <Link
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Ler na íntegra →
          </Link>
        </div>
      </div>
    </article>
  );
}