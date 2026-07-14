/*
 * Service Worker - Aura NY (molde CyC)
 *  - Navegaciones: red primero; sin senal, sirve el index cacheado.
 *  - Estaticos del mismo origen: cache-first, se guardan al vuelo.
 *  - Supabase u otros origenes: pasan de largo (no se cachean).
 * Subir la version (CACHE) limpia lo viejo al publicar cambios.
 */
const CACHE = 'aura-ny-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase u otros: de largo
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('/index.html', cp)); return r; })
        .catch(() => caches.match('/index.html').then((m) => m || caches.match('/')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((m) => m || fetch(req).then((r) => {
      const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r;
    }).catch(() => m))
  );
});
