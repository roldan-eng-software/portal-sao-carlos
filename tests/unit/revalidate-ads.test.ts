import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireModeratorAuth: vi.fn(),
  approveAdSubmission: vi.fn(),
  editPublishedAd: vi.fn(),
  updateAdStatus: vi.fn(),
  removeAd: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

vi.mock('@/lib/auth', () => ({ requireModeratorAuth: mocks.requireModeratorAuth }));

vi.mock('@/modules/ads-pending/notify', () => ({
  approveAdSubmission: mocks.approveAdSubmission,
  approvalMessage: () => ({ whatsapp: 'mensagem' }),
  generateWhatsAppLink: () => 'https://wa.me/5516999999999',
}));

vi.mock('@/modules/ads/manage', () => ({
  editPublishedAd: mocks.editPublishedAd,
  updateAdStatus: mocks.updateAdStatus,
  removeAd: mocks.removeAd,
}));

import { revalidateAdsPages } from '@/lib/revalidate-ads';
import { POST as approveRoute } from '@/app/api/ads/approve/route';
import { PATCH as manageRoute } from '@/app/api/ads/manage/route';

/** Helpers para simular as requisições sem depender do runtime completo do Next. */
const request = (body: unknown) =>
  ({ json: async () => body }) as unknown as NextRequest;

const revalidatedPaths = () => mocks.revalidatePath.mock.calls.map((call) => call[0]);

describe('revalidateAdsPages', () => {
  beforeEach(() => {
    mocks.revalidatePath.mockReset();
  });

  it('invalida home, hub do guia comercial, rotas de detalhe e sitemap', () => {
    revalidateAdsPages('morena-cafe');

    expect(revalidatedPaths()).toEqual(
      expect.arrayContaining([
        '/',
        '/empresas',
        '/empresas/[slug]',
        '/empresas/morena-cafe',
        '/sitemap.xml',
      ]),
    );
  });

  it('funciona sem id (ex.: remoção em lote)', () => {
    revalidateAdsPages();

    expect(revalidatedPaths()).toContain('/');
    expect(revalidatedPaths()).toContain('/empresas');
    expect(revalidatedPaths().some((path) => path.startsWith('/empresas/') && path !== '/empresas/[slug]')).toBe(
      false,
    );
  });
});

describe('POST /api/ads/approve — invalidação da landing page', () => {
  beforeEach(() => {
    mocks.revalidatePath.mockReset();
    mocks.requireModeratorAuth.mockReset();
    mocks.approveAdSubmission.mockReset();
    mocks.requireModeratorAuth.mockResolvedValue(null);
  });

  it('revalida as páginas públicas depois de aprovar', async () => {
    mocks.approveAdSubmission.mockResolvedValue({
      success: true,
      publishedAd: { id: 'morena-cafe', whatsapp: null, phone: '016993890254' },
    });

    const response = await approveRoute(request({ submissionId: 'morena-cafe' }));

    expect(response.status).toBe(200);
    expect(revalidatedPaths()).toContain('/empresas/morena-cafe');
    expect(revalidatedPaths()).toContain('/');
  });

  it('não revalida quando a aprovação falha', async () => {
    mocks.approveAdSubmission.mockResolvedValue({
      success: false,
      errors: ['Anúncio não encontrado.'],
    });

    const response = await approveRoute(request({ submissionId: 'nao-existe' }));

    expect(response.status).toBe(400);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/ads/manage — invalidação da landing page', () => {
  beforeEach(() => {
    mocks.revalidatePath.mockReset();
    mocks.requireModeratorAuth.mockReset();
    mocks.updateAdStatus.mockReset();
    mocks.removeAd.mockReset();
    mocks.requireModeratorAuth.mockResolvedValue(null);
  });

  it('revalida ao suspender um anúncio publicado', async () => {
    mocks.updateAdStatus.mockResolvedValue({ success: true });

    const response = await manageRoute(
      request({ adId: 'morena-cafe', action: 'suspend' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.updateAdStatus).toHaveBeenCalledWith('morena-cafe', 'suspenso');
    expect(revalidatedPaths()).toContain('/empresas/morena-cafe');
  });

  it('revalida ao remover definitivamente', async () => {
    mocks.removeAd.mockResolvedValue({ success: true });

    await manageRoute(request({ adId: 'morena-cafe', action: 'remove' }));

    expect(mocks.removeAd).toHaveBeenCalledWith('morena-cafe');
    expect(revalidatedPaths()).toContain('/');
  });

  it('não revalida quando a ação falha', async () => {
    mocks.removeAd.mockResolvedValue({
      success: false,
      errors: ['Anúncio não encontrado.'],
    });

    const response = await manageRoute(
      request({ adId: 'nao-existe', action: 'remove' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('não revalida em ação inválida', async () => {
    const response = await manageRoute(request({ adId: 'x', action: 'clonar' }));

    expect(response.status).toBe(400);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
