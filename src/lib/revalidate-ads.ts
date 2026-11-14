import { revalidatePath } from 'next/cache';

/**
 * Invalida o HTML em cache das páginas públicas que exibem anúncios.
 *
 * A home e `/empresas` são renderizadas estaticamente com ISR
 * (`export const revalidate = 1800`), e o `sitemap.xml` também. Sem esta
 * invalidação sob demanda, um anúncio recém-aprovado em `/moderacao` continua
 * invisível ao público por até 30 minutos — e, no caso de `/empresas`, até o
 * próximo deploy (a página não tinha ISR configurado).
 *
 * Deve ser chamado em Route Handlers / Server Actions **depois** de qualquer
 * alteração em `ads_published` (aprovar, editar, suspender, reativar, remover).
 */
export function revalidateAdsPages(adId?: string): void {
  revalidatePath('/', 'page');
  revalidatePath('/empresas', 'page');
  // Páginas individuais do guia comercial (rota dinâmica).
  revalidatePath('/empresas/[slug]', 'page');
  if (adId) {
    revalidatePath(`/empresas/${adId}`, 'page');
  }
  revalidatePath('/sitemap.xml');
}
