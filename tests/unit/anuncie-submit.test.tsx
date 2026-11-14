import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AnunciePage from '@/app/anuncie/page';
import { ToastProvider } from '@/components/ui/Toast';

const mocks = vi.hoisted(() => ({
  submitAdAction: vi.fn(),
}));

vi.mock('@/app/anuncie/actions', () => ({
  submitAdAction: mocks.submitAdAction,
}));

function fillForm() {
  fireEvent.change(screen.getByLabelText(/Nome do Estabelecimento/), {
    target: { value: 'Padaria Aurora' },
  });
  fireEvent.change(screen.getByLabelText(/^Categoria/), { target: { value: 'Alimentação' } });
  fireEvent.change(screen.getByLabelText(/^Descrição/), {
    target: { value: 'Pães e doces artesanais no centro.' },
  });
  fireEvent.change(screen.getByLabelText(/^Bairro/), { target: { value: 'Centro' } });
  fireEvent.change(screen.getByLabelText(/Telefone \(com DDD\)/), {
    target: { value: '(16) 99999-9999' },
  });
  fireEvent.change(screen.getByLabelText(/E-mail para Contato da Moderação/), {
    target: { value: 'contato@padaria.com' },
  });
}

describe('/anuncie — envio para moderação', () => {
  beforeEach(() => {
    mocks.submitAdAction.mockReset();
  });

  it('mostra o aviso flutuante de sucesso e limpa o formulário para um novo pedido', async () => {
    mocks.submitAdAction.mockResolvedValue({
      success: true,
      message: 'Anúncio enviado com sucesso! Vamos revisar e responder no e-mail informado.',
    });

    render(
      <>
        <AnunciePage />
        <ToastProvider />
      </>,
    );

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para Análise' }));

    await waitFor(() => expect(mocks.submitAdAction).toHaveBeenCalledTimes(1));

    // Aviso flutuante (role="status") com a confirmação do envio.
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Anúncio enviado com sucesso! Vamos revisar e responder no e-mail informado.',
    );

    // Formulário limpo e pronto para outro comércio.
    expect(screen.getByLabelText(/Nome do Estabelecimento/)).toHaveValue('');
    expect(screen.getByLabelText(/^Descrição/)).toHaveValue('');
    expect(screen.getByLabelText(/^Bairro/)).toHaveValue('');
    expect(screen.getByLabelText(/Telefone \(com DDD\)/)).toHaveValue('');
    expect(screen.getByLabelText(/E-mail para Contato da Moderação/)).toHaveValue('');
    expect(screen.getByLabelText(/^Categoria/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Enviar para Análise' })).toBeEnabled();
  });

  it('mantém os dados e avisa quando a validação falha', async () => {
    mocks.submitAdAction.mockResolvedValue({
      success: false,
      errors: [{ field: 'businessName', message: 'Nome do comércio é obrigatório.' }],
    });

    render(
      <>
        <AnunciePage />
        <ToastProvider />
      </>,
    );

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para Análise' }));

    // Erro do campo (junto ao input) + o mesmo aviso no toast.
    const toastRegion = await screen.findByTestId('toast-region');
    expect(within(toastRegion).getByText('Nome do comércio é obrigatório.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do Estabelecimento/)).toHaveValue('Padaria Aurora');
  });

  it('mostra a mensagem do servidor quando o envio falha (nunca em silêncio)', async () => {
    mocks.submitAdAction.mockResolvedValue({
      success: false,
      message: 'Não foi possível enviar seu anúncio agora. Tente novamente em instantes.',
    });

    render(
      <>
        <AnunciePage />
        <ToastProvider />
      </>,
    );

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para Análise' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível enviar seu anúncio agora. Tente novamente em instantes.',
    );
    // Nada é apagado: o usuário não perde o que digitou.
    expect(screen.getByLabelText(/Nome do Estabelecimento/)).toHaveValue('Padaria Aurora');
    expect(screen.getByLabelText(/E-mail para Contato da Moderação/)).toHaveValue(
      'contato@padaria.com',
    );
  });
});
