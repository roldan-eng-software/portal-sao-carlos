import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumb';
import { ContentLabel } from '@/components/ui/content-label';
import { isSafeHttpUrl } from '@/lib/sanitize';
import {
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_LABELS,
  loadContacts,
  type ContactCategory,
  type ContactItem,
} from '@/modules/contacts/loader';

/** Conteúdo curado no repositório: não muda a cada visita. */
export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Telefones úteis de São Carlos',
  description:
    'Telefones oficiais de São Carlos/SP: emergência (SAMU 192, Bombeiros 193, Defesa Civil 199), SAAE, CPFL, Prefeitura, saúde e segurança, com fonte oficial de cada número.',
  alternates: { canonical: '/utilidade-publica/telefones-uteis' },
};

/** Agrupa por categoria na ordem fixa; categorias vazias não são renderizadas. */
function groupByCategory(items: ContactItem[]): Array<[ContactCategory, ContactItem[]]> {
  return CONTACT_CATEGORIES.map(
    (category): [ContactCategory, ContactItem[]] => [
      category,
      items.filter((item) => item.category === category),
    ],
  ).filter(([, group]) => group.length > 0);
}

function ContactCard({ item }: { item: ContactItem }) {
  const isUrl = isSafeHttpUrl(item.value);
  const href = isUrl ? item.value : `tel:${item.value.replace(/\s/g, '')}`;

  return (
    <li className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-bright p-4">
      <div>
        <h3 className="font-display text-headline-sm text-primary">{item.name}</h3>
        {isUrl ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-body-md font-semibold text-secondary hover:underline"
          >
            {item.value.replace(/^https?:\/\//, '')}
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              open_in_new
            </span>
          </a>
        ) : (
          <a
            href={href}
            className="mt-1 block font-display text-headline-sm font-extrabold text-secondary hover:underline"
          >
            {item.value}
          </a>
        )}
        {item.address && (
          <p className="mt-1 text-body-sm text-on-surface-variant">{item.address}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-2">
        {item.officialUrl ? (
          <a
            href={item.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-label-md text-secondary hover:underline"
          >
            Fonte oficial
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              open_in_new
            </span>
          </a>
        ) : (
          <span className="text-label-sm text-outline">Confirme no órgão responsável</span>
        )}
        {item.urgent && (
          <span className="rounded bg-error-container px-2 py-0.5 text-label-sm font-bold text-error">
            Emergência
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Página de telefones úteis (Spec 05 do PRD de SEO local). Dados curados em
 * `content/contacts.json` — somente números verificados em fontes oficiais,
 * cada um com link para a fonte. Nenhum número é inventado: o que não tinha
 * fonte oficial verificável ficou de fora (ver _meta do JSON).
 */
export default function TelefonesUteisPage() {
  const contacts = loadContacts();
  const groups = groupByCategory(contacts.data ?? []);

  return (
    <article className="mx-auto my-10 w-[calc(100%-2rem)] max-w-4xl space-y-6 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-card sm:p-8">
      <Breadcrumbs
        items={[
          { name: 'Utilidade pública', href: '/utilidade-publica' },
          { name: 'Telefones úteis', href: '/utilidade-publica/telefones-uteis' },
        ]}
      />

      <header>
        <h1 className="font-display text-headline-lg text-primary">Telefones úteis de São Carlos</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Números oficiais de emergência e de atendimento de São Carlos/SP. Cada número traz o
          link para a fonte oficial de onde foi verificado —{' '}
          <strong className="text-on-surface">
            este portal é independente e não é canal de atendimento
          </strong>
          . Para confirmar um dado, fale diretamente com o órgão ou acesse a fonte oficial.
        </p>
        <div className="mt-3">
          <ContentLabel kind="servico-publico" />
        </div>
      </header>

      {groups.length > 0 ? (
        groups.map(([category, items]) => (
          <section key={category} aria-labelledby={`cat-${category}`} className="space-y-3">
            <h2 id={`cat-${category}`} className="font-display text-headline-md text-primary">
              {CONTACT_CATEGORY_LABELS[category]}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <ContactCard key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="rounded-xl border border-border-subtle bg-surface-bright p-6">
          <p className="text-body-md text-on-surface-variant">
            Nenhum telefone disponível no momento. Confira os canais nos sites oficiais dos órgãos.
          </p>
        </div>
      )}

      <footer className="border-t border-border-subtle pt-4">
        <p className="text-body-sm text-outline">
          Procura avisos sobre a água? Veja a{' '}
          <Link href="/avisos/saae" className="text-secondary hover:underline">
            listagem de avisos do SAAE
          </Link>{' '}
          ou a{' '}
          <Link href="/utilidade-publica" className="text-secondary hover:underline">
            central de utilidade pública
          </Link>
          .
        </p>
      </footer>
    </article>
  );
}
