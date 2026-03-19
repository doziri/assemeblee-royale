// Service Worker - ARR Cotisations v2.0
const CACHE_NAME = 'arr-cotisations-v2'; // Incrementer à chaque mise à jour
const FILES_TO_CACHE = [
  './espace-comite.html',
  './espace-membres.html',
];

// Installation : supprimer l'ancien cache et installer le nouveau
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(FILES_TO_CACHE).catch(function(){});
      });
    })
  );
  self.skipWaiting();
});

// Activation : prendre le contrôle immédiatement
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
  // Forcer le rechargement de tous les clients ouverts
  self.clients.matchAll({type: 'window'}).then(function(clients) {
    clients.forEach(function(client) { client.navigate(client.url); });
  });
});

// Fetch : toujours aller chercher sur le réseau en priorité (network-first)
self.addEventListener('fetch', function(e) {
  // Pour les fichiers HTML : toujours réseau en priorité
  if (e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Pour les autres ressources : cache en priorité
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(response) {
        if(response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });
    })
  );
});
