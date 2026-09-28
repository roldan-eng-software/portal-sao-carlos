import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso editorial',
  description:
    'O Portal São Carlos é independente: não é órgão oficial da Prefeitura, SAAE ou CPFL. Entenda como tratamos fontes, links e correções.',
  alternates: { canonical: '/aviso-editorial' },
};

export default function AvisoEditorialPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Aviso editorial</h1>
      <p className="text-sm text-slate-500">Última atualização: 28 de setembro de 2026.</p>

      <section aria-labelledby="ed-independencia">
        <h2 id="ed-independencia" className="text-xl font-bold text-slate-900">
          Independência do portal
        </h2>
        <p className="mt-2 text-slate-700">
          O Portal São Carlos é uma iniciativa privada de utilidade pública local.{' '}
          <strong>
            Não somos órgão oficial da Prefeitura de São Carlos, do SAAE, da CPFL, do governo ou de
            qualquer outro órgão público ou empresa
          </strong>
          , e não temos vínculo institucional com eles. Não substituímos canais oficiais de
          emergência, atendimento público ou autoridades.
        </p>
      </section>

      <section aria-labelledby="ed-fontes">
        <h2 id="ed-fontes" className="text-xl font-bold text-slate-900">
          Fontes e links originais
        </h2>
        <p className="mt-2 text-slate-700">
          Conteúdos originados de terceiros exibem a identificação da fonte e, quando disponível,
          o link para a publicação original. Publicamos título, resumo, data e link — nunca a
          matéria completa. Informações de terceiros podem mudar sem aviso;{' '}
          <strong>confirme dados importantes diretamente com a fonte oficial</strong>.
        </p>
      </section>

      <section aria-labelledby="ed-publicidade">
        <h2 id="ed-publicidade" className="text-xl font-bold text-slate-900">
          Publicidade é sempre identificada
        </h2>
        <p className="mt-2 text-slate-700">
          Todo conteúdo pago, patrocinado ou de divulgação própria exibe rótulo inequívoco
          (Publicidade, Anúncio patrocinado, Anúncio gratuito, Publicidade própria). Publicidade
          nunca é apresentada como notícia independente.
        </p>
      </section>

      <section aria-labelledby="ed-moderacao">
        <h2 id="ed-moderacao" className="text-xl font-bold text-slate-900">
          Moderação e correções
        </h2>
        <p className="mt-2 text-slate-700">
          Anúncios e conteúdos são revisados manualmente antes da publicação. O responsável pelo
          portal pode editar, recusar, suspender ou remover qualquer conteúdo que viole estas
          regras. Para solicitar correção ou remoção, use os canais da seção{' '}
          <a href="#anuncie" className="text-blue-700 hover:underline">
            Anuncie aqui
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="ed-emergencia">
        <h2 id="ed-emergencia" className="text-xl font-bold text-slate-900">
          Emergências
        </h2>
        <p className="mt-2 text-slate-700">
          Em emergência, ligue diretamente para o canal oficial (Bombeiros 193, SAMU 192, Polícia
          190, Defesa Civil 199). Este portal não é canal de emergência.
        </p>
      </section>
    </article>
  );
}
