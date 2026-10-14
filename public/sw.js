// Service Worker para Portal São Carlos
// Estratégia: stale-while-revalidate com max-age de 30 minutos (1800s)
// Serve conteúdo em cache imediatamente, mas revalida em background após 30 min

const CACHE_NAME = 'portal-sao-carlos-v1';
const MAX_AGE_SECONDS = 1800; // 30 minutos

// Lista de URLs para cachear (apenas a home por enquanto)
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/apple-icon.png'
];

// Instala o service worker e pré-cache assets essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativa o service worker e limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
    .then(() => self.clients.claim())
  );
});

// Intercepta requisições para aplicar estratégia de cache
self.addEventListener('fetch', (event) => {
  // Só trata requisições GET para o próprio domínio
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Ignora requisições para APIs externas ou recursos específicos
  if (url.pathname.startsWith('/api/') || url.pathname.includes('.json') && !url.pathname.startsWith('/content/')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.match(event.request)
          .then((cachedResponse) => {
            // Se temos resposta em cache
            if (cachedResponse) {
              // Verifica idade do cached response
              const dateHeader = cachedResponse.headers.get('date');
              if (dateHeader) {
                const cachedTime = new Date(dateHeader).getTime();
                const now = Date.now();
                const ageSeconds = (now - cachedTime) / 1000;

                // Se está fresco (<30 min), serve imediatamente
                if (ageSeconds < MAX_AGE_SECONDS) {
                  return cachedResponse;
                }

                // Se está antigo (>=30 min), serve cache mas inicia revalidação em background
                fetch(event.request)
                  .then((networkResponse) => {
                    // Atualiza cache com resposta fresca
                    if (networkResponse && networkResponse.status === 200) {
                      cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                  })
                  .catch(() => {
                    // Se falha na rede, retorna o que tem em cache (mesmo que antigo)
                    return cachedResponse;
                  });

                // Retorna cache imediato, mas atualiza em background
                return cachedResponse;
              }
            }

            // Sem cache - busca na rede e armazena
            return fetch(event.request)
              .then((networkResponse) => {
                // Só cacheia respostas válidas
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Em caso de falha, tenta retornar algo do cache se existir
                return caches.match('/offline.html') || new Response('Offline', { status: 503 });
              });
          });
      })
  );
});

// Mensagem para forçar atualização de conteúdo quando necessário
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});