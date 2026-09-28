import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { Promo } from '@/modules/promo/loader';
import { ContentLabel } from '@/components/ui/content-label';

interface PromoSectionProps {
  result: ModuleResult<Promo[]>;
}

export function PromoSection({ result }: PromoSectionProps) {
  const items = result.data ?? [];
  if (items.length === 0) return null;

  return (
    <section id="divulgacoes" aria-labelledby="divulgacoes-titulo" className="scroll-mt-20">
      <h2 id="divulgacoes-titulo" className="mb-3 text-xl font-bold text-slate-900">
        Serviços e parceiros
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-amber-300 bg-white p-4">
            <ContentLabel kind="divulgacao-propria" customLabel={item.label} />
            <p className="mt-2 font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-700">{item.text}</p>
            {isSafeHttpUrl(item.url) && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-blue-700 hover:underline"
              >
                Saiba mais
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
