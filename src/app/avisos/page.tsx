import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { NoticesList } from '@/components/sections/notices-list';
import { getNotices } from '@/modules/notices/adapter';

/** Mesmo intervalo da home — nenhuma fonte é consultada a cada visita. */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Avisos de utilidade pública de São Carlos',
  description:
    'Avisos e informativos de utilidade pública de São Carlos/SP: SAAE, avisos do portal e serviços públicos, com data, fonte oficial e link para o canal responsável.',
  alternates: { canonical: '/avisos' },
};

export default async function AvisosPage() {
  const notices = await getNotices();

  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Avisos', href: '/avisos' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">
          Avisos de utilidade pública de São Carlos
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Informativos oficiais e avisos de interesse público da cidade, do mais recente para o
          mais antigo. Sempre que o aviso for de um órgão, o link leva ao canal oficial —{' '}
          <strong className="text-on-surface">confirme a informação na fonte antes de agir</strong>.
        </p>
        <p className="mt-2 text-body-sm text-outline">
          Procura só avisos da água? Veja a{' '}
          <Link href="/avisos/saae" className="text-secondary hover:underline">
            listagem do SAAE
          </Link>
          .
        </p>
      </header>

      <NoticesList
        result={notices}
        emptyMessage="Nenhum aviso publicado no momento. Novos avisos aparecem aqui assim que forem divulgados."
      />
    </article>
  );
}
