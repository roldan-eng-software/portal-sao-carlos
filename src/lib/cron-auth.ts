/**
 * Autoriza chamadas agendadas: exige `Authorization: Bearer <CRON_SECRET>`.
 * Sem segredo configurado, nega todas as chamadas.
 */
export function isCronAuthorized(authorization: string | null, secret: string | undefined): boolean {
  if (!secret) return false;
  return authorization === `Bearer ${secret}`;
}
