import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsSection } from '@/components/sections/news-section';
import { NoticesSection } from '@/components/sections/notices-section';
import { okResult } from '@/lib/module-result';
import type { NewsItem } from '@/modules/news/types';
import type { Notice } from '@/modules/notices/loader';

/**
 * Regra editorial de densidade da home (2026-10-09): no máximo 5 notícias
 * e 3 informativos exibidos — o recorte libera espaço para os anúncios sem
 * alterar o cache dos adapters. Os adapters entregam lista ordenada da mais
 * recente para a mais antiga; aqui reproduzimos essa ordenação.
 */
function makeNews(count: number): NewsItem[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `Notícia ${i + 1}`,
    summary: `Resumo da notícia ${i + 1}.`,
    publishedAt: new Date(Date.UTC(2026, 9, 8, 12 - i)).toISOString(),
    sourceName: 'Fonte de teste',
    url: `https://exemplo.com.br/noticia-${i + 1}`,
    category: 'Cidade',
  }));
}

function makeNotices(count: number): Notice[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `aviso-${i + 1}`,
    title: `Informativo ${i + 1}`,
    summary: `Resumo do informativo ${i + 1}.`,
    date: `2026-10-${String(10 - i).padStart(2, '0')}`,
    sourceName: 'SAAE São Carlos',
    sourceUrl: null,
    status: 'publicado',
    kind: 'informativo',
  }));
}

describe('NewsSection — limite de exibição', () => {
  it('exibe no máximo 5 das 8 notícias recebidas, mantendo as mais recentes', () => {
    render(<NewsSection result={okResult(makeNews(8), 'Fonte de teste')} />);

    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Notícia 1')).toBeInTheDocument();
    expect(screen.getByText('Notícia 5')).toBeInTheDocument();
    // 6ª em diante fica fora da home
    expect(screen.queryByText('Notícia 6')).not.toBeInTheDocument();
  });

  it('lista curta (≤ 5) é exibida por inteiro', () => {
    render(<NewsSection result={okResult(makeNews(3), 'Fonte de teste')} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });
});

describe('NoticesSection — limite de exibição', () => {
  it('exibe no máximo 3 dos 5 informativos recebidos, mantendo os mais recentes', () => {
    render(<NoticesSection result={okResult(makeNotices(5), 'Informativos do portal')} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Informativo 1')).toBeInTheDocument();
    expect(screen.getByText('Informativo 3')).toBeInTheDocument();
    expect(screen.queryByText('Informativo 4')).not.toBeInTheDocument();
  });

  it('lista curta (≤ 3) é exibida por inteiro', () => {
    render(<NoticesSection result={okResult(makeNotices(2), 'Informativos do portal')} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
