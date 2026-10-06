/*
 * Service worker: keeps a full copy of the site on the device, so it can be read offline
 * (wifi-only devices on the bus to a game).
 *
 * This is a template. The `offline` integration in astro.config.mjs copies it to
 * dist/sw.js after every build and fills in the three placeholders below. Changing any
 * built file changes VERSION, which makes browsers install the new worker.
 *
 * Strategy:
 *  - install: download every page and asset of the site into one cache.
 *  - pages: network first, so online readers always see the latest version; the
 *    cached copy is used when the network is gone.
 *  - everything else (/_astro/ files, icons): cache first. /_astro/ names change
 *    whenever their content changes, and each new VERSION downloads a fresh cache.
 */
const VERSION = '__VERSION__';
const BASE = '__BASE__';
const PRECACHE = [] /* __PRECACHE__ */;

const CACHE = `hockey-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isPage = request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
  event.respondWith(isPage ? networkFirst(request, url) : cacheFirst(request));
});

async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    if (response.ok) await put(request, response.clone());
    return response;
  } catch {
    return (await cachedPage(url)) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await put(request, response.clone());
  return response;
}

/**
 * Offline lookup for a page. trailingSlash is 'ignore', so links may point to either
 * /de/schlaeger or /de/schlaeger/; the cache holds the slash form. An unknown page
 * falls back to the overview of its language.
 */
async function cachedPage(url) {
  const path = url.pathname;
  const locale = path.slice(BASE.length).split('/')[0];
  const candidates = [path, path.endsWith('/') ? path : `${path}/`, `${BASE}${locale}/`, `${BASE}de/`];
  for (const candidate of candidates) {
    const match = await caches.match(candidate, { ignoreSearch: true });
    if (match) return match;
  }
  return undefined;
}

/**
 * Safari refuses to show a page a service worker answers with a redirected response
 * (e.g. /de/schlaeger -> /de/schlaeger/), so store a plain copy instead.
 */
async function put(request, response) {
  const plain = response.redirected
    ? new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers })
    : response;
  const cache = await caches.open(CACHE);
  await cache.put(request, plain);
}
