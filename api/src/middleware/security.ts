import type { MiddlewareHandler } from 'hono'
import type { HonoEnv } from '../types.js'

// ---------------------------------------------------------------------------
// VPS Hardening Middleware — Phase 5
// Adds: request-id, security headers, global rate limiting, payload cap
// ---------------------------------------------------------------------------

// --- In-memory global rate limiter (per IP, sliding window) ----------------

interface RateSlot { count: number; windowStart: number }
const _globalMap = new Map<string, RateSlot>()
const GLOBAL_MAX  = 200  // requests
const GLOBAL_WIN  = 60_000  // 1-minute window

function globalRateLimit(ip: string): boolean {
  const now  = Date.now()
  const slot = _globalMap.get(ip)
  if (!slot || now - slot.windowStart > GLOBAL_WIN) {
    _globalMap.set(ip, { count: 1, windowStart: now })
    return false
  }
  slot.count++
  return slot.count > GLOBAL_MAX
}

// Periodic cleanup so the map doesn't grow unbounded in long-running process
setInterval(() => {
  const cutoff = Date.now() - GLOBAL_WIN * 2
  for (const [ip, slot] of _globalMap) {
    if (slot.windowStart < cutoff) _globalMap.delete(ip)
  }
}, 5 * 60_000)

// --- Request-ID header ------------------------------------------------------

let _seq = 0
function nextId() { return `req-${Date.now()}-${(++_seq).toString(36)}` }

// --- Blocked IP list (populated at startup from env) -----------------------

const _blocked = new Set<string>(
  (process.env['BLOCKED_IPS'] ?? '').split(',').map(s => s.trim()).filter(Boolean)
)

// ---------------------------------------------------------------------------
// Middleware export
// ---------------------------------------------------------------------------

export const hardeningMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
            ?? c.req.header('x-real-ip')
            ?? '0.0.0.0'

  // 1 — Blocked IP list
  if (_blocked.has(ip)) {
    return c.json({ success: false, error: 'Forbidden' }, 403)
  }

  // 2 — Global rate limit
  if (globalRateLimit(ip)) {
    c.header('Retry-After', '60')
    return c.json({ success: false, error: 'Too many requests' }, 429)
  }

  // 3 — Payload size cap (10 MB)
  const contentLength = Number(c.req.header('content-length') ?? 0)
  if (contentLength > 10 * 1024 * 1024) {
    return c.json({ success: false, error: 'Payload too large' }, 413)
  }

  // 4 — Request-ID (attach to context + response)
  const reqId = nextId()
  c.header('X-Request-Id', reqId)

  await next()

  // 5 — Security response headers
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('X-DNS-Prefetch-Control', 'off')
  c.header('X-Permitted-Cross-Domain-Policies', 'none')
  // Only expose server version in dev
  if (process.env['NODE_ENV'] !== 'production') {
    c.header('X-Powered-By', 'Hono/Content-API')
  }
}

// ---------------------------------------------------------------------------
// Slow-down middleware for sensitive endpoints (auth, git push)
// Adds artificial 200ms delay after 10 req/min from same IP
// ---------------------------------------------------------------------------

const _slowMap = new Map<string, RateSlot>()
const SLOW_THRESHOLD = 10
const SLOW_WIN = 60_000

export const slowDownMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0'
  const now = Date.now()
  const slot = _slowMap.get(ip)

  if (!slot || now - slot.windowStart > SLOW_WIN) {
    _slowMap.set(ip, { count: 1, windowStart: now })
  } else {
    slot.count++
    if (slot.count > SLOW_THRESHOLD) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  await next()
}
