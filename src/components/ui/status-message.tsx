import type { ModuleResult } from '@/lib/module-result';

interface StatusMessageProps {
  result: Pick<ModuleResult<unknown>, 'status' | 'lastUpdated' | 'errorMessage'>;
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(date);
}

/**
 * Estados de atualização de um módulo (contrato section-module):
 * - ok: exibe data/hora da última atualização
 * - stale: conteúdo válido + aviso de atualização indisponível
 * - error: apenas mensagem amigável (nunca erro técnico)
 */
export function StatusMessage({ result }: StatusMessageProps) {
  const updated = formatDateTime(result.lastUpdated);

  if (result.status === 'error') {
    return (
      <p
        role="status"
        className="rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-body-sm text-[#92400e]"
      >
        {result.errorMessage ?? 'Informação temporariamente indisponível.'}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {result.status === 'stale' && (
        <p
          role="status"
          className="rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-body-sm text-[#92400e]"
        >
          {result.errorMessage}
        </p>
      )}
      {updated && <p className="text-body-sm text-outline">Atualizado em {updated}</p>}
    </div>
  );
}
