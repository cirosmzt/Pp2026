const CACHE = 'pp2026-v29';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index_v29.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {

  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {

      if (cached) {
        return cached;
      }

      return fetch(e.request)
        .then(response => {

          if (
            response &&
            response.status === 200 &&
            e.request.url.startsWith(self.location.origin)
          ) {

            const clone = response.clone();

            caches.open(CACHE)
              .then(cache => cache.put(e.request, clone));
          }

          return response;

        })
        .catch(() => {

          if (
            e.request.headers.get('accept')?.includes('text/html')
          ) {
            return caches.match('/index_v29.html')
              .then(r => r || caches.match('/index.html'));
          }

          return new Response(
            '🔌 Sei offline. Riprova più tardi.',
            {
              status: 503,
              headers: {
                'Content-Type': 'text/plain; charset=utf-8'
              }
            }
          );
        });
    })
  );
});
```
