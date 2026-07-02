// ─── Surco Service Worker ───────────────────────────────
// Cache-first para assets estáticos, network-first para API
// Versión: 1.0.0

const CACHE_STATIC = "surco-static-v1";
const CACHE_API = "surco-api-v1";
const STATIC_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
];

// ─── Instalación ──────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(STATIC_URLS);
    })
  );
  self.skipWaiting();
});

// ─── Activación ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_STATIC && k !== CACHE_API)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Interceptar fetch ─────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== self.location.origin) return;

  // API routes: network-first con fallback a cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, CACHE_API));
    return;
  }

  // Assets estáticos (Next.js chunks, imágenes): cache-first
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Navegación: network-first con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithCache(request, CACHE_STATIC));
    return;
  }
});

// ─── Estrategias de cache ──────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Sin conexión", { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Sin conexión", { status: 503 });
  }
}
