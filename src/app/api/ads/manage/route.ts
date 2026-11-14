import { NextRequest, NextResponse } from 'next/server';
import { editPublishedAd, updateAdStatus, removeAd } from '@/modules/ads/manage';
import { requireModeratorAuth } from '@/lib/auth';

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
      case 'edit':
        return NextResponse.json(await editPublishedAd(adId, data));

      case 'suspend':
        return NextResponse.json(await updateAdStatus(adId, 'suspenso'));

      case 'reactivate':
        return NextResponse.json(await updateAdStatus(adId, 'publicado'));

      case 'remove':
        return NextResponse.json(await removeAd(adId));

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