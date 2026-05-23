// Service Worker v2 - Cache invalidé
var CACHE_NAME = 'arr-cache-v2';

// Supprimer tous les anciens caches au démarrage
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          console.log('Cache supprimé:', key);
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Ne pas mettre en cache — toujours aller chercher sur le réseau
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
