import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { metadata as sobreMetadata } from '@/app/sobre/page';
import SobrePage from '@/app/sobre/page';
import { metadata as contatoMetadata } from '@/app/contato/page';
import ContatoPage from '@/app/contato/page';
import { metadata as termosMetadata } from '@/app/termos-de-uso/page';
import TermosDeUsoPage from '@/app/termos-de-uso/page';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import sitemap from '@/app/sitemap';

/**
 * Páginas institucionais — Spec 03 do PRD de SEO local.
 * Cada página precisa de título, descrição e canonical próprios, H1 único
 * e breadcrumb com BreadcrumbList válido.
 */

function parseJsonLd(index = 0): Record<string, unknown> {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  return JSON.parse(scripts[index].innerHTML) as Record<string, unknown>;
}

describe('metadata das páginas institucionais', () => {
  it.each([
    ['sobre', sobreMetadata, '/sobre'],
    ['contato', contatoMetadata, '/contato'],
    ['termos-de-uso', termosMetadata, '/termos-de-uso'],
  ])('/%s tem título, descrição e canonical próprios', (_name, meta, canonical) => {
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.alternates?.canonical).toBe(canonical);
  });
});

describe('renderização', () => {
  it('/sobre tem H1 único e breadcrumb', () => {
    const { container } = render(<SobrePage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: /Sobre o Portal São Carlos/ })).toBeTruthy();
    expect(container.querySelector('nav[aria-label="Você está em"]')).toBeTruthy();
  });

  it('/contato tem H1 único, e-mail sempre presente e nota de emergência', () => {
    render(<ContatoPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /@/ })).toBeTruthy();
    expect(screen.getByText(/não é canal de emergência/)).toBeTruthy();
  });

  it('/termos-de-uso tem H1 único e trata responsabilidade do anunciante', () => {
    render(<TermosDeUsoPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/responsabilidade do anunciante/i)).toBeTruthy();
  });
});

describe('Breadcrumbs (JSON-LD)', () => {
  it('emite BreadcrumbList com home no position 1 e níveis na ordem', () => {
    render(<Breadcrumbs items={[{ name: 'Utilidade pública', href: '/utilidade-publica' }, { name: 'Telefones', href: '/utilidade-publica/telefones-uteis' }]} />);

    const data = parseJsonLd();
    expect(data['@type']).toBe('BreadcrumbList');
    const items = data.itemListElement as Array<{ position: number; name: string }>;
    expect(items.map((i) => i.name)).toEqual(['Início', 'Utilidade pública', 'Telefones']);
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it('escapa caracteres de tag no JSON-LD (não fecha a tag script)', () => {
    const { container } = render(<Breadcrumbs items={[{ name: 'A <script>', href: '/x' }]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain('<script>');
    expect(script?.innerHTML).toContain('\\u003c');
  });
});

describe('sitemap com páginas institucionais', () => {
  const urls = sitemap().map((entry) => new URL(entry.url).pathname);

  it('inclui /sobre, /contato e /termos-de-uso', () => {
    expect(urls).toContain('/sobre');
    expect(urls).toContain('/contato');
    expect(urls).toContain('/termos-de-uso');
  });
});
