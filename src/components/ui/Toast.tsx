'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

function ToastContent({ type, message, onClose }: ToastProps) {
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  const styles = {
    success: 'bg-badge-success text-on-success border-success',
    error: 'bg-error text-on-error border-error',
    info: 'bg-secondary text-on-secondary border-secondary',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg min-w-[280px] max-w-md animate-slide-up ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
        {icons[type]}
      </span>
      <p className="flex-1 text-body-md">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-lg p-1 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fechar"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
}

interface ToastProviderProps {
  children?: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<{ id: number; type: ToastType; message: string }>>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        {toasts.map((toast) => (
          <ToastContent
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              window.showToast = function(type, message) {
                window.dispatchEvent(new CustomEvent('toast', { detail: { type, message } }));
              };
            })();
          `,
        }}
      />
    </>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; type: ToastType; message: string }>>([]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { type, message } = e.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
    window.addEventListener('toast', handler as EventListener);
    return () => window.removeEventListener('toast', handler as EventListener);
  }, []);

  return { toasts, setToasts };
}