'use client';

import { useEffect } from 'react';

/**
 * Registra o Service Worker em ambiente de produção.
 * O SW implementa stale-while-revalidate com max-age de 30 minutos.
 */
export function SWRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Atualiza o SW quando uma nova versão está disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] Nova versão disponível. Recarregue a página.');
            }
          });
        });

        // Verifica atualizações periodicamente (a cada 15 min)
        setInterval(() => {
          registration.update();
        }, 15 * 60 * 1000);

        console.log('[SW] Registrado com sucesso');
      } catch (error) {
        console.warn('[SW] Falha no registro:', error);
      }
    };

    // Registra após carregamento da página para não bloquear
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  }, []);

  return null;
}