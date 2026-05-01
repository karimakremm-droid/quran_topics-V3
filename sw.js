const CACHE = 'quran-v62';

// Files to precache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/assets/index-JBEEVQCW.js',
  '/assets/index-Mq0mt_p_.css',
  '/data/categories.dat',
  '/data/ayahs.dat',
  '/data/khatm_plan.dat',
  '/data/tadabbur_data.dat',
  '/data/page_map.dat',
  '/data/tafsir_manifest.dat'
  // tafsir chunks (large) are cached on first use
];

// Install: precache all critical assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for assets, network-first for navigation
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Cache-first strategy for static assets and data files
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/data/') ||
    url.pathname.match(/\.(png|ico|svg|woff2|css|js)$/)
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(resp => {
          // Cache valid responses
          // status 0 = opaque response (iOS Safari from cache, cross-origin)
          if (resp.ok || resp.status === 0) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        }).catch(() => cached); // fallback to cache if network fails
      })
    );
    return;
  }

  // Network-first for navigation (HTML pages)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Default: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp.ok || resp.status === 0) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      });
      return cached || fetchPromise;
    })
  );
});
