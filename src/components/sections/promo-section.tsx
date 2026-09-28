import type { ModuleResult } from '@/lib/module-result';
import { isSafeHttpUrl } from '@/lib/sanitize';
import type { Promo } from '@/modules/promo/loader';
import { ContentLabel } from '@/components/ui/content-label';
import { Section } from '@/components/ui/section';

interface PromoSectionProps {
  result: ModuleResult<Promo[]>;
}

/**
 * Divulgações próprias em banner de conversão (gradiente navy —
 * DESIGN.md §Conversion Hero Block). Rótulo textual obrigatório (FR-008).
 */
export function PromoSection({ result }: PromoSectionProps) {
  const items = result.data ?? [];
  if (items.length === 0) return null;

  return (
    <Section id="divulgacoes" aria-labelledby="divulgacoes-titulo" className="py-10">
      <h2 id="divulgacoes-titulo" className="mb-4 font-display text-headline-lg text-primary">
        Serviços e Parceiros
      </h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-linear-to-r from-primary to-primary-container p-6 shadow-lead md:flex-row md:items-center"
          >
            <div className="max-w-2xl space-y-2">
              <ContentLabel kind="divulgacao-propria" customLabel={item.label} />
              <h3 className="font-display text-headline-md text-surface-bright">{item.title}</h3>
              <p className="text-body-md text-surface-variant">{item.text}</p>
            </div>
            {isSafeHttpUrl(item.url) && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-amber px-5 py-3 text-label-lg text-primary shadow-md transition-all hover:bg-accent-amber/90"
              >
                Saiba mais
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  open_in_new
                </span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
