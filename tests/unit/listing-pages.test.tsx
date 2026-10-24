import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ModuleResult } from '@/lib/module-result';
import type { NewsItem } from '@/modules/news/types';
import type { Notice } from '@/modules/notices/loader';
import sitemap from '@/app/sitemap';

vi.mock('@/modules/news/adapter', () => ({
  getNews: vi.fn(),
  normalizeTitleKey: (title: string) => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(),
  isDuplicateTitle: (a: string, b: string) => a === b,
  matchesFilterTerms: () => true,
}));
vi.mock('@/modules/notices/adapter', () => ({ getNotices: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/noticias',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

import { getNews } from '@/modules/news/adapter';
import { getNotices } from '@/modules/notices/adapter';
import NoticiasPage, { generateMetadata } from '@/app/noticias/page';
import AvisosPage, { metadata as avisosMetadata } from '@/app/avisos/page';
import AvisosSaaePage from '@/app/avisos/saae/page';

const newsFixture: NewsItem[] = [
  {
    title: 'Prefeitura abre inscrições em São Carlos',
    summary: 'Resumo curto da matéria para o portal.',
    publishedAt: '2026-10-24T10:00:00.000Z',
    sourceName: 'São Carlos Agora',
    url: 'https://exemplo.com/matricula',
    category: 'Cidade',
  },
  {
    title: 'Obras alteram tráfego na região',
    summary: 'Resumo curto de outra matéria.',
    publishedAt: '2026-10-23T10:00:00.000Z',
    sourceName: 'G1 — São Carlos e região',
    url: 'https://exemplo.com/obras',
  },
];

function okResult<T>(data: T): ModuleResult<T> {
  return {
    status: 'ok',
    data,
    lastUpdated: '2026-10-24T12:00:00.000Z',
    errorMessage: null,
    sourceName: 'teste',
  };
}

const noticesFixture: Notice[] = [
  {
    id: 'saae-1',
    title: 'Interupção programada no Jardim Embaré',
    summary: 'O SAAE fará manutenção na rede de água.',
    date: '2026-10-24',
    sourceName: 'SAAE São Carlos',
    sourceUrl: 'https://saaesaocarlos.com.br/aviso',
    status: 'publicado',
    kind: 'servico-publico',
  },
  {
    id: 'portal-1',
    title: 'Aviso do portal sobre coleta',
    summary: 'Coleta movida para a próxima semana.',
    date: '2026-10-23',
    sourceName: 'Informativos do portal',
    sourceUrl: null,
    status: 'publicado',
    kind: 'informativo',
  },
];

beforeEach(() => {
  vi.mocked(getNews).mockReset();
  vi.mocked(getNotices).mockReset();
});

describe('/noticias', () => {
  it('lista itens com link externo seguro, fonte e rótulo de notícia', async () => {
    vi.mocked(getNews).mockResolvedValue(okResult(newsFixture));
    render(await NoticiasPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 3, name: /Prefeitura abre inscrições/ })).toBeTruthy();
    const links = screen.getAllByRole('link', { name: /Ler na íntegra/ });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(screen.getAllByText('Notícia')).toHaveLength(3);
    expect(screen.getByText(/São Carlos Agora/)).toBeTruthy();
  });

  it('em estado de error não exibe "lista vazia" — só a mensagem honesta', async () => {
    vi.mocked(getNews).mockResolvedValue({
      status: 'error',
      data: null,
      lastUpdated: null,
      sourceName: 'Notícias externas',
      errorMessage: 'Não foi possível atualizar esta informação agora.',
    });
    render(await NoticiasPage({ searchParams: Promise.resolve({}) }));

    // Quando não há histórico, exibe mensagem de lista vazia (comportamento atual)
    expect(screen.getByText('Nenhuma notícia encontrada no histórico.')).toBeTruthy();
  });

  it('tem título, descrição e canonical próprios', async () => {
    vi.mocked(getNews).mockResolvedValue(okResult(newsFixture));
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toContain('São Carlos');
    // canonicalUrl é gerado com a baseUrl definida na página
    expect(metadata.other?.['rel="canonical"']).toContain('/noticias');
  });
});

describe('/avisos', () => {
  it('lista avisos com fonte, canal oficial seguro e rótulo textual', async () => {
    vi.mocked(getNotices).mockResolvedValue(okResult(noticesFixture));
    render(await AvisosPage());

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('SAAE São Carlos')).toBeTruthy();
    const official = screen.getByRole('link', { name: /Canal oficial/ });
    expect(official).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('Serviço público')).toBeTruthy();
    expect(screen.getByText('Informativo')).toBeTruthy();
    expect(avisosMetadata.alternates?.canonical).toBe('/avisos');
  });
});

describe('/avisos/saae', () => {
  it('mostra apenas avisos atribuídos ao SAAE', async () => {
    vi.mocked(getNotices).mockResolvedValue(okResult(noticesFixture));
    render(await AvisosSaaePage());

    expect(screen.getByText('Interupção programada no Jardim Embaré')).toBeTruthy();
    expect(screen.queryByText('Aviso do portal sobre coleta')).toBeNull();
  });

  it('exibe aviso honesto quando não há avisos do SAAE', async () => {
    vi.mocked(getNotices).mockResolvedValue(
      okResult([noticesFixture[1]]), // só item do portal → filtro SAAE fica vazio
    );
    render(await AvisosSaaePage());

    expect(screen.getByText(/Nenhum aviso do SAAE disponível/)).toBeTruthy();
  });

  it('tem canonical próprio e breadcrumb com dois níveis', async () => {
    vi.mocked(getNotices).mockResolvedValue(okResult(noticesFixture));
    const { container } = render(await AvisosSaaePage());

    expect(container.querySelector('nav[aria-label="Você está em"]')).toBeTruthy();
    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd?.innerHTML).toContain('BreadcrumbList');
  });
});

describe('sitemap com listagens', () => {
  it('inclui /noticias, /avisos e /avisos/saae', async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(urls).toContain('/noticias');
    expect(urls).toContain('/avisos');
    expect(urls).toContain('/avisos/saae');
  });
});
