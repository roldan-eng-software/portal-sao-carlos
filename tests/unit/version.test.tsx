import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { APP_VERSION, BUILD_COMMIT, DEPLOY_ENV, DEPLOY_LABEL } from '@/config/version';
import { Footer } from '@/components/layout/footer';

describe('config/version (controle de versões)', () => {
  it('APP_VERSION é uma versão semver válida (MAJOR.MINOR.PATCH)', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+(-[\w.]+)?$/);
  });

  it('DEPLOY_ENV é um ambiente conhecido', () => {
    expect(['production', 'preview', 'local']).toContain(DEPLOY_ENV);
  });

  it('DEPLOY_LABEL é não vazia e acompanha o ambiente', () => {
    expect(DEPLOY_LABEL.length).toBeGreaterThan(0);
    if (DEPLOY_ENV === 'production') expect(DEPLOY_LABEL).toBe('Em produção');
    if (DEPLOY_ENV === 'local') expect(DEPLOY_LABEL).toBe('Local');
  });

  it('BUILD_COMMIT é null ou hash curto de 7 caracteres hexadecimais', () => {
    if (BUILD_COMMIT !== null) {
      expect(BUILD_COMMIT).toMatch(/^[0-9a-f]{7}$/i);
    }
  });
});

describe('badge de versão no rodapé (landing page)', () => {
  it('renderiza a versão publicada para acompanhamento visual', () => {
    render(<Footer />);
    const badge = screen.getByTestId('versao-em-producao');
    expect(badge).toHaveAttribute('data-versao', APP_VERSION);
    expect(badge).toHaveAttribute('data-ambiente', DEPLOY_ENV);
    expect(badge).toHaveTextContent(`v${APP_VERSION}`);
    expect(badge).toHaveTextContent(DEPLOY_LABEL);
  });

  it('exibe o SHA do commit quando disponível no build', () => {
    render(<Footer />);
    const badge = screen.getByTestId('versao-em-producao');
    if (BUILD_COMMIT) {
      expect(badge).toHaveTextContent(BUILD_COMMIT);
    } else {
      expect(badge).not.toHaveTextContent(/[0-9a-f]{7}/);
    }
  });
});
