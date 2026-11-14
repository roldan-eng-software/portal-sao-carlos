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

function InstitutionalDropdown() {
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
        const focusableItems = itemRefs.current.filter(
          (el): el is HTMLAnchorElement => el !== null,
        );
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
        const focusableItems = itemRefs.current.filter(
          (el): el is HTMLAnchorElement => el !== null,
        );
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
        className="flex shrink-0 items-center gap-2 rounded-lg px-1 font-body text-body-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary focus-visible:outline-3 focus-visible:outline-secondary focus-visible:outline-offset-2"
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

/** Botão hambúrguer desenhado em CSS (o subset de ícones não inclui `menu`/`close`). */
function MenuToggle({
  open,
  onClick,
  buttonRef,
}: {
  open: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-on-surface shadow-card transition-colors hover:bg-surface-container-low xl:hidden"
    >
      <span className="flex h-4 w-5 flex-col justify-between" aria-hidden="true">
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
            open ? 'translate-y-[7px] rotate-45' : ''
          }`}
        />
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${
            open ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`h-0.5 w-full rounded-full bg-current transition-transform duration-200 ${
            open ? '-translate-y-[7px] -rotate-45' : ''
          }`}
        />
      </span>
    </button>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="border-t border-border-subtle xl:hidden">
      <nav
        aria-label="Navegação principal (mobile)"
        className="mx-auto max-h-[calc(100dvh-4rem)] w-full max-w-[1200px] overflow-y-auto px-4 py-3 sm:px-6"
      >
        <ul className="grid grid-cols-2 gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="min-w-0">
              <a
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-11 items-center rounded-lg bg-surface-container-low px-3 py-2 text-body-md font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-3 border-t border-border-subtle pt-3">
          <span className="block px-1 pb-1 text-label-sm uppercase text-outline">
            Institucional
          </span>
          <ul className="grid grid-cols-2 gap-x-2">
            {INSTITUTIONAL_ITEMS.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="flex min-h-10 items-center rounded-md px-2 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Fecha ao passar para o layout desktop (>= xl); o painel só existe abaixo disso.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) setMobileOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-card/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex min-w-0 shrink-0 items-center gap-2"
          aria-label="Meu Bairro — Portal São Carlos, página inicial"
        >
          <Image
            src="/logo.png"
            alt="Portal São Carlos — Utilidade Pública & Notícias"
            width={407}
            height={165}
            sizes="(min-width: 640px) 100px, 80px"
            priority
            className="h-8 w-auto sm:h-10"
          />
          <span
            className="hidden self-end text-label-sm text-on-surface-variant 2xl:block"
            aria-hidden="true"
          >
            <strong className="text-secondary">Meu Bairro</strong> · São Carlos
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6"
        >
          <NavLinks />
          <InstitutionalDropdown />
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:gap-4">
          <Link
            href="/anuncie"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-label-lg text-on-secondary shadow-[0_2px_8px_rgba(2,102,255,0.25)] transition-all hover:bg-primary-container sm:px-4 sm:py-2.5"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              storefront
            </span>
            <span className="sm:hidden">Anuncie</span>
            <span className="hidden sm:inline">Anuncie Aqui</span>
          </Link>

          <MenuToggle
            open={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            buttonRef={toggleRef}
          />
        </div>
      </div>

      {mobileOpen && <MobileNav onNavigate={() => setMobileOpen(false)} />}
    </header>
  );
}
