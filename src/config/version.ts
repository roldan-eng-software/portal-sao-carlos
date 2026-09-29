import packageJson from '../../package.json';

/**
 * Estado da versão em produção — exibido no rodapé da landing page para
 * acompanhamento visual do que está publicado (skill changelog-automation).
 *
 * - `APP_VERSION`: fonte única é `package.json`, atualizada automaticamente
 *   por `npm run release` (commit-and-tag-version).
 * - `DEPLOY_ENV` / `BUILD_COMMIT`: resolvidos no servidor no build — a Vercel
 *   injeta `VERCEL_ENV` e `VERCEL_GIT_COMMIT_SHA`; ausentes no dev local.
 * - `BUILD_DATE`: fixada no build (página estática/ISR), sem risco de
 *   divergência de hidratação.
 */

export type DeployEnv = 'production' | 'preview' | 'local';

/** Versão semântica publicada (source of truth: package.json). */
export const APP_VERSION: string = packageJson.version;

/** Ambiente do deploy: produção, preview (branch) ou desenvolvimento local. */
const vercelEnv = process.env.VERCEL_ENV;
export const DEPLOY_ENV: DeployEnv =
  vercelEnv === 'production' || vercelEnv === 'preview' ? vercelEnv : 'local';

/** Rótulo em pt-BR do ambiente, para exibição no rodapé. */
export const DEPLOY_LABEL: string =
  DEPLOY_ENV === 'production' ? 'Em produção' : DEPLOY_ENV === 'preview' ? 'Preview' : 'Local';

/** SHA curto do commit implantado; `null` quando não há metadado de build. */
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
export const BUILD_COMMIT: string | null = commitSha ? commitSha.slice(0, 7) : null;

/** Data do build no fuso de São Carlos/SP (a portal é local — consistência visual). */
export const BUILD_DATE: string = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date());
