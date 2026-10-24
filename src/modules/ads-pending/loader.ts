import fs from 'fs/promises';
import path from 'path';
import type { AdSubmission } from './types';

const PENDING_FILE = path.resolve(process.cwd(), 'src/content/ads-pending.json');

/**
 * Carrega anúncios pendentes do arquivo JSON.
 */
export async function loadPendingAds(): Promise<AdSubmission[]> {
  try {
    const content = await fs.readFile(PENDING_FILE, 'utf-8');
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data as AdSubmission[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Salva anúncios pendentes no arquivo JSON (escrita atômica).
 */
export async function savePendingAds(ads: AdSubmission[]): Promise<void> {
  const tempFile = `${PENDING_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(ads, null, 2), 'utf-8');
  await fs.rename(tempFile, PENDING_FILE);
}

/**
 * Remove anúncios pendentes expirados (>30 dias).
 * Conforme LGPD: consentimento para dados de formulário pendente = 30 dias.
 */
export async function cleanupExpiredPending(): Promise<number> {
  const pending = await loadPendingAds();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  const cutoffISO = cutoffDate.toISOString();

  const valid = pending.filter((ad) => ad.submittedAt >= cutoffISO || ad.status !== 'pendente');
  const removed = pending.length - valid.length;

  if (removed > 0) {
    await savePendingAds(valid);
  }

  return removed;
}