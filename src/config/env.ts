/**
 * Variáveis de ambiente opcionais (nenhuma obrigatória na Fase 1).
 * Validadas e lidas somente no servidor — nada é exposto ao cliente (gate 9).
 */

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Resolve a URL canônica sem jamais quebrar o build:
 * 1. SITE_URL explícita (com ou sem protocolo — normaliza para https);
 * 2. VERCEL_URL do ambiente (domínio do deployment, sempre presente na Vercel);
 * 3. localhost apenas como último recurso (desenvolvimento local).
 * String vazia em SITE_URL é tratada como ausente (nunca `new URL('')`).
 */
function resolveSiteUrl(): string {
  const explicit = optional('SITE_URL');
  if (explicit) {
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(explicit) ? explicit : `https://${explicit}`;
  }
  const vercel = optional('VERCEL_URL');
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export const env = {
  /** URL canônica do site (SEO, sitemap, robots). */
  siteUrl: resolveSiteUrl(),
  /** Sobrescreve a lista de feeds RSS (separados por vírgula). */
  newsFeedsOverride: optional('NEWS_FEEDS'),
  /** Canais de contato do responsável pelas chamadas de publicidade. */
  contactWhatsapp: optional('CONTACT_WHATSAPP'),
  contactPhone: optional('CONTACT_PHONE'),
  contactEmail: optional('CONTACT_EMAIL') ?? 'contato@portalsaocarlos.com.br',
} as const;
