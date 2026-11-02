// =================================================================
// FLAMINGO STORE — PRODUCTION PWA SERVICE WORKER
// Workbox-powered Zero-Stale-Data Caching Strategy
// =================================================================

const SW_VERSION = 'flamingo-pwa-v1.0.0';

// 1. Load Workbox from official Google CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (self.workbox) {
  // console.log(`[PWA] Workbox loaded successfully (${SW_VERSION})`);

  // Activate new service worker immediately without waiting
  self.skipWaiting();
  workbox.core.clientsClaim();

  // -------------------------------------------------------------
  // STRATEGY 1: DYNAMIC DATA — STRICTLY NETWORK ONLY (NO STALE RISK)
  // Ensures prices, stock, cart, try-on, and orders are NEVER stale
  // -------------------------------------------------------------

  // Supabase Database & Realtime API calls
  workbox.routing.registerRoute(
    ({ url }) => url.hostname.includes('supabase.co'),
    new workbox.strategies.NetworkOnly()
  );

  // Next.js API Routes (/api/*)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkOnly()
  );

  // Checkout, Account, Track Order & Admin pages (Strictly live data)
  workbox.routing.registerRoute(
    ({ url }) =>
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/checkout') ||
      url.pathname.startsWith('/account') ||
      url.pathname.startsWith('/order-success') ||
      url.pathname.startsWith('/login') ||
      url.pathname.startsWith('/register'),
    new workbox.strategies.NetworkOnly()
  );

  // -------------------------------------------------------------
  // STRATEGY 2: PAGE NAVIGATION — NETWORK FIRST
  // Always fetches fresh HTML from server, falls back to cache offline
  // -------------------------------------------------------------
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'flamingo-pages-cache',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 25,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );

  // -------------------------------------------------------------
  // STRATEGY 3: STATIC CODE ASSETS — STALE WHILE REVALIDATE
  // Next.js chunks, styles, Webpack scripts
  // -------------------------------------------------------------
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/_next/static/'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'flamingo-static-assets',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 80,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );

  // -------------------------------------------------------------
  // STRATEGY 4: IMAGES & ICONS — CACHE FIRST
  // Product thumbnails, logos, UI badges, Cloudinary & Unsplash CDN
  // -------------------------------------------------------------
  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname),
    new workbox.strategies.CacheFirst({
      cacheName: 'flamingo-images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // -------------------------------------------------------------
  // STRATEGY 5: WEBFONTS — CACHE FIRST
  // Google Fonts stylesheets & webfont binaries
  // -------------------------------------------------------------
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'flamingo-webfonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }),
      ],
    })
  );

} else {
  // -------------------------------------------------------------
  // VANILLA JS FALLBACK (If Workbox CDN is unreachable)
  // -------------------------------------------------------------
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Bypass dynamic data
    if (
      url.hostname.includes('supabase.co') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/checkout')
    ) {
      return;
    }

    // NetworkFirst for HTML navigation
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
      );
      return;
    }
  });
}
