import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';

function verifyModerator(request: NextRequest): boolean {
  const secret = env.moderatorSecret;
  if (!secret) return false;

  // Verifica header Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7) === secret;
  }

  // Verifica query parameter ?secret=
  const url = new URL(request.url);
  if (url.searchParams.get('secret') === secret) {
    return true;
  }

  // Verifica cookie (opcional)
  const cookie = request.cookies.get('moderator_secret');
  if (cookie?.value === secret) {
    return true;
  }

  return false;
}

export async function requireModeratorAuth(request: NextRequest): Promise<NextResponse | null> {
  if (!verifyModerator(request)) {
    return NextResponse.json(
      { success: false, error: 'Acesso não autorizado. Moderador inválido.' },
      { status: 401 },
    );
  }
  return null;
}