import type { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  /** Classes da faixa externa full-bleed (ex.: bg-surface-container-low). */
  band?: string;
  /** Classes do container interno (espaçamento vertical, etc.). */
  className?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
}

/**
 * Seção com container centralizado (max-w 1200px — DESIGN.md §Layout).
 * O fundo da faixa fica no <section> (full-bleed) e o conteúdo no container,
 * permitindo as bandas de fundo alternadas do design Civic Vanguard.
 */
export function Section({ id, band = '', className = '', children, ...rest }: SectionProps) {
  return (
    <section id={id} className={`w-full scroll-mt-32 xl:scroll-mt-24 ${band}`} {...rest}>
      <div
        className={`relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`}
      >
        {children}
      </div>
    </section>
  );
}
