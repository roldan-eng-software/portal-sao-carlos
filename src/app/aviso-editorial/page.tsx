import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso editorial',
  description:
    'O Portal São Carlos é independente: não é órgão oficial da Prefeitura, SAAE ou CPFL. Entenda como tratamos fontes, links e correções.',
  alternates: { canonical: '/aviso-editorial' },
};

export default function AvisoEditorialPage() {
  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-3xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <header>
        <h1 className="font-display text-headline-lg text-primary">Aviso editorial</h1>
        <p className="mt-1 text-body-sm text-outline">Última atualização: 28 de setembro de 2026.</p>
      </header>

      <section aria-labelledby="ed-independencia">
        <h2 id="ed-independencia" className="font-display text-headline-md text-primary">
          Independência do portal
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O Portal São Carlos é uma iniciativa privada de utilidade pública local.{' '}
          <strong className="text-on-surface">
            Não somos órgão oficial da Prefeitura de São Carlos, do SAAE, da CPFL, do governo ou
            de qualquer outro órgão público ou empresa
          </strong>
          , e não temos vínculo institucional com eles. Não substituímos canais oficiais de
          emergência, atendimento público ou autoridades.
        </p>
      </section>

      <section aria-labelledby="ed-fontes">
        <h2 id="ed-fontes" className="font-display text-headline-md text-primary">
          Fontes e links originais
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Conteúdos originados de terceiros exibem a identificação da fonte e, quando disponível,
          o link para a publicação original. Publicamos título, resumo, data e link — nunca a
          matéria completa. Informações de terceiros podem mudar sem aviso;{' '}
          <strong className="text-on-surface">
            confirme dados importantes diretamente com a fonte oficial
          </strong>
          .
        </p>
      </section>

      <section aria-labelledby="ed-publicidade">
        <h2 id="ed-publicidade" className="font-display text-headline-md text-primary">
          Publicidade é sempre identificada
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Todo conteúdo pago, patrocinado ou de divulgação própria exibe rótulo inequívoco
          (Publicidade, Anúncio patrocinado, Anúncio gratuito, Publicidade própria). Publicidade
          nunca é apresentada como notícia independente.
        </p>
      </section>

      <section aria-labelledby="ed-moderacao">
        <h2 id="ed-moderacao" className="font-display text-headline-md text-primary">
          Moderação e correções
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Anúncios e conteúdos são revisados manualmente antes da publicação. O responsável pelo
          portal pode editar, recusar, suspender ou remover qualquer conteúdo que viole estas
          regras. Para solicitar correção ou remoção, use os canais da seção{' '}
          <a href="#anuncie" className="text-secondary hover:underline">
            Anuncie aqui
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="ed-emergencia">
        <h2 id="ed-emergencia" className="font-display text-headline-md text-primary">
          Emergências
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Em emergência, ligue diretamente para o canal oficial (Bombeiros 193, SAMU 192, Polícia
          190, Defesa Civil 199). Este portal não é canal de emergência.
        </p>
      </section>
    </article>
  );
}
