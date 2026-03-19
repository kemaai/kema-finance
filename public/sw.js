const CACHE_NAME = 'kema-ai-v2';
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/pwa-offline.html'
];

// Install Service Worker - only cache essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Network first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip OAuth routes - never cache these
  if (request.url.includes('/~oauth')) {
    return;
  }

  // Skip Supabase API requests
  if (request.url.includes('supabase')) {
    return;
  }

  // Navigation requests (HTML pages) - ALWAYS go to network
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/pwa-offline.html') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images) - Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});