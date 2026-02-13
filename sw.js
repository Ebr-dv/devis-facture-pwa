const CACHE_NAME = 'ebr-smarthome-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Installation : Mise en cache des fichiers principaux
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Suppression de l\'ancien cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interception des requêtes : Stratégie "Cache First" (Priorité au hors ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si la ressource est dans le cache, on la retourne (offline)
        if (cachedResponse) {
          return cachedResponse;
        }
        // Sinon, on essaie de la chercher sur le réseau
        return fetch(event.request).then(
          (networkResponse) => {
            // Optionnel : On peut mettre en cache les nouvelles ressources au passage
            // Attention : ne mettre en cache que si c'est une requête de même origine (CORS)
            if(!event.request.url.startsWith('http')) return networkResponse;
            
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        );
      })
  );
});

