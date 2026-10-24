import { NextRequest, NextResponse } from 'next/server';
import { rejectAdSubmission } from '@/modules/ads-pending/notify';
import { generateWhatsAppLink, generateMailtoLink, rejectionMessage } from '@/modules/ads-pending/notify';
import { loadPendingAds } from '@/modules/ads-pending/loader';
import { requireModeratorAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = await requireModeratorAuth(request);
  if (authError) return authError;

  try {
    const { submissionId, reason } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { success: false, errors: ['ID da submissão é obrigatório.'] },
        { status: 400 },
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { success: false, errors: ['Motivo da recusa é obrigatório.'] },
        { status: 400 },
      );
    }

    // Busca submissão original para gerar notificação
    const pending = await loadPendingAds();
    const submission = pending.find((ad) => ad.id === submissionId);

    const result = await rejectAdSubmission(submissionId, reason.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 400 },
      );
    }

    // Gera links de notificação se houver submissão original
    let notificationLinks = { whatsapp: null as string | null, email: null as string | null };
    if (submission) {
      const rejection = rejectionMessage(submission, reason.trim());
      notificationLinks = {
        whatsapp: submission.whatsapp
          ? generateWhatsAppLink(submission.whatsapp, rejection.whatsapp)
          : submission.phone
          ? generateWhatsAppLink(submission.phone, rejection.whatsapp)
          : null,
        email: submission.url
          ? generateMailtoLink(submission.url.replace(/^https?:\/\//, ''), rejection.subject, rejection.body)
          : null,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Anúncio recusado. Motivo registrado.',
      notificationLinks,
    });
  } catch (error) {
    console.error('Erro ao recusar anúncio:', error);
    return NextResponse.json(
      { success: false, errors: ['Erro interno do servidor.'] },
      { status: 500 },
    );
  }
}