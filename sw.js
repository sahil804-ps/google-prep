var CACHE = 'gprep-v4';
var SHELL = [
  './',
  'index.html',
  'css/style.css',
  'js/data/problems.js',
  'js/data/bonus.js',
  'js/data/topics.js',
  'js/data/topics-deep-1.js',
  'js/data/topics-deep-2.js',
  'js/data/basics.js',
  'js/data/videos.js',
  'js/data/design.js',
  'js/data/td-answers.js',
  'js/data/sd-answers.js',
  'js/data/english.js',
  'js/plan.js',
  'js/day.js',
  'js/store.js',
  'js/recorder.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Network first, revalidating past the HTTP cache (GitHub Pages sends max-age=600),
// so a new deploy shows up on the next load; the cache is only the offline fallback.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
