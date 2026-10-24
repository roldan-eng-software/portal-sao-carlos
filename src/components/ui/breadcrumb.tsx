import Link from 'next/link';
import { env } from '@/config/env';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

/**
 * Trilha de navegação estrutural: visual (nav/ol semântico, com separadores
 * ocultos para leitores de tela) + dados estruturados BreadcrumbList no
 * JSON-LD, no mesmo padrão de escape de `components/seo/json-ld.tsx` (os `<`
 * são substituídos para impedir o fechamento antecipado da tag <script>).
 *
 * A home é sempre o primeiro item; passe apenas os níveis dela para baixo.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail = [{ name: 'Início', href: '/' }, ...items];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${env.siteUrl}${item.href}`,
    })),
  };

  return (
    <>
      <nav aria-label="Você está em" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-label-sm text-on-surface-variant">
          {trail.map((item, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-on-surface">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="text-secondary hover:underline">
                      {item.name}
                    </Link>
                    <span aria-hidden="true" className="text-outline">
                      ›
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
