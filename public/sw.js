// Service Worker for Tuner App
const CACHE_NAME = 'tuner-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/tuner-logo.svg',
  '/placeholder-radio.svg',
  '/placeholder-tv.svg'
];

// Install event - cache initial resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Failed to cache resources:', error);
            // Continue installation even if caching fails
            return Promise.resolve();
          });
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Unified Fetch event - careful to not intercept module requests or dev-only paths
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle http/https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Bypass Service Worker for dev server, module scripts, vite HMR and source files
  const isDevHost = url.hostname === 'localhost' || url.hostname.includes('.localhost');
  const isModuleRequest = /\/src\/|\.jsx$|\.js$/.test(url.pathname);
  const isViteInternal = url.pathname.startsWith('/@vite/') || url.pathname.includes('react-refresh');

  if (isDevHost || isModuleRequest || isViteInternal) {
    // Don't intercept module or dev requests; passthrough to network
    event.respondWith(
      fetch(event.request).catch(error => {
        console.warn('Dev passthrough fetch failed for:', event.request.url, error);
        return new Response('Dev server fetch failed', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // For stream requests (audio/video), passthrough and do not cache
  if (url.pathname.includes('.m3u8') || url.pathname.includes('.mp3') || url.pathname.includes('/audio/') || url.pathname.includes('/live/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Normal caching strategy for other assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request, { mode: 'cors', redirect: 'follow' }).then(response => {
        if (!response || !response.ok || event.request.method !== 'GET') return response;

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache).catch(err => console.warn('Cache put failed:', err));
        });
        return response;
      }).catch(error => {
        console.warn('Fetch failed for:', event.request.url, error && error.message);
        if (event.request.destination === 'image') {
          return new Response('', { status: 200, statusText: 'OK', headers: new Headers({ 'Content-Type': 'image/svg+xml' }) });
        }
        return new Response('Resource not available', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Skip waiting and take control immediately
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Keep-alive for audio streams (no special fetch handler needed since streams passthrough above)