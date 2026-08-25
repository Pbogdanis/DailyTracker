const CACHE_NAME = 'daily-tracker-v1';
const ASSETS = [
  '/DailyTracker/',
  '/DailyTracker/index.html',
  '/DailyTracker/manifest.json',
  '/DailyTracker/icon.svg',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
// Skip caching for Supabase API calls so data stays fresh
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});