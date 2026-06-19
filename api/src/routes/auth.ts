import { Hono } from 'hono'
import { z } from 'zod'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import { signJWT, verifyJWT } from '../auth/jwt.js'
import { authMiddleware } from '../auth/middleware.js'
import { env } from '../env.js'
import { appendAudit } from '../lib/audit-log.js'
import type { HonoEnv } from '../types.js'

const router = new Hono<HonoEnv>()

// ---------------------------------------------------------------------------
// In-memory brute-force tracking
// Max 5 failed attempts per IP per 15-minute window.
// ---------------------------------------------------------------------------

interface FailRecord {
  count: number
  windowStart: number   // epoch ms
}

const failMap = new Map<string, FailRecord>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = failMap.get(ip)

  if (!rec) return false
  if (now - rec.windowStart > WINDOW_MS) {
    failMap.delete(ip)
    return false
  }
  return rec.count >= MAX_ATTEMPTS
}

function recordFailure(ip: string): void {
  const now = Date.now()
  const rec = failMap.get(ip)

  if (!rec || now - rec.windowStart > WINDOW_MS) {
    failMap.set(ip, { count: 1, windowStart: now })
  } else {
    rec.count++
  }
}

function clearFailures(ip: string): void {
  failMap.delete(ip)
}

// ---------------------------------------------------------------------------
// Password verification
// Format stored in ADMIN_PASSWORD_HASH: "<hex-salt>:<hex-derived-key>"
// Derived using scrypt (Node.js built-in, no extra dependency needed).
// ---------------------------------------------------------------------------

function verifyPassword(candidate: string, storedHash: string): boolean {
  const parts = storedHash.split(':')
  if (parts.length !== 2) return false

  const [saltHex, keyHex] = parts
  const salt = Buffer.from(saltHex, 'hex')
  const storedKey = Buffer.from(keyHex, 'hex')

  let candidateKey: Buffer
  try {
    // N=32768, r=8, p=1, keylen=64 — matches the example generator in .env.example
    candidateKey = scryptSync(candidate, salt, 64, { N: 32768, r: 8, p: 1 }) as Buffer
  } catch {
    return false
  }

  if (candidateKey.length !== storedKey.length) return false
  return timingSafeEqual(candidateKey, storedKey)
}

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

const LoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

router.post('/login', async (c) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.raw.headers.get('x-real-ip') ?? 'unknown'

  if (isRateLimited(ip)) {
    await appendAudit({
      actor: 'anonymous',
      action: 'auth.login.rate_limited',
      resource: '/auth/login',
      detail: `Rate limited after ${MAX_ATTEMPTS} failures`,
      ip,
    })
    return c.json(
      { success: false, error: 'Too many failed attempts. Try again in 15 minutes.' },
      429,
    )
  }

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Request body must be JSON' }, 400)
  }

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      400,
    )
  }

  const { password } = parsed.data
  const valid = verifyPassword(password, env.ADMIN_PASSWORD_HASH)

  if (!valid) {
    recordFailure(ip)
    await appendAudit({
      actor: 'anonymous',
      action: 'auth.login.failed',
      resource: '/auth/login',
      detail: 'Invalid password',
      ip,
    })
    return c.json({ success: false, error: 'Invalid credentials' }, 401)
  }

  clearFailures(ip)

  const token = await signJWT({ sub: 'admin' }, env.JWT_SECRET, env.JWT_EXPIRES_IN)

  // Decode to get the actual exp timestamp
  const payload = await verifyJWT(token, env.JWT_SECRET)
  const expiresAt = payload
    ? new Date(payload.exp * 1000).toISOString()
    : null

  await appendAudit({
    actor: 'admin',
    action: 'auth.login.success',
    resource: '/auth/login',
    detail: `Token issued, expires ${expiresAt ?? 'unknown'}`,
    ip,
  })

  return c.json({
    success: true,
    data: { token, expiresAt },
  })
})

// ---------------------------------------------------------------------------
// GET /auth/me — protected
// ---------------------------------------------------------------------------

router.get('/me', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const payload = await verifyJWT(token, env.JWT_SECRET)

  if (!payload) {
    return c.json({ success: false, error: 'Token verification failed' }, 401)
  }

  return c.json({
    success: true,
    data: {
      sub: payload.sub,
      iat: payload.iat,
      exp: payload.exp,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    },
  })
})

export default router
