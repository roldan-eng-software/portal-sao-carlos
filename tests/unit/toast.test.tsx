import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, showToast } from '@/components/ui/Toast';

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('exibe o aviso disparado por showToast', () => {
    render(<ToastProvider />);

    act(() => {
      showToast('success', 'Anúncio enviado com sucesso!');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Anúncio enviado com sucesso!');
  });

  it('usa role="alert" para erros', () => {
    render(<ToastProvider />);

    act(() => {
      showToast('error', 'Não foi possível enviar.');
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível enviar.');
  });

  it('fecha o aviso ao clicar em "Fechar aviso"', () => {
    render(<ToastProvider />);

    act(() => {
      showToast('info', 'Aviso informativo');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByText('Aviso informativo')).not.toBeInTheDocument();
  });

  it('remove o aviso automaticamente depois de 6 segundos', () => {
    vi.useFakeTimers();
    render(<ToastProvider />);

    act(() => {
      showToast('success', 'Some sozinho');
    });
    expect(screen.getByText('Some sozinho')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.queryByText('Some sozinho')).not.toBeInTheDocument();
  });

  it('mantém no máximo três avisos empilhados', () => {
    render(<ToastProvider />);

    act(() => {
      showToast('success', 'Primeiro');
      showToast('success', 'Segundo');
      showToast('success', 'Terceiro');
      showToast('success', 'Quarto');
    });

    expect(screen.queryByText('Primeiro')).not.toBeInTheDocument();
    expect(screen.getByText('Segundo')).toBeInTheDocument();
    expect(screen.getByText('Quarto')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });
});
