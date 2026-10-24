import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { NewsList } from '@/components/sections/news-list';
import { getNews } from '@/modules/news/adapter';

/** Mesmo intervalo da home — nenhuma fonte é consultada a cada visita. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Notícias de São Carlos e região',
  description:
    'Últimas notícias de São Carlos/SP e região com título, resumo, data, fonte e link para a publicação original. São Carlos Agora, G1 e Google News reunidos no Portal São Carlos.',
  alternates: { canonical: '/noticias' },
};

export default async function NoticiasPage() {
  const news = await getNews();

  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Notícias', href: '/noticias' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          Notícias de São Carlos e região
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Reunimos as últimas matérias dos feeds locais, ordenadas por data. Cada notícia mostra
          título, resumo, data, fonte e um link para a publicação original — o Portal São Carlos
          não republica matérias integrais. Conteúdo de terceiros pode mudar; confirme na fonte.
        </p>
      </header>

      <NewsList result={news} />
    </article>
  );
}
