import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description:
    'Como o Portal São Carlos trata dados: minimização, finalidade, retenção, contato do responsável e procedimento para correção ou remoção de dados.',
  alternates: { canonical: '/politica-de-privacidade' },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-3xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <header>
        <h1 className="font-display text-headline-lg text-primary">Política de privacidade</h1>
        <p className="mt-1 text-body-sm text-outline">
          Última atualização: 29 de setembro de 2026.
        </p>
      </header>

      <section aria-labelledby="priv-minimizacao">
        <h2 id="priv-minimizacao" className="font-display text-headline-md text-primary">
          Minimização de dados
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          O Portal São Carlos foi feito para consulta pública. Na primeira versão, o portal{' '}
          <strong className="text-on-surface">
            não coleta dados pessoais identificáveis dos visitantes
          </strong>
          : não há cadastro, login, formulários de contato pelo site nem rastreamento de identidade
          — apenas métricas de audiência agregadas (Google Analytics, seção abaixo). Nenhum dado
          sensível (CPF, endereço residencial, dados bancários ou de cartão) é solicitado ou
          armazenado.
        </p>
      </section>

      <section aria-labelledby="priv-finalidade">
        <h2 id="priv-finalidade" className="font-display text-headline-md text-primary">
          Finalidade da coleta
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Dados de comerciantes interessados em anunciar são coletados apenas quando você iniciar
          contato voluntariamente com o responsável, e somente para: identificar o comércio/serviço,
          publicar o anúncio aprovado e entrar em contato sobre a veiculação. A base é o mínimo
          possível: nome comercial, telefone ou WhatsApp, e-mail (se necessário), descrição do
          negócio, bairro/região, categoria e link externo.
        </p>
      </section>

      <section aria-labelledby="priv-retencao">
        <h2 id="priv-retencao" className="font-display text-headline-md text-primary">
          Retenção
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Os dados são mantidos apenas pelo tempo necessário à finalidade informada: enquanto o
          anúncio estiver publicado ou enquanto o assunto estiver em aberto. Encerrada a veiculação,
          os dados são removidos ou anonimizados.
        </p>
      </section>

      <section aria-labelledby="priv-cookies">
        <h2 id="priv-cookies" className="font-display text-headline-md text-primary">
          Cookies e tecnologias equivalentes
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Esta versão não utiliza cookies de publicidade nem ferramentas de perfilamento ou
          rastreamento de identidade. Para métricas agregadas de audiência (páginas visitadas,
          origem do tráfego e dispositivo), o portal usa{' '}
          <strong className="text-on-surface">Google Analytics</strong>, que grava cookies técnicos{' '}
          <code className="text-body-sm">_ga</code> e <code className="text-body-sm">_ga_*</code>{' '}
          sem identificar visitantes. Você pode desativar a medição a qualquer momento pelo{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline"
          >
            complemento de opt-out do Google Analytics
          </a>{' '}
          ou pelo modo de navegação privada. Caso o uso de cookies mude no futuro, este aviso será
          atualizado antes da ativação.
        </p>
      </section>

      <section aria-labelledby="priv-direitos">
        <h2 id="priv-direitos" className="font-display text-headline-md text-primary">
          Seus direitos: correção e remoção
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Para solicitar correção ou remoção de dados seus publicados em um anúncio, entre em
          contato com o responsável pelo portal pelos canais da seção{' '}
          <a href="#anuncie" className="text-secondary hover:underline">
            Anuncie aqui
          </a>
          . A solicitação será atendida pelo responsável, sem custo.
        </p>
      </section>

      <section aria-labelledby="priv-contato">
        <h2 id="priv-contato" className="font-display text-headline-md text-primary">
          Canal de contato
        </h2>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Responsável pelo portal: use os canais exibidos na seção{' '}
          <a href="#anuncie" className="text-secondary hover:underline">
            Anuncie aqui
          </a>{' '}
          (WhatsApp, telefone ou e-mail) para qualquer questão sobre privacidade.
        </p>
      </section>
    </article>
  );
}
