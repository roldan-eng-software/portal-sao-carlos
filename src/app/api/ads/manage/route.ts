import { NextRequest, NextResponse } from 'next/server';
import { editPublishedAd, updateAdStatus, removeAd } from '@/modules/ads/manage';
import { requireModeratorAuth } from '@/lib/auth';
import { revalidateAdsPages } from '@/lib/revalidate-ads';

export async function PATCH(request: NextRequest) {
  const authError = await requireModeratorAuth(request);
  if (authError) return authError;

  try {
    const { adId, action, data } = await request.json();

    if (!adId) {
      return NextResponse.json(
        { success: false, errors: ['ID do anúncio é obrigatório.'] },
        { status: 400 },
      );
    }

    switch (action) {
      case 'edit': {
        const result = await editPublishedAd(adId, data);
        if (result.success) revalidateAdsPages(adId);
        return NextResponse.json(result);
      }

      case 'suspend': {
        const result = await updateAdStatus(adId, 'suspenso');
        if (result.success) revalidateAdsPages(adId);
        return NextResponse.json(result);
      }

      case 'reactivate': {
        const result = await updateAdStatus(adId, 'publicado');
        if (result.success) revalidateAdsPages(adId);
        return NextResponse.json(result);
      }

      case 'remove': {
        const result = await removeAd(adId);
        if (result.success) revalidateAdsPages(adId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { success: false, errors: ['Ação inválida.'] },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Erro ao gerenciar anúncio:', error);
    return NextResponse.json(
      { success: false, errors: ['Erro interno do servidor.'] },
      { status: 500 },
    );
  }
}