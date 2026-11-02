/* =========================================================
   SERVICE WORKER — jogo offline no celular
   Ao publicar uma versão nova, troque VERSION para invalidar o cache.
   ========================================================= */
const VERSION = 'oasis-3d-2026-11-02-3';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/vendor/three.min.js',
  './js/config.js',
  './js/world.js',
  './js/player.js',
  './js/camera.js',
  './js/zones.js',
  './js/puzzles.js',
  './js/sfx.js',
  './js/nano.js',
  './js/factors.js',
  './js/transect.js',
  './js/ui.js',
  './js/pwa.js',
  './js/main.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // um arquivo ausente não pode derrubar a instalação inteira
    await Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fontes do Google seguem a rede

  // navegação: rede primeiro (para pegar atualização), cache como reserva
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put('./index.html', res.clone()).catch(() => {});
        return res;
      } catch (err) {
        return (await caches.match(req)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  // estáticos: cache primeiro, atualização em segundo plano
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) {
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(VERSION).then((c) => c.put(req, res)).catch(() => {});
      }).catch(() => {});
      return hit;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        const cache = await caches.open(VERSION);
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    } catch (err) {
      return (await caches.match('./index.html')) || Response.error();
    }
  })());
});
