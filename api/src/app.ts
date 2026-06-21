import './env.js'  // validates environment before anything else
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './env.js'
import { hardeningMiddleware, slowDownMiddleware } from './middleware/security.js'
import authRouter from './routes/auth.js'
import contentRouter from './routes/content.js'
import gitRouter from './routes/git.js'
import mediaRouter from './routes/media.js'
import buildRouter from './routes/build.js'
import auditRouter from './routes/audit.js'
import type { HonoEnv } from './types.js'

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------

const app = new Hono<HonoEnv>()

// CORS — allow only the configured admin panel origin
app.use(
  '/*',
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    exposeHeaders: ['X-Request-Id'],
    maxAge: 3600,
    credentials: false,
  }),
)

// Phase 5 — VPS hardening: rate limiting, security headers, request-ID
app.use('/*', hardeningMiddleware)

// Request logger (method + path + status + ms)
app.use('/*', logger())

// ---------------------------------------------------------------------------
// Health check — unauthenticated
// ---------------------------------------------------------------------------

const startTime = Date.now()
const BUILD_ID = process.env['BUILD_ID'] ?? 'dev'
const VERSION = '1.0.0'

app.get('/health', (c) => {
  const mem = process.memoryUsage()
  return c.json({
    status: 'ok',
    version: VERSION,
    buildId: BUILD_ID,
    uptime:   Math.floor((Date.now() - startTime) / 1000),
    ts:       new Date().toISOString(),
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB:      Math.round(mem.rss / 1024 / 1024),
    },
  })
})

// ---------------------------------------------------------------------------
// Route groups
// ---------------------------------------------------------------------------

// Slow-down on sensitive write endpoints
app.use('/auth/*', slowDownMiddleware)
app.use('/git/*',  slowDownMiddleware)

app.route('/auth', authRouter)
app.route('/content', contentRouter)
app.route('/git', gitRouter)
app.route('/media', mediaRouter)
app.route('/build', buildRouter)
app.route('/audit', auditRouter)

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------

app.notFound((c) => {
  return c.json({ success: false, error: `Route not found: ${c.req.method} ${c.req.path}` }, 404)
})

// ---------------------------------------------------------------------------
// Global error handler — normalizes messages in production to avoid leaking
// internal paths, stack traces, or file system details.
// ---------------------------------------------------------------------------

app.onError((err, c) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[error] ${c.req.method} ${c.req.path}:`, message)

  const isProd = process.env['NODE_ENV'] === 'production'
  const safeMessage = isProd ? 'Internal server error' : message

  return c.json({ success: false, error: safeMessage }, 500)
})

export default app
export { VERSION }
