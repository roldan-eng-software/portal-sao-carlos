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
          className={`shrink-0 font-body text-body-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary ${className}`}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

function InstitutionalDropdown({ fullWidth = false }: { fullWidth?: boolean }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

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

  // Fecha com Escape e gerencia foco
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.key === 'Tab' && menuRef.current) {
        const focusableItems = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
        if (focusableItems.length === 0) return;

        const firstItem = focusableItems[0];
        const lastItem = focusableItems[focusableItems.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          if (activeElement === firstItem || !menuRef.current.contains(activeElement)) {
            event.preventDefault();
            lastItem.focus();
          }
        } else {
          if (activeElement === lastItem) {
            event.preventDefault();
            firstItem.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => {
        const newOpen = !prev;
        if (newOpen) {
          // Focar primeiro item após abrir
          setTimeout(() => {
            itemRefs.current[0]?.focus();
          }, 0);
        }
        return newOpen;
      });
      return;
    }

    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault();
      setOpen(true);
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 0);
      return;
    }

    if (event.key === 'ArrowUp' && !open) {
      event.preventDefault();
      setOpen(true);
      setTimeout(() => {
        const focusableItems = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
        focusableItems[focusableItems.length - 1]?.focus();
      }, 0);
    }
  }

  function handleItemKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>, index: number) {
    const focusableItems = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % focusableItems.length;
      focusableItems[nextIndex]?.focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (index - 1 + focusableItems.length) % focusableItems.length;
      focusableItems[prevIndex]?.focus();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusableItems[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusableItems[focusableItems.length - 1]?.focus();
      return;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        id="institutional-menu-button"
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setTimeout(() => {
              itemRefs.current[0]?.focus();
            }, 0);
          }
        }}
        onKeyDown={handleButtonKeyDown}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="institutional-menu"
        className={`flex shrink-0 items-center gap-2 font-body text-body-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary focus-visible:outline-3 focus-visible:outline-secondary focus-visible:outline-offset-2 ${
          fullWidth
            ? 'w-full justify-between rounded-lg bg-surface-card px-3 py-2 text-body-md shadow-card'
            : 'rounded-lg px-1'
        }`}
      >
        <span>Institucional</span>
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 border-b-2 border-r-2 border-current transition-transform ${
            open ? '-rotate-[135deg]' : 'rotate-45 -translate-y-0.5'
          }`}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card shadow-lg border border-border-subtle py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
          id="institutional-menu"
          aria-labelledby="institutional-menu-button"
        >
          <nav aria-label="Páginas institucionais">
            <ul className="space-y-1 px-2" ref={menuRef}>
              {INSTITUTIONAL_ITEMS.map((item, index) => (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => setOpen(false)}
                    onKeyDown={(e) => handleItemKeyDown(e, index)}
                    className="block w-full rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container focus-visible:bg-surface-container focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-[-2px]"
                    role="menuitem"
                    tabIndex={-1}
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
          aria-label="Meu Bairro — Portal São Carlos, página inicial"
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
          <span className="hidden self-end text-label-sm text-on-surface-variant 2xl:block" aria-hidden="true">
            <strong className="text-secondary">Meu Bairro</strong> · São Carlos
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 2xl:gap-6 xl:flex"
        >
          <NavLinks />
          <InstitutionalDropdown />
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/anuncie"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2.5 text-label-lg text-on-secondary shadow-[0_2px_8px_rgba(2,102,255,0.25)] transition-all hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              storefront
            </span>
            <span>Anuncie Aqui</span>
          </Link>
        </div>
      </div>

      <nav
        aria-label="Navegação principal (mobile)"
        className="border-t border-border-subtle xl:hidden"
      >
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-2 px-4 py-3 sm:px-6">
          <NavLinks className="w-full rounded-lg bg-surface-card px-3 py-2 text-center text-body-md shadow-card" />
          <InstitutionalDropdown fullWidth />
        </div>
      </nav>
    </header>
  );
}