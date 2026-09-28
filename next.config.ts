import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Imagens de terceiros vindas dos feeds RSS (somente https — filtrado no normalize).
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
