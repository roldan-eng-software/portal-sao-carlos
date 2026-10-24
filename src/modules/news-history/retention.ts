import { env } from '@/config/env';
import type { NewsHistoryItem } from './types';

/**
 * Filtra itens do histórico que excedem o período de retenção configurado.
 * Padrão: 365 dias (12 meses) conforme LGPD legítimo interesse.
 */
export function applyRetentionFilter(items: NewsHistoryItem[]): NewsHistoryItem[] {
  const retentionDays = env.newsHistoryRetentionDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffISO = cutoffDate.toISOString();

  return items.filter((item) => item.date >= cutoffISO);
}

/**
 * Retorna estatísticas de retenção para logging/monitoramento.
 */
export function getRetentionStats(items: NewsHistoryItem[]): {
  total: number;
  retained: number;
  removed: number;
  oldestRetained: string | null;
} {
  const retentionDays = env.newsHistoryRetentionDays;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  const cutoffISO = cutoffDate.toISOString();

  const retained = items.filter((item) => item.date >= cutoffISO);
  const removed = items.filter((item) => item.date < cutoffISO);
  const oldestRetained = retained.length > 0
    ? retained.reduce((oldest, item) => item.date < oldest ? item.date : oldest, retained[0].date)
    : null;

  return {
    total: items.length,
    retained: retained.length,
    removed: removed.length,
    oldestRetained,
  };
}