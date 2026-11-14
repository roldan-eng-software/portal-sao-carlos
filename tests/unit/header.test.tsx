import { fireEvent, render, screen } from '@testing-library/react';
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
});
