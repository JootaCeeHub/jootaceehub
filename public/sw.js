const CACHE_VERSION = 'v2'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const IMAGE_CACHE = `images-${CACHE_VERSION}`
const FONT_CACHE = `fonts-${CACHE_VERSION}`
const OFFLINE_PAGE = '/offline.html'

const PRECACHE_ASSETS = [
  '/',
  '/en',
  '/es',
  '/admin',
  '/offline.html',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Clone guard: streaming/opaque responses cannot be cloned safely
function safeClone(response) {
  if (!response || response.bodyUsed || response.type === 'opaque' || response.type === 'error') {
    return null
  }
  try {
    return response.clone()
  } catch {
    return null
  }
}

// Decide whether to intercept this request at all
function shouldHandle(request, url) {
  // Only GET from same origin
  if (request.method !== 'GET') return false
  if (url.origin !== self.location.origin) return false

  // Skip Next.js internals: HMR, webpack, RSC payloads, dev overlays
  if (url.pathname.startsWith('/_next/')) return false

  // Skip API routes
  if (url.pathname.startsWith('/api/')) return false

  return true
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (!shouldHandle(request, url)) return

  // ── CSS / JS: stale-while-revalidate ──────────────────────────────────────
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            const clone = safeClone(networkResponse)
            if (networkResponse.ok && clone) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
            }
            return networkResponse
          })
          .catch(() => cached)
        return cached || fetchPromise
      }),
    )
    return
  }

  // ── Fonts: cache-first ────────────────────────────────────────────────────
  if (
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((networkResponse) => {
          const clone = safeClone(networkResponse)
          if (networkResponse.ok && clone) {
            caches.open(FONT_CACHE).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
      }),
    )
    return
  }

  // ── Images: cache-first ───────────────────────────────────────────────────
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((networkResponse) => {
          const clone = safeClone(networkResponse)
          if (networkResponse.ok && clone) {
            caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
      }),
    )
    return
  }

  // ── Navigation: network-first with offline fallback ───────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = safeClone(response)
          if (response.ok && clone) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_PAGE)),
        ),
    )
    return
  }

  // ── Everything else: cache-first, network fallback ────────────────────────
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).catch(() => {
        if (request.destination === 'document') {
          return caches.match(OFFLINE_PAGE)
        }
        return new Response('', { status: 408, statusText: 'Network unavailable' })
      })
    }),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
