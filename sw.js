const CACHE = 'pp2026-v29';
const FILES = [
  './',
  './index.html',
  './banca_dati.json',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return response;
    }))
  );
});
