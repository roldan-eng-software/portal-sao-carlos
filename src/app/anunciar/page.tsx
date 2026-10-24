import { Metadata } from 'next';
import { AdFormSection } from '@/components/sections/ad-form-section';

export const metadata: Metadata = {
  title: 'Anuncie Gratuitamente — Portal São Carlos',
  description: 'Cadastre seu comércio ou serviço no Guia Comercial do Portal São Carlos. Anúncio gratuito para comércio local, moderação manual, sem custo.',
  openGraph: {
    title: 'Anuncie Gratuitamente — Portal São Carlos',
    description: 'Cadastre seu comércio ou serviço no Guia Comercial. Anúncio gratuito para comércio local de São Carlos/SP.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary',
    title: 'Anuncie Gratuitamente — Portal São Carlos',
    description: 'Cadastre seu comércio no Guia Comercial gratuito.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AnunciarPage() {
  return (
    <main id="conteudo" className="container mx-auto px-4 py-8">
      <AdFormSection />
    </main>
  );
}