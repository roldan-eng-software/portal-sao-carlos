import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { NoticesList } from '@/components/sections/notices-list';
import { getNotices, type Notice } from '@/modules/notices/adapter';

/** Mesmo intervalo da home — nenhuma fonte é consultada a cada visita. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Avisos do SAAE em São Carlos',
  description:
    'Comunicados e avisos do SAAE São Carlos: falta de água, manutenção na rede e orientações aos moradores, com data e link para o canal oficial do SAAE.',
  alternates: { canonical: '/avisos/saae' },
};

/**
 * Filtra os avisos emitidos pelo SAAE (o adapter combina curadoria do portal
 * + RSS oficial em um resultado único; a atribuição de fonte é preservada em
 * `sourceName`, que é o que este filtro usa).
 */
function filterSaae(notices: Notice[]): Notice[] {
  return notices.filter((item) => item.sourceName.toLowerCase().includes('saae'));
}

export default async function AvisosSaaePage() {
  const notices = await getNotices();
  const saaeNotices: typeof notices = {
    ...notices,
    data: notices.data ? filterSaae(notices.data) : notices.data,
  };

  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs
        items={[
          { name: 'Avisos', href: '/avisos' },
          { name: 'SAAE', href: '/avisos/saae' },
        ]}
      />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          Avisos do SAAE em São Carlos
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Comunicados oficiais do SAAE São Carlos — manutenção da rede, interferências no
          abastecimento e orientações aos moradores. Este portal é independente e apenas reúne os
          avisos:{' '}
          <strong className="text-on-surface">
            em caso de emergência ou dúvida, fale diretamente com o SAAE pelo canal oficial
          </strong>
          .
        </p>
        <p className="mt-2 text-body-sm text-outline">
          <Link href="/avisos" className="text-secondary hover:underline">
            ← Ver todos os avisos de São Carlos
          </Link>
        </p>
      </header>

      <NoticesList
        result={saaeNotices}
        emptyMessage="Nenhum aviso do SAAE disponível no momento. Confira os comunicados no site oficial do SAAE."
      />
    </article>
  );
}
