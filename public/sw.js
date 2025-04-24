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

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // Skip unsupported schemes
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Skip caching for development URLs and dynamic content
  if (url.hostname === 'localhost' || 
      url.hostname.includes('.localhost') || 
      url.searchParams.toString() || 
      url.pathname.startsWith('/@vite/') || 
      url.pathname.endsWith('.jsx') || 
      url.pathname.includes('react-refresh') ||
      url.pathname.includes('src/') ||
      url.pathname.includes('node_modules/') ||
      url.pathname.includes('assets/')) {
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('Development resource fetch failed:', error);
          return new Response('Development server not running', { status: 503 });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Don't cache failed responses or non-GET requests
            if (!response || !response.ok || event.request.method !== 'GET') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
                  .catch(err => console.warn('Cache put failed:', err));
              });

            return response;
          }
        );
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

// Keep-alive for audio streams
const audioSessions = new Set();

// Special handling for audio streams
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Check if this is an audio/video stream
  if (
    (url.pathname.includes('.m3u8') || 
     url.pathname.includes('.mp3') ||
     url.pathname.includes('/audio/') ||
     url.pathname.includes('/live/'))
  ) {
    // Don't cache stream requests, pass through to network
    event.respondWith(fetch(event.request));
    
    // Add to active sessions
    audioSessions.add(url.href);
  }
});