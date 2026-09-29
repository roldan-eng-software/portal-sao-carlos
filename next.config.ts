import type { NextConfig } from 'next';

const CANONICAL_HOST = 'www.meubairro.dev.br';
const APEX_HOST = 'meubairro.dev.br';

const nextConfig: NextConfig = {
  images: {
    // Imagens de terceiros vindas dos feeds RSS (somente https — filtrado no normalize).
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    return [
      // Domínio apex → www canônico (301 permanente; SEO: evita conteúdo duplicado
      // entre meubairro.dev.br e www.meubairro.dev.br).
      {
        source: '/:path*',
        has: [{ type: 'host', value: APEX_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
