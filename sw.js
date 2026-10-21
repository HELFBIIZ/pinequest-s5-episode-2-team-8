/* Offline-first service worker: once loaded, the whole app works without internet. */
const CACHE = 'naadamy-v4';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/styles.css', './assets/icon.svg', './assets/fonts/fonts.css',
  './assets/fonts/nunito-cyrillic.woff2', './assets/fonts/nunito-cyrillic-ext.woff2', './assets/fonts/nunito-latin.woff2',
  './assets/fonts/rubik-cyrillic.woff2', './assets/fonts/rubik-cyrillic-ext.woff2', './assets/fonts/rubik-latin.woff2',
  './js/core.js', './js/store.js', './js/data.js', './js/app.js',
  './js/games/letters.js', './js/games/counting.js', './js/games/memory.js', './js/games/healthy.js',
  './js/games/shagai.js', './js/games/mathduel.js', './js/games/coding.js', './js/games/budget.js',
  './js/games/quiz.js', './js/games/breathing.js', './js/games/move.js', './js/satis-levels.js', './js/satis.js',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const url = new URL(e.request.url);
    if (res.ok && url.origin === location.origin) {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
