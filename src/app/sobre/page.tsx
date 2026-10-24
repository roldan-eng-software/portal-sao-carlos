import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Sobre o Portal São Carlos',
  description:
    'O Portal São Carlos reúne previsão do tempo, notícias, avisos de utilidade pública, telefones úteis e guia comercial de São Carlos/SP. Entenda quem somos e como tratamos as fontes.',
  alternates: { canonical: '/sobre' },
};

export default function SobrePage() {
  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-3xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Sobre', href: '/sobre' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">Sobre o Portal São Carlos</h1>
        <p className="mt-1 text-body-sm text-outline">Última atualização: 24 de outubro de 2026.</p>
      </header>

      <section aria-labelledby="sobre-o-que-e">
        <h2 id="sobre-o-que-e" className="font-display text-headline-md text-primary">
          O que é este portal
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O Portal São Carlos é uma iniciativa privada de{' '}
          <strong className="text-on-surface">utilidade pública local</strong>, feita para
          moradores, visitantes, empresas e serviços de São Carlos/SP. Aqui você encontra, em um
          só lugar, o que ajuda no dia a dia da cidade: previsão do tempo, notícias da cidade e
          região, avisos de utilidade pública, telefones úteis e um guia comercial com comércios e
          serviços locais. O acesso é gratuito e não exige cadastro.
        </p>
      </section>

      <section aria-labelledby="sobre-independencia">
        <h2 id="sobre-independencia" className="font-display text-headline-md text-primary">
          Independência editorial
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          <strong className="text-on-surface">
            Não somos órgão oficial da Prefeitura, do SAAE, da CPFL nem de qualquer outro órgão
            público ou empresa
          </strong>
          , e não temos vínculo institucional com eles. O portal reúne e organiza informações de
          fontes oficiais e de terceiros; sempre que o conteúdo for de outra fonte, mantemos a
          identificação dela e o link para a publicação original. Em emergência, ligue
          diretamente para o canal oficial (Bombeiros 193, SAMU 192, Defesa Civil 199). Os detalhes
          estão no{' '}
          <Link href="/aviso-editorial" className="text-secondary hover:underline">
            aviso editorial
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="sobre-conteudo">
        <h2 id="sobre-conteudo" className="font-display text-headline-md text-primary">
          Como o conteúdo é tratado
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          As previsões de tempo e as notícias e avisos de fontes externas são buscadas
          automaticamente e exibidas com título, resumo, data, fonte e link para o original — nunca
          a matéria completa. Quando uma fonte está indisponível, mostramos claramente que os dados
          não estão atualizados, em vez de exibir informação velha como se fosse nova. Anúncios e
          conteúdos do portal passam por revisão manual antes de serem publicados.
        </p>
      </section>

      <section aria-labelledby="sobre-quem-faz">
        <h2 id="sobre-quem-faz" className="font-display text-headline-md text-primary">
          Quem faz
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O portal pertence ao grupo MeuBairro. Para falar conosco — inclusive para solicitar
          correção ou remoção de conteúdo — use os canais da página de{' '}
          <Link href="/contato" className="text-secondary hover:underline">
            contato
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="sobre-publicidade">
        <h2 id="sobre-publicidade" className="font-display text-headline-md text-primary">
          Publicidade
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O portal é mantido com a ajuda de anúncios locais. Todo conteúdo pago, patrocinado ou de
          divulgação própria é sempre identificado com rótulo claro — publicidade nunca aparece
          como notícia. Empresas e comércios de São Carlos podem se divulgar pela página{' '}
          <Link href="/anuncie" className="text-secondary hover:underline">
            Anuncie no portal
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
