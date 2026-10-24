import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Termos de uso',
  description:
    'Termos de uso do Portal São Carlos/SP: uso gratuito do site, responsabilidade sobre informações de terceiros e regras para anúncios do guia comercial.',
  alternates: { canonical: '/termos-de-uso' },
};

export default function TermosDeUsoPage() {
  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-3xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs items={[{ name: 'Termos de uso', href: '/termos-de-uso' }]} />

      <header>
        <h1 className="font-display text-headline-lg text-primary">Termos de uso</h1>
        <p className="mt-1 text-body-sm text-outline">Última atualização: 24 de outubro de 2026.</p>
      </header>

      <section aria-labelledby="termos-aceitacao">
        <h2 id="termos-aceitacao" className="font-display text-headline-md text-primary">
          1. Aceitação dos termos
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Ao usar o Portal São Carlos, você concorda com estes termos. Se não concordar, não use o
          site. O portal é gratuito e não exige cadastro de visitantes.
        </p>
      </section>

      <section aria-labelledby="termos-uso">
        <h2 id="termos-uso" className="font-display text-headline-md text-primary">
          2. Uso do portal
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O conteúdo é fornecido para informação geral da população de São Carlos/SP. Você pode
          ler, compartilhar os links e usar as informações para uso pessoal. É proibido usar o
          site para fins ilegais, para induzir outros ao erro ou para violar direitos de terceiros.
        </p>
      </section>

      <section aria-labelledby="termos-terceiros">
        <h2 id="termos-terceiros" className="font-display text-headline-md text-primary">
          3. Informações de terceiros
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Notícias, avisos e outras informações de terceiros são exibidas com título, resumo, data,
          fonte e link para a publicação original.{' '}
          <strong className="text-on-surface">
            Essas informações podem mudar sem aviso; confirme dados importantes diretamente com a
            fonte oficial
          </strong>
          . O portal não substitui os canais oficiais de emergência, atendimento público, SAAE,
          CPFL, Prefeitura ou autoridades.
        </p>
      </section>

      <section aria-labelledby="termos-anuncios">
        <h2 id="termos-anuncios" className="font-display text-headline-md text-primary">
          4. Anúncios e responsabilidade do anunciante
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Anúncios do guia comercial são fornecidos pelos próprios comerciantes e identificados
          com rótulo claro de publicidade.{' '}
          <strong className="text-on-surface">
            Cada anunciante é responsável pela veracidade, legalidade e atualização dos dados do
            próprio anúncio
          </strong>{' '}
          (nome, descrição, telefone, horário, endereço e site). O portal não valida serviços,
          preços nem promessas de anunciantes.
        </p>
      </section>

      <section aria-labelledby="termos-moderacao">
        <h2 id="termos-moderacao" className="font-display text-headline-md text-primary">
          5. Moderação e remoção de conteúdo
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O responsável pelo portal pode editar, recusar, suspender ou remover qualquer conteúdo —
          notícia, aviso ou anúncio — que viole estes termos, as regras editoriais ou a lei, a
          qualquer momento e sem aviso prévio. Para solicitar correção ou remoção, use os canais
          da página de{' '}
          <Link href="/contato" className="text-secondary hover:underline">
            contato
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="termos-responsabilidade">
        <h2 id="termos-responsabilidade" className="font-display text-headline-md text-primary">
          6. Limitação de responsabilidade
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O portal é uma iniciativa privada de utilidade pública, sem vínculo com órgãos oficiais.
          Nos limites permitidos pela lei, o responsável não se responsabiliza por decisões tomadas
          com base em informações de terceiros exibidas aqui, nem por indisponibilidade temporária
          de fontes externas — sempre que uma fonte falha, o site indica claramente que os dados
          não estão atualizados.
        </p>
      </section>

      <section aria-labelledby="termos-privacidade">
        <h2 id="termos-privacidade" className="font-display text-headline-md text-primary">
          7. Privacidade
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O tratamento de dados no portal está descrito na{' '}
          <Link href="/politica-de-privacidade" className="text-secondary hover:underline">
            política de privacidade
          </Link>
          . O portal não exige cadastro de visitantes.
        </p>
      </section>

      <section aria-labelledby="termos-alteracoes">
        <h2 id="termos-alteracoes" className="font-display text-headline-md text-primary">
          8. Alterações nestes termos
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Estes termos podem ser atualizados; a data no topo indica a versão vigente. O uso
          continuado do site após uma alteração significa que você aceita a nova versão. Em caso de
          dúvida, fale pelo canal de{' '}
          <Link href="/contato" className="text-secondary hover:underline">
            contato
          </Link>
          .
        </p>
      </section>
    </article>
  );
}
