'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { href: '#noticias', label: 'Notícias' },
  { href: '#clima', label: 'Clima' },
  { href: '#informativos', label: 'Avisos Úteis' },
  { href: '#contatos', label: 'Telefones de Emergência' },
  { href: '#anuncios', label: 'Guia Comercial' },
] as const;

const INSTITUTIONAL_ITEMS = [
  { href: '/sobre', label: 'Sobre o Portal' },
  { href: '/contato', label: 'Contato' },
  { href: '/termos-de-uso', label: 'Termos de uso' },
  { href: '/aviso-editorial', label: 'Aviso editorial' },
  { href: '/politica-de-privacidade', label: 'Política de privacidade' },
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

function InstitutionalDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menu institucional"
        className="flex shrink-0 items-center gap-1.5 text-label-lg text-on-surface-variant transition-colors hover:text-secondary"
      >
        <span>Institucional</span>
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card shadow-lg border border-border-subtle py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
        >
          <nav aria-label="Páginas institucionais">
            <ul className="space-y-1 px-2">
              {INSTITUTIONAL_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container"
                    role="menuitem"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface-card/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Portal São Carlos — página inicial"
        >
          <Image
            src="/logo.png"
            alt="Portal São Carlos — Utilidade Pública & Notícias"
            width={407}
            height={165}
            sizes="(min-width: 640px) 100px, 90px"
            priority
            className="h-9 w-auto sm:h-10"
          />
          <span className="hidden self-end text-label-sm text-on-surface-variant sm:block" aria-hidden="true">
            Portal do <strong className="text-secondary">MeuBairro</strong>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 xl:flex"
        >
          <NavLinks />
          <InstitutionalDropdown />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <a
            href="https://wa.me/5516981442301?text=Para%20o%20cadastro%20gratuito%20escreva%20abaixo%20os%20seguintes%20dados...%0ANome%20do%20Comercio:%0ABreve%20descri%C3%A7%C3%A3o:%0AHor%C3%A1rio%20de%20atendimento:%0AEndere%C3%A7o:%0ANumero%20do%20seu%20WhatsApp:%0ASite%20de%20sua%20empresa:"
            target="_blank"
            rel="noopener noreferrer"
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
          <InstitutionalDropdown />
        </div>
      </nav>
    </header>
  );
}