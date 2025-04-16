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
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Don't cache non-success or non-GET responses
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
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