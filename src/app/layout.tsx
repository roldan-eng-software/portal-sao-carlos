import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AnnounceCTA } from '@/components/layout/announce-cta';
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
  keywords: [
    'São Carlos',
    'São Carlos SP',
    'notícias de São Carlos',
    'previsão do tempo São Carlos',
    'telefones de emergência',
    'utilidade pública',
    'informativos oficiais',
    'guia comercial São Carlos',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Portal São Carlos',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Portal São Carlos — Utilidade Pública & Notícias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/* Fontes do design system (DESIGN.md §Typography) — self-host via next/font. */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
        <Header />
        <main id="conteudo" className="w-full flex-1">
          {children}
        </main>
        {/* Chamada de publicidade em todas as páginas (id="anuncie" — SC-006). */}
        <AnnounceCTA />
        <Footer />
      </body>
    </html>
  );
}
