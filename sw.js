/* PulseFit service worker: makes the app installable and usable offline.
   - App files: network first (you always get the latest when online), cached copy when offline.
   - Exercise images and fonts: served from cache, refreshed in the background.
   - Never touches Supabase or any other site's requests (sync must always hit the network). */
const SHELL = 'pf-shell-v24';
const MEDIA = 'pf-media-v1';
const SHELL_FILES = [
  './', './index.html', './styles.css', './app.js', './data.js', './theme-boot.js', './pwa.js',
  './sync-config.js', './mealplan.js', './recipes.js', './videos.js', './vendor/capacitor-8.6.0.js', './sync-core.js', './sync.js', './vendor/supabase-2.118.0.js', './img/manifest.js',
  './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const key of await caches.keys()) if (![SHELL, MEDIA].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  }
}

async function staleWhileRevalidate(req, ev) {
  const cache = await caches.open(MEDIA);
  const hit = await cache.match(req);
  const update = fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) { ev.waitUntil(update); return hit; }
  return (await update) || Response.error();
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/img/') && url.pathname.endsWith('.webp')) ev.respondWith(staleWhileRevalidate(req, ev));
    else ev.respondWith(networkFirst(req));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    ev.respondWith(staleWhileRevalidate(req, ev));
  }
  // Everything else (Supabase, sign-in providers) goes straight to the network.
});
