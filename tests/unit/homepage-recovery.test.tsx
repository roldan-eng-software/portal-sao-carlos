import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/sections/hero-section';
import { AdsSection } from '@/components/sections/ads-section';
import { errorResult } from '@/lib/module-result';

describe('HeroSection', () => {
  it('prioriza os serviços públicos e mantém o cadastro comercial contextual', () => {
    render(<HeroSection />);

    expect(screen.getByRole('link', { name: 'Previsão do tempo' })).toHaveAttribute(
      'href',
      '#clima',
    );
    expect(screen.getByRole('link', { name: 'Notícias locais' })).toHaveAttribute(
      'href',
      '#noticias',
    );
    expect(screen.getByRole('link', { name: 'Telefones úteis' })).toHaveAttribute(
      'href',
      '#contatos',
    );
    expect(screen.getByRole('link', { name: 'Conheça os critérios de cadastro' })).toHaveAttribute(
      'href',
      '/anuncie',
    );
    expect(screen.queryByText(/mais consultado|milhares|tempo real/i)).not.toBeInTheDocument();
  });
});

describe('AdsSection', () => {
  it('oferece recuperação quando o Guia Comercial está indisponível', () => {
    render(<AdsSection result={errorResult('Anúncios do portal')} />);

    expect(screen.getByText('O Guia Comercial está temporariamente indisponível.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver guia completo' })).toHaveAttribute(
      'href',
      '/empresas',
    );
    expect(screen.getByRole('link', { name: 'Cadastrar o primeiro negócio' })).toHaveAttribute(
      'href',
      '/anuncie',
    );
  });
});
