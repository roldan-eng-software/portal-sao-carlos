/**
 * Variáveis de ambiente opcionais (nenhuma obrigatória na Fase 1).
 * Validadas e lidas somente no servidor — nada é exposto ao cliente (gate 9).
 */

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const env = {
  /** URL canônica do site (SEO, sitemap, robots). */
  siteUrl: optional('SITE_URL') ?? 'http://localhost:3000',
  /** Sobrescreve a lista de feeds RSS (separados por vírgula). */
  newsFeedsOverride: optional('NEWS_FEEDS'),
  /** Canais de contato do responsável pelas chamadas de publicidade. */
  contactWhatsapp: optional('CONTACT_WHATSAPP'),
  contactPhone: optional('CONTACT_PHONE'),
  contactEmail: optional('CONTACT_EMAIL') ?? 'contato@portalsaocarlos.com.br',
} as const;
