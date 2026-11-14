import { describe, expect, it } from 'vitest';
import { isCronAuthorized } from '@/lib/cron-auth';

describe('isCronAuthorized', () => {
  it('aceita Bearer com o segredo correto', () => {
    expect(isCronAuthorized('Bearer segredo-123', 'segredo-123')).toBe(true);
  });

  it('recusa chamadas sem cabeçalho ou com segredo errado', () => {
    expect(isCronAuthorized(null, 'segredo-123')).toBe(false);
    expect(isCronAuthorized('Bearer outro', 'segredo-123')).toBe(false);
  });

  it('nega tudo quando CRON_SECRET não está configurado', () => {
    expect(isCronAuthorized('Bearer ', undefined)).toBe(false);
    expect(isCronAuthorized(null, undefined)).toBe(false);
  });
});
