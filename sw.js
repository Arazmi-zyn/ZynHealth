// ZynHealth Service Worker v2.0
// Handles offline caching & background sync

const CACHE_NAME = 'zynhealth-v2.0.0';
const STATIC_CACHE = 'zynhealth-static-v2';
const DYNAMIC_CACHE = 'zynhealth-dynamic-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// External CDN assets to cache
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap',
];

// ── Install Event ──────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing ZynHealth v2.0...');
  // Skip waiting - apply updates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install error:', err))
  );
});

// ── Activate Event ─────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating ZynHealth v2.0...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch Event ────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip AI API calls (don't cache)
  if (url.hostname.includes('generativelanguage.googleapis.com') ||
      url.hostname.includes('api.openai.com') ||
      url.hostname.includes('api.anthropic.com') ||
      url.hostname.includes('api.deepseek.com') ||
      url.hostname.includes('api.x.ai')) {
    return;
  }

  // Strategy: Cache First for static, Network First for dynamic
  if (STATIC_ASSETS.some(asset => event.request.url.includes(asset.replace('./', '')))) {
    event.respondWith(cacheFirst(event.request));
  } else if (url.hostname === location.hostname || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(event.request));
  } else {
    event.respondWith(networkFirst(event.request));
  }
});

// ── Caching Strategies ─────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('<h1>Offline</h1><p>Buka PediCare saat online untuk pertama kali.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Network error', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ── Background Sync (for offline form submissions) ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-obat-data') {
    console.log('[SW] Background sync: obat data');
    // Data syncing handled by app on reconnect
  }
});

// ── Push Notification (Expiry Reminders) ──────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ZynHealth – Pengingat Obat';
  const options = {
    body: data.body || 'Ada obat yang perlu dicek.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || './' },
    actions: [
      { action: 'open', title: '📋 Lihat Sekarang' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url || './'));
  }
});

console.log('[SW] ZynHealth Service Worker loaded ✅');
