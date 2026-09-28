/**
 * Dados estruturados locais (FR-016). O JSON é gerado no servidor a partir de
 * constantes do próprio portal — nunca de conteúdo externo. Os `<` são
 * escapados para impedir o fechamento antecipado da tag <script>.
 */
export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Portal São Carlos',
    url: '/',
    inLanguage: 'pt-BR',
    description:
      'Portal independente de utilidade pública de São Carlos/SP: previsão do tempo, notícias, informativos, contatos úteis e anúncios locais.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: '/?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
