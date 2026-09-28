import Link from 'next/link';

const NAV_ITEMS = [
  { href: '#noticias', label: 'Notícias' },
  { href: '#clima', label: 'Clima' },
  { href: '#informativos', label: 'Avisos Úteis' },
  { href: '#contatos', label: 'Telefones de Emergência' },
  { href: '#anuncios', label: 'Guia Comercial' },
] as const;

function NavLinks({ className = '' }: { className?: string }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`shrink-0 text-label-lg text-on-surface-variant transition-colors hover:text-secondary ${className}`}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-card/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="Portal São Carlos — página inicial"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary"
          >
            <span className="material-symbols-outlined text-[20px] text-on-secondary">
              newspaper
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-headline-sm text-primary">Portal São Carlos</span>
            <span className="mt-1 text-label-sm uppercase tracking-wider text-outline">
              Notícias &amp; Serviços
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex"
        >
          <NavLinks />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <a
            href="#anuncie"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2.5 text-label-lg text-on-secondary shadow-[0_2px_8px_rgba(2,102,255,0.25)] transition-all hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              storefront
            </span>
            <span>Anuncie Aqui</span>
          </a>
        </div>
      </div>

      {/* Navegação horizontal (mobile/tablet) — sem JS, apenas rolagem. */}
      <nav
        aria-label="Navegação principal (mobile)"
        className="border-t border-border-subtle xl:hidden"
      >
        <div className="mx-auto flex w-full max-w-[1200px] gap-5 overflow-x-auto px-4 py-2.5 sm:px-6">
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}
