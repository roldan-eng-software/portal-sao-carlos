import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { loadPendingAds } from '@/modules/ads-pending/loader';
import { loadManagedPublished } from '@/modules/ads/manage';
import { isModeratorSecret } from '@/lib/auth';
import { ModerationClient } from './moderation-client';
import { ModeratorLogin } from './moderator-login';

export const metadata: Metadata = {
  title: 'Moderação de Anúncios — Portal São Carlos',
  description: 'Área restrita para moderação de anúncios gratuitos.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ModerationPage() {
  const cookieStore = await cookies();
  if (!isModeratorSecret(cookieStore.get('moderator_secret')?.value)) {
    return <ModeratorLogin />;
  }

  const [pending, published] = await Promise.all([loadPendingAds(), loadManagedPublished()]);

  return <ModerationClient initialPending={pending} initialPublished={published} />;
}
