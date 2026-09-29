import { env } from '@/config/env';

/**
 * Dados estruturados locais (FR-016). O JSON é gerado no servidor a partir de
 * constantes do próprio portal — nunca de conteúdo externo. Os `<` são
 * escapados para impedir o fechamento antecipado da tag <script>.
 *
 * URLs são absolutas (schema.org exige IRI completo). Não há SearchAction:
 * o portal não possui busca (decisão de design), e um alvo inexistente
 * gera erro no Rich Results Test.
 */
export function JsonLd() {
  const siteUrl = env.siteUrl;
  const description =
    'Portal independente de utilidade pública de São Carlos/SP: previsão do tempo, notícias, informativos, contatos úteis e anúncios locais.';

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'Portal São Carlos',
        url: `${siteUrl}/`,
        inLanguage: 'pt-BR',
        description,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Portal São Carlos',
        url: `${siteUrl}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
          width: 407,
          height: 165,
        },
        description,
        inLanguage: 'pt-BR',
        areaServed: {
          '@type': 'City',
          name: 'São Carlos',
          addressRegion: 'SP',
          addressCountry: 'BR',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
