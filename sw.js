const CACHE_NAME = 'cocktail-compass-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/favicon-96x96.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - network first, falling back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();

        // Cache successful responses for static assets
        if (STATIC_ASSETS.includes(event.request.url)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Return cached response if available
        return caches.match(event.request);
      })
  );
});