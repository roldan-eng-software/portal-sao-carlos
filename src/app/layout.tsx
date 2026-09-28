import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { env } from '@/config/env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: 'Portal São Carlos — informações úteis de São Carlos/SP',
    template: '%s | Portal São Carlos',
  },
  description:
    'Previsão do tempo, notícias, informativos oficiais, telefones úteis e anúncios locais de São Carlos/SP. Portal independente de utilidade pública.',
  applicationName: 'Portal São Carlos',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Portal São Carlos',
    url: '/',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main id="conteudo" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
