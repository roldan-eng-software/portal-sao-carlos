import { Metadata } from 'next';
import { getNewsHistoryPage } from '@/modules/news-history/loader';
import { NewsHistorySection } from '@/components/sections/news-history-section';
import { JsonLd } from '@/components/seo/json-ld';

export const revalidate = 1800; // 30 min ISR

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function getPageData(searchParams: { page?: string }) {
  const page = parseInt(searchParams.page || '1', 10);
  return getNewsHistoryPage(page);
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const data = await getNewsHistoryPage(page);

  const siteName = 'Portal São Carlos';
  const title = page === 1
    ? 'Histórico de Notícias — Portal São Carlos'
    : `Histórico de Notícias (página ${page}) — Portal São Carlos`;

  const baseUrl = 'https://www.meubairro.dev.br';
  const canonicalUrl = page === 1
    ? `${baseUrl}/noticias`
    : `${baseUrl}/noticias?page=${page}`;

  const prevUrl = page > 1
    ? page === 2 ? `${baseUrl}/noticias` : `${baseUrl}/noticias?page=${page - 1}`
    : undefined;
  const nextUrl = page < data.totalPages ? `${baseUrl}/noticias?page=${page + 1}` : undefined;

  return {
    title,
    description: 'Listagem completa e paginada de notícias de São Carlos/SP. Acesse matérias antigas de diversos veículos locais em um só lugar.',
    openGraph: {
      title,
      description: 'Listagem completa e paginada de notícias de São Carlos/SP.',
      url: canonicalUrl,
      siteName,
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Listagem completa e paginada de notícias de São Carlos/SP.',
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'rel="canonical"': canonicalUrl,
      ...(prevUrl ? { 'rel="prev"': prevUrl } : {}),
      ...(nextUrl ? { 'rel="next"': nextUrl } : {}),
    },
  };
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getPageData(params);

  // JSON-LD ItemList para a lista de notícias
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: (data.page - 1) * data.pageSize + index + 1,
      item: {
        '@type': 'NewsArticle',
        headline: item.title,
        description: item.summary,
        datePublished: item.date,
        author: {
          '@type': 'Organization',
          name: item.sourceName,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Portal São Carlos',
        },
        url: item.sourceUrl,
        ...(item.imageUrl ? { image: item.imageUrl } : {}),
      },
    })),
    numberOfItems: data.total,
  };

  return (
    <>
      <JsonLd data={itemListJsonLd as any} />
      <main id="conteudo" className="container mx-auto px-4 py-8">
        <NewsHistorySection initialData={data} />
      </main>
    </>
  );
}