const CACHE = 'quran-v1';
const ASSETS = ['./index.html','./manifest.json','./tafsir_p1.json','./tafsir_p2.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if(res.ok) { const c = res.clone(); caches.open(CACHE).then(ca=>ca.put(e.request,c)); }
    return res;
  }).catch(()=>caches.match('./index.html'))));
});
