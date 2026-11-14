import { NextRequest, NextResponse } from 'next/server';
import { rejectAdSubmission } from '@/modules/ads-pending/notify';
import { generateWhatsAppLink, generateMailtoLink, rejectionMessage } from '@/modules/ads-pending/notify';
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

    const result = await rejectAdSubmission(submissionId, reason.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status: 400 },
      );
    }

    // Gera links de notificação a partir do pendente recusado
    let notificationLinks = { whatsapp: null as string | null, email: null as string | null };
    const submission = result.submission;
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