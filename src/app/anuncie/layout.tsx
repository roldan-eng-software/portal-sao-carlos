import type { Metadata } from 'next';

/**
 * Layout de /anuncie — apenas os metadados são declarados aqui; o chrome
 * (Header, AnnounceCTA, Footer, GA) vem do root layout. Antes desta correção
 * este arquivo renderizava Header/Footer/GA/Toast em duplicidade (auditoria
 * Spec 01, achado 3), o que duplicava o carregamento do GA4 na página.
 */
export const metadata: Metadata = {
  title: 'Anuncie no Portal São Carlos',
  description:
    'Cadastre seu comércio ou serviço no guia comercial de São Carlos/SP. Anúncio gratuito para pequenos negócios e opção de destaque patrocinado.',
  alternates: { canonical: '/anuncie' },
};

export default function AnuncieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
