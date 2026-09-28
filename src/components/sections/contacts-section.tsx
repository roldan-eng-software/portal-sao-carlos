import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { ContactItem } from '@/modules/contacts/loader';
import { StatusMessage } from '@/components/ui/status-message';
import { ContentLabel } from '@/components/ui/content-label';

interface ContactsSectionProps {
  result: ModuleResult<ContactItem[]>;
}

function renderValue(item: ContactItem) {
  if (isSafeHttpUrl(item.value)) {
    return (
      <a
        href={item.value}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-700 hover:underline"
      >
        {item.name}
      </a>
    );
  }
  return <span className="font-semibold text-slate-900">{item.name}</span>;
}

export function ContactsSection({ result }: ContactsSectionProps) {
  const items = result.data ?? [];

  return (
    <section id="contatos" aria-labelledby="contatos-titulo" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="contatos-titulo" className="text-xl font-bold text-slate-900">
          Telefones e links úteis
        </h2>
        <span className="text-xs text-slate-500">Serviços de interesse da população</span>
      </div>

      {items.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
              {item.kind === 'servico-publico' ? (
                <ContentLabel kind="servico-publico" />
              ) : (
                <span className="inline-block rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Contato
                </span>
              )}
              <p className="mt-1">{renderValue(item)}</p>
              {isSafeHttpUrl(item.value) ? (
                <p className="mt-1 break-all text-sm text-slate-600">{item.value}</p>
              ) : (
                <p className="mt-1 text-2xl font-bold tracking-wide text-slate-900">{item.value}</p>
              )}
              {item.hours && <p className="mt-1 text-sm text-slate-600">{item.hours}</p>}
              {item.address && <p className="mt-1 text-sm text-slate-600">{item.address}</p>}
              {item.officialUrl && isSafeHttpUrl(item.officialUrl) && (
                <p className="mt-2">
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    Acessar canal oficial
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">Contatos indisponíveis no momento.</p>
        </div>
      )}

      <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Em emergências, ligue direto para o canal oficial. Este portal é independente e não
        substitui o atendimento de emergência.
      </p>

      <div className="mt-3">
        <StatusMessage result={result} />
      </div>
    </section>
  );
}
