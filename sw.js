const VERSION = 'quran-v5-7';
const SHELL_CACHE = VERSION + '-shell';
const DATA_CACHE  = VERSION + '-data';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/index-JBEEVQCW.js',
  './assets/index-Mq0mt_p_.css',
  './assets/fonts/local.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isData = url.pathname.includes('/data/') && url.pathname.endsWith('.json');
  const cacheName = isData ? DATA_CACHE : SHELL_CACHE;

  // Cache-first for everything we serve
  e.respondWith(
    caches.open(cacheName).then((cache) =>
      cache.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((resp) => {
          if (resp && resp.ok && (resp.type === 'basic' || resp.type === 'cors')) {
            cache.put(req, resp.clone()).catch(() => {});
          }
          return resp;
        }).catch(() => hit);
      })
    )
  );
});
