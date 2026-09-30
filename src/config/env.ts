/**
 * Variáveis de ambiente opcionais (nenhuma obrigatória na Fase 1).
 * Validadas e lidas somente no servidor — nada é exposto ao cliente (gate 9).
 */

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Normaliza para https:// quando o valor não traz protocolo
 * (env vars da Vercel vêm sem `https://`).
 */
function normalizeHttpsUrl(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

/**
 * Resolve a URL canônica sem jamais quebrar o build:
 * 1. SITE_URL explícita (com ou sem protocolo — normaliza para https);
 * 2. Domínio de produção do projeto na Vercel (VERCEL_PROJECT_PRODUCTION_URL —
 *    usa o domínio customizado mais curto, ex.: www.meubairro.dev.br; sempre
 *    presente, inclusive em previews, mas aqui consome só após a 1ª);
 * 3. VERCEL_URL do deployment (fallback — URL *.vercel.app);
 * 4. localhost apenas como último recurso (desenvolvimento local).
 * String vazia em SITE_URL é tratada como ausente (nunca `new URL('')`).
 */
function resolveSiteUrl(): string {
  const explicit = optional('SITE_URL');
  if (explicit) return normalizeHttpsUrl(explicit);
  const production = optional('VERCEL_PROJECT_PRODUCTION_URL');
  if (production) return normalizeHttpsUrl(production);
  const vercel = optional('VERCEL_URL');
  if (vercel) return normalizeHttpsUrl(vercel);
  return 'http://localhost:3000';
}

export const env = {
  /** URL canônica do site (SEO, sitemap, robots). */
  siteUrl: resolveSiteUrl(),
  /** Sobrescreve a lista de feeds RSS de notícias (separados por vírgula). */
  newsFeedsOverride: optional('NEWS_FEEDS'),
  /** Sobrescreve a lista de feeds RSS de informativos (separados por vírgula). */
  noticeFeedsOverride: optional('NOTICE_FEEDS'),
  /** Canais de contato do responsável pelas chamadas de publicidade. */
  contactWhatsapp: optional('CONTACT_WHATSAPP'),
  contactPhone: optional('CONTACT_PHONE'),
  contactEmail: optional('CONTACT_EMAIL') ?? 'contato@portalsaocarlos.com.br',
} as const;
