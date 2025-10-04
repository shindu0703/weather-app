const CACHE_NAME = 'weather-static-v1';
const DATA_CACHE_NAME = 'weather-data-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // If request is to OpenWeatherMap API -> try network first, fallback to cache
  if (evt.request.url.includes('api.openweathermap.org')) {
    evt.respondWith(
      fetch(evt.request)
        .then(response => {
          caches.open(DATA_CACHE_NAME).then(cache => { try { cache.put(evt.request.url, response.clone()); } catch(e){} });
          return response;
        })
        .catch(() => caches.match(evt.request))
    );
    return;
  }

  // For static files -> serve from cache first
  evt.respondWith(caches.match(evt.request).then(resp => resp || fetch(evt.request)));
});
