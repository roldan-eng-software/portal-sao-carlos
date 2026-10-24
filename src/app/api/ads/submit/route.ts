import { NextRequest, NextResponse } from 'next/server';
import { createAdSubmission } from '@/modules/ads-pending/submit';
import { generateWhatsAppLink, generateMailtoLink, approvalMessage } from '@/modules/ads-pending/notify';

export async function POST(request: NextRequest) {
  try {
    // Obtém IP do cliente
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Parse do body
    const body = await request.json();

    // Cria submissão
    const result = await createAdSubmission(body, ip);

    // Headers de rate limit
    const headers = new Headers();
    if (result.rateLimitInfo) {
      headers.set('X-RateLimit-Limit', '10');
      headers.set('X-RateLimit-Remaining', result.rateLimitInfo.remaining.toString());
      headers.set('X-RateLimit-Reset', new Date(result.rateLimitInfo.resetAt).toISOString());
    }

    if (!result.success) {
      const status = result.errors?._rateLimit ? 429 : 400;
      return NextResponse.json(
        { success: false, errors: result.errors },
        { status, headers },
      );
    }

    // Gera links de notificação (para uso futuro pelo moderador)
    const submission = result.submission!;
    const approval = approvalMessage(submission);
    const notificationLinks = {
      whatsapp: submission.whatsapp
        ? generateWhatsAppLink(submission.whatsapp, approval.whatsapp)
        : submission.phone
        ? generateWhatsAppLink(submission.phone, approval.whatsapp)
        : null,
      email: submission.url
        ? generateMailtoLink(submission.url.replace(/^https?:\/\//, ''), approval.subject, approval.body)
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Anúncio enviado para moderação. Você receberá uma resposta em breve.',
        submissionId: submission.id,
        notificationLinks,
      },
      { status: 201, headers },
    );
  } catch (error) {
    console.error('Erro ao processar submissão de anúncio:', error);
    return NextResponse.json(
      { success: false, errors: { _server: 'Erro interno do servidor. Tente novamente mais tarde.' } },
      { status: 500 },
    );
  }
}