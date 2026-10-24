import { NextRequest, NextResponse } from 'next/server';
import { approveAdSubmission } from '@/modules/ads-pending/notify';
import { generateWhatsAppLink, approvalMessage } from '@/modules/ads-pending/notify';
import { requireModeratorAuth } from '@/lib/auth';
import type { AdSubmission } from '@/modules/ads-pending/types';

export async function POST(request: NextRequest) {
  const authError = await requireModeratorAuth(request);
  if (authError) return authError;

  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { success: false, errors: ['ID da submissão é obrigatório.'] },
        { status: 400 },
      );
    }

    const result = await approveAdSubmission(submissionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 400 },
      );
    }

    // Gera links de notificação para o moderador usar
    const submission = result.publishedAd!;
    const approval = approvalMessage({
      ...submission,
      id: submissionId,
      status: 'pendente' as const,
      submittedAt: new Date().toISOString(),
    } as AdSubmission);

    const notificationLinks = {
      whatsapp: submission.whatsapp
        ? generateWhatsAppLink(submission.whatsapp, approval.whatsapp)
        : submission.phone
        ? generateWhatsAppLink(submission.phone, approval.whatsapp)
        : null,
      email: null as string | null, // email não está no AdPublished, seria do submission original
    };

    return NextResponse.json({
      success: true,
      message: 'Anúncio aprovado e publicado como anúncio gratuito.',
      publishedAd: result.publishedAd,
      notificationLinks,
    });
  } catch (error) {
    console.error('Erro ao aprovar anúncio:', error);
    return NextResponse.json(
      { success: false, errors: ['Erro interno do servidor.'] },
      { status: 500 },
    );
  }
}