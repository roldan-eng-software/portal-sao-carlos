import { NextRequest, NextResponse } from 'next/server';
import { loadPendingAds } from '@/modules/ads-pending/loader';
import { requireModeratorAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireModeratorAuth(request);
  if (authError) return authError;

  const pending = await loadPendingAds();
  // Ordena por data de submissão (mais recentes primeiro)
  pending.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return NextResponse.json({
    success: true,
    data: pending,
  });
}