import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description:
    'Como o Portal São Carlos trata dados: minimização, finalidade, retenção, contato do responsável e procedimento para correção ou remoção de dados.',
  alternates: { canonical: '/politica-de-privacidade' },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <article className="prose-slate mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Política de privacidade</h1>
      <p className="text-sm text-slate-500">Última atualização: 28 de setembro de 2026.</p>

      <section aria-labelledby="priv-minimizacao">
        <h2 id="priv-minimizacao" className="text-xl font-bold text-slate-900">
          Minimização de dados
        </h2>
        <p className="mt-2 text-slate-700">
          O Portal São Carlos foi feito para consulta pública. Na primeira versão, o portal{' '}
          <strong>não coleta dados pessoais dos visitantes</strong>: não há cadastro, login,
          formulários de contato pelo site nem rastreamento de identidade. Nenhum dado sensível
          (CPF, endereço residencial, dados bancários ou de cartão) é solicitado ou armazenado.
        </p>
      </section>

      <section aria-labelledby="priv-finalidade">
        <h2 id="priv-finalidade" className="text-xl font-bold text-slate-900">
          Finalidade da coleta
        </h2>
        <p className="mt-2 text-slate-700">
          Dados de comerciantes interessados em anunciar são coletados apenas quando você
          iniciar contato voluntariamente com o responsável, e somente para: identificar o
          comércio/serviço, publicar o anúncio aprovado e entrar em contato sobre a veiculação.
          A base é o mínimo possível: nome comercial, telefone ou WhatsApp, e-mail (se
          necessário), descrição do negócio, bairro/região, categoria e link externo.
        </p>
      </section>

      <section aria-labelledby="priv-retencao">
        <h2 id="priv-retencao" className="text-xl font-bold text-slate-900">
          Retenção
        </h2>
        <p className="mt-2 text-slate-700">
          Os dados são mantidos apenas pelo tempo necessário à finalidade informada: enquanto o
          anúncio estiver publicado ou enquanto o assunto estiver em aberto. Encerrada a
          veiculação, os dados são removidos ou anonimizados.
        </p>
      </section>

      <section aria-labelledby="priv-cookies">
        <h2 id="priv-cookies" className="text-xl font-bold text-slate-900">
          Cookies e tecnologias equivalentes
        </h2>
        <p className="mt-2 text-slate-700">
          Esta versão não utiliza cookies de rastreamento nem ferramentas de perfilamento de
          visitantes. Caso isso mude no futuro, este aviso será atualizado antes da ativação.
        </p>
      </section>

      <section aria-labelledby="priv-direitos">
        <h2 id="priv-direitos" className="text-xl font-bold text-slate-900">
          Seus direitos: correção e remoção
        </h2>
        <p className="mt-2 text-slate-700">
          Para solicitar correção ou remoção de dados seus publicados em um anúncio, entre em
          contato com o responsável pelo portal pelos canais da seção{' '}
          <a href="#anuncie" className="text-blue-700 hover:underline">
            Anuncie aqui
          </a>
          . A solicitação será atendida pelo responsável, sem custo.
        </p>
      </section>

      <section aria-labelledby="priv-contato">
        <h2 id="priv-contato" className="text-xl font-bold text-slate-900">
          Canal de contato
        </h2>
        <p className="mt-2 text-slate-700">
          Responsável pelo portal: use os canais exibidos na seção{' '}
          <a href="#anuncie" className="text-blue-700 hover:underline">
            Anuncie aqui
          </a>{' '}
          (WhatsApp, telefone ou e-mail) para qualquer questão sobre privacidade.
        </p>
      </section>
    </article>
  );
}
