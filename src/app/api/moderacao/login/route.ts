import { NextRequest, NextResponse } from 'next/server';
import { isModeratorSecret } from '@/lib/auth';

const COOKIE_NAME = 'moderator_secret';

export async function POST(request: NextRequest) {
  const { secret } = await request.json().catch(() => ({ secret: undefined }));

  if (typeof secret !== 'string' || !isModeratorSecret(secret)) {
    return NextResponse.json({ success: false, errors: ['Senha incorreta.'] }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
