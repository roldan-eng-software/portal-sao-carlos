import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CONTENT_LABELS, ContentLabel, contentLabel } from '@/components/ui/content-label';

const ALL_KINDS = [
  'noticia',
  'informativo',
  'servico-publico',
  'anuncio-gratuito',
  'anuncio-patrocinado',
  'divulgacao-propria',
] as const;

describe('CONTENT_LABELS', () => {
  it('possui rótulo textual para os 6 kinds', () => {
    for (const kind of ALL_KINDS) {
      expect(CONTENT_LABELS[kind]).toBeTruthy();
      expect(typeof CONTENT_LABELS[kind]).toBe('string');
    }
  });

  it('todos os rótulos são distintos (diferenciação semântica FR-008)', () => {
    const labels = ALL_KINDS.map((kind) => CONTENT_LABELS[kind]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('publicidade nunca recebe rótulo de notícia', () => {
    expect(CONTENT_LABELS['anuncio-patrocinado']).not.toBe(CONTENT_LABELS.noticia);
    expect(CONTENT_LABELS['anuncio-gratuito']).not.toBe(CONTENT_LABELS.noticia);
    expect(CONTENT_LABELS['divulgacao-propria']).not.toBe(CONTENT_LABELS.noticia);
    expect(CONTENT_LABELS['divulgacao-propria']).toContain('Publicidade');
    expect(CONTENT_LABELS['anuncio-patrocinado']).toContain('Publicidade');
  });
});

describe('ContentLabel', () => {
  it('renderiza o rótulo textual e o data-kind', () => {
    render(<ContentLabel kind="anuncio-patrocinado" />);
    const badge = screen.getByText('Publicidade');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-kind', 'anuncio-patrocinado');
  });

  it('aceita rótulo customizado (ex.: "Parceiro local")', () => {
    render(<ContentLabel kind="anuncio-patrocinado" customLabel="Parceiro local" />);
    expect(screen.getByText('Parceiro local')).toBeInTheDocument();
  });

  it('contentLabel devolve o rótulo do mapa', () => {
    expect(contentLabel('noticia')).toBe('Notícia');
    expect(contentLabel('anuncio-gratuito')).toBe('Anúncio gratuito');
  });
});
