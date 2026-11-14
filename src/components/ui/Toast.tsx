'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

/** Tempo que o aviso fica na tela antes de sumir sozinho. */
const AUTO_DISMISS_MS = 6000;
/** Empilhamento máximo — avisos mais antigos saem primeiro. */
const MAX_VISIBLE = 3;

const ACCENT: Record<ToastType, string> = {
  success: 'border-l-badge-success',
  error: 'border-l-error',
  info: 'border-l-secondary',
};

/**
 * Dispara um aviso flutuante de qualquer componente cliente.
 * O `ToastProvider` (montado no layout raiz) escuta o evento `toast` e renderiza a fila.
 */
export function showToast(type: ToastType, message: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }));
}

/**
 * Ícones disponíveis no subset auto-hospedado: `check_circle` e `info` existem;
 * `error` e `close` não — por isso o "!" e o "×" são desenhados com CSS/texto,
 * evitando a ligadura crua aparecendo como texto (ver src/app/fonts/README.md).
 */
function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <span
        className="material-symbols-outlined icon-filled mt-0.5 text-[22px] text-badge-success"
        aria-hidden="true"
      >
        check_circle
      </span>
    );
  }

  if (type === 'info') {
    return (
      <span
        className="material-symbols-outlined mt-0.5 text-[22px] text-secondary"
        aria-hidden="true"
      >
        info
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error text-[13px] font-bold leading-none text-on-error"
    >
      !
    </span>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`animate-toast-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-l-4 border-border-subtle bg-surface-card p-4 text-on-surface shadow-lead sm:w-auto sm:min-w-[320px] sm:max-w-md ${ACCENT[toast.type]}`}
    >
      <ToastIcon type={toast.type} />
      <p className="flex-1 text-body-md leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar aviso"
        className="-m-1 shrink-0 rounded-lg p-1 text-outline transition-colors hover:bg-surface-container hover:text-on-surface"
      >
        <span aria-hidden="true" className="block text-lg leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

/**
 * Fila global de avisos flutuantes (canto inferior direito no desktop, largura
 * total no mobile). Recebe mensagens via `showToast()` / evento `toast`.
 */
export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;

    function handleToast(event: Event) {
      const detail = (event as CustomEvent<{ type?: ToastType; message?: string }>).detail;
      const message = detail?.message?.trim();
      if (!message) return;

      const type: ToastType =
        detail?.type === 'error' || detail?.type === 'info' ? detail.type : 'success';
      const id = nextIdRef.current++;

      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        // Descarta os excedentes junto com o timer deles.
        while (next.length > MAX_VISIBLE) {
          const removed = next.shift();
          const timer = removed ? timers.get(removed.id) : undefined;
          if (removed && timer) {
            clearTimeout(timer);
            timers.delete(removed.id);
          }
        }
        return next;
      });

      timers.set(
        id,
        setTimeout(() => {
          timers.delete(id);
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, AUTO_DISMISS_MS),
      );
    }

    window.addEventListener('toast', handleToast);
    return () => {
      window.removeEventListener('toast', handleToast);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      data-testid="toast-region"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}
