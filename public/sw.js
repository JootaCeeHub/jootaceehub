const CACHE_VERSION = 'v1'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.endsWith(CACHE_VERSION) === false)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkResponse.clone()))
            }
            return networkResponse
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  if (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.woff') || url.pathname.endsWith('.ttf')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(FONT_CACHE).then((cache) => cache.put(request, networkResponse.clone()))
            }
            return networkResponse
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(IMAGE_CACHE).then((cache) => cache.put(request, networkResponse.clone()))
            }
            return networkResponse
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached
            return caches.match(OFFLINE_PAGE)
          })
        })
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).catch(() => {
        if (request.destination === 'document') {
          return caches.match(OFFLINE_PAGE)
        }
        return new Response('', { status: 408, statusText: 'Network unavailable' })
      })
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
