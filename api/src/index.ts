import './env.js'  // validates environment before anything else
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from './env.js'
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

// Request logger (method + path + status + ms)
app.use('/*', logger())

// ---------------------------------------------------------------------------
// Health check — unauthenticated
// ---------------------------------------------------------------------------

const startTime = Date.now()
const BUILD_ID = process.env['BUILD_ID'] ?? 'dev'
const VERSION = '1.0.0'

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: VERSION,
    buildId: BUILD_ID,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  })
})

// ---------------------------------------------------------------------------
// Route groups
// ---------------------------------------------------------------------------

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
// Global error handler
// ---------------------------------------------------------------------------

app.onError((err, c) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[error] ${c.req.method} ${c.req.path}:`, message)
  return c.json({ success: false, error: message }, 500)
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const port = env.PORT

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[content-api] Listening on http://localhost:${info.port}`)
  console.log(`[content-api] CORS origin: ${env.CORS_ORIGIN}`)
  console.log(`[content-api] Repo root: ${env.REPO_ROOT}`)
  console.log(`[content-api] Content root: ${env.CONTENT_ROOT}`)
  console.log(`[content-api] Media root: ${env.MEDIA_ROOT}`)
})

export default app
