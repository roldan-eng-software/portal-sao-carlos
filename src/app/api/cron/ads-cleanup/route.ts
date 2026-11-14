import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPending } from '@/modules/ads-pending/loader';
import { isCronAuthorized } from '@/lib/cron-auth';
import { env } from '@/config/env';

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get('authorization'), env.cronSecret)) {
    return NextResponse.json({ success: false, errors: ['Não autorizado.'] }, { status: 401 });
  }

  const removed = await cleanupExpiredPending();
  console.info(JSON.stringify({ event: 'ads_pending_cleanup', removed, at: new Date().toISOString() }));

  return NextResponse.json({ success: true, removed });
}
