import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from '@/components/layout/header';

describe('Header', () => {
  it('uses a CSS chevron instead of an unavailable Material Symbol ligature', () => {
    render(<Header />);

    expect(screen.queryByText('expand_more')).not.toBeInTheDocument();
    expect(screen.queryByText('expand_less')).not.toBeInTheDocument();
  });

  it('opens the institutional navigation through its accessible button', () => {
    render(<Header />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Institucional' })[0]);

    expect(screen.getByRole('menuitem', { name: 'Sobre o Portal' })).toHaveAttribute(
      'href',
      '/sobre',
    );
  });

  it('keeps the mobile navigation collapsed until the toggle is activated', () => {
    render(<Header />);

    const toggle = screen.getByRole('button', { name: 'Abrir menu de navegação' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('navigation', { name: 'Navegação principal (mobile)' }),
    ).not.toBeInTheDocument();

    fireEvent.click(toggle);

    const mobileNav = screen.getByRole('navigation', { name: 'Navegação principal (mobile)' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-nav');
    expect(
      within(mobileNav).getByRole('link', { name: 'Telefones de Emergência' }),
    ).toHaveAttribute('href', '#contatos');
    expect(
      within(mobileNav).getByRole('link', { name: 'Política de privacidade' }),
    ).toHaveAttribute('href', '/politica-de-privacidade');

    fireEvent.click(within(mobileNav).getByRole('link', { name: 'Notícias' }));

    expect(
      screen.queryByRole('navigation', { name: 'Navegação principal (mobile)' }),
    ).not.toBeInTheDocument();
  });

  it('closes the mobile navigation with Escape and returns focus to the toggle', () => {
    render(<Header />);

    const toggle = screen.getByRole('button', { name: 'Abrir menu de navegação' });
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Navegação principal (mobile)' })).toBeVisible();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(
      screen.queryByRole('navigation', { name: 'Navegação principal (mobile)' }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(toggle);
  });
});
