/**
 * Observabilidade mínima (constituição §18): log estruturado de falhas de
 * fonte no servidor, com identificação da fonte, timestamp e contador de
 * falhas consecutivas. Sem plataforma externa nesta fase.
 */

interface FailureCounters {
  [sourceId: string]: number;
}

const globalStore = globalThis as unknown as { __portalSourceFailures?: FailureCounters };

const counters: FailureCounters = (globalStore.__portalSourceFailures ??= {});

export function logSourceFailure(sourceId: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  counters[sourceId] = (counters[sourceId] ?? 0) + 1;
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'source_failure',
      source: sourceId,
      error: message,
      consecutiveFailures: counters[sourceId],
      at: new Date().toISOString(),
    }),
  );
}

export function logSourceRecovery(sourceId: string): void {
  const previous = counters[sourceId] ?? 0;
  counters[sourceId] = 0;
  if (previous > 0) {
    console.info(
      JSON.stringify({
        level: 'info',
        event: 'source_recovery',
        source: sourceId,
        recoveredAfterFailures: previous,
        at: new Date().toISOString(),
      }),
    );
  }
}

/** Exposto para validação/inspeção (quickstart V5). */
export function getConsecutiveFailures(sourceId: string): number {
  return counters[sourceId] ?? 0;
}
