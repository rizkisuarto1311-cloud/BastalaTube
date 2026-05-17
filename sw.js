const CACHE_NAME = 'bastala-cache-v1';
const assets = [
  './',
  './index.html',
  './style-kids.css',
  './script_kids.js',
  './data.js',            // Tambahkan file data video
  './daftarkomentar.js',  // Tambahkan file daftar komentar
  './logo.png',
  './manifest.json'       // Tambahkan manifest agar PWA terbaca offline
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
