import type { Metadata } from 'next';

/**
 * Área administrativa — NUNCA indexável (auditoria Spec 01, achado 1).
 * A restrição é declarada em dois níveis: meta robots no HTML (fonte
 * determinante para o Googlebot) e Disallow no robots.ts (evita que o
 * Googlebot gaste crawl budget em rotas protegidas por login).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
