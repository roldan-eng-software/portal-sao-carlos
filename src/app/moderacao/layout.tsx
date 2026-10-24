import { redirect } from 'next/navigation';
import { env } from '@/config/env';

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica se há MODERATOR_SECRET configurado
  if (!env.moderatorSecret) {
    // Se não há secret configurado, bloqueia acesso em produção
    if (process.env.VERCEL_ENV === 'production') {
      redirect('/404');
    }
    // Em dev, permite acesso sem secret (para desenvolvimento)
    return <>{children}</>;
  }

  // A verificação real acontece nas API routes
  // Aqui apenas renderizamos a página - a proteção é server-side nas APIs
  return <>{children}</>;
}