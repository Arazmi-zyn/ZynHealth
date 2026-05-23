/**
 * 🌿 ZynHealth Service Worker v2.2
 * FIX: Aggressive cache busting - no more stale content!
 * Strategy: Network first, cache as fallback
 */

const CACHE_VERSION = 'v2.2';
const CACHE_NAME = 'zynhealth-' + CACHE_VERSION;

// Files to cache for offline use
const CACHE_FILES = [
  './',
  './index.html',
  './api.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

// ── INSTALL: Cache essential files ──
self.addEventListener('install', event => {
  console.log('[SW] Installing ZynHealth', CACHE_VERSION);
  // IMMEDIATELY activate new SW - don't wait for old tabs to close
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(err => {
        console.warn('[SW] Cache addAll partial fail:', err);
      });
    })
  );
});

// ── ACTIVATE: Clear ALL old caches immediately ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating', CACHE_VERSION, '- clearing old caches');
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then(keys => 
        Promise.all(
          keys.filter(key => key !== CACHE_NAME)
              .map(key => {
                console.log('[SW] Deleting old cache:', key);
                return caches.delete(key);
              })
        )
      ),
      // Take control of all open tabs immediately
      self.clients.claim()
    ])
  );
});

// ── FETCH: Network First strategy ──
// Always try network first → only use cache if offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET, external APIs, analytics
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('generativelanguage.googleapis.com')) return;
  if (url.hostname.includes('api.openai.com')) return;
  if (url.hostname.includes('api.anthropic.com')) return;
  if (url.hostname.includes('cdn.tailwindcss.com')) return;
  if (url.hostname.includes('fonts.googleapis.com')) return;

  // For our own files: Network First
  if (url.hostname === location.hostname || 
      url.pathname.includes('index.html') ||
      url.pathname.includes('api.js') ||
      url.pathname.includes('manifest.json')) {
    
    event.respondWith(networkFirst(event.request));
    return;
  }

  // For CDN resources: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});

// Network First: try network, fallback to cache
async function networkFirst(request) {
  try {
    const networkRes = await fetch(request, { cache: 'no-store' });
    if (networkRes.ok) {
      // Update cache with fresh response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkRes.clone());
    }
    return networkRes;
  } catch (err) {
    // Offline - serve from cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cached;
    }
    // Last resort
    return new Response('<h1>Offline</h1><p>Buka ZynHealth saat online dulu.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale While Revalidate: serve cache, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// ── MESSAGE: Force update from app ──
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => {
      event.source?.postMessage('CACHE_CLEARED');
    });
  }
});

console.log('[SW] ZynHealth SW', CACHE_VERSION, 'loaded ✅');
