import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { readAudit } from '../lib/audit-log.js'
import type { HonoEnv } from '../types.js'

const router = new Hono<HonoEnv>()

// ---------------------------------------------------------------------------
// GET /audit?limit=50&type=&actor=&since=
// ---------------------------------------------------------------------------

router.get('/', authMiddleware, async (c) => {
  const limitRaw = c.req.query('limit')
  const limit = limitRaw ? Math.min(500, Math.max(1, parseInt(limitRaw, 10) || 50)) : 50
  const type = c.req.query('type') ?? undefined
  const actor = c.req.query('actor') ?? undefined
  const since = c.req.query('since') ?? undefined

  // Validate `since` if provided
  if (since) {
    const d = new Date(since)
    if (isNaN(d.getTime())) {
      return c.json(
        { success: false, error: '"since" must be a valid ISO-8601 date string' },
        400,
      )
    }
  }

  try {
    const entries = await readAudit({ limit, type, actor, since })
    return c.json({
      success: true,
      data: entries,
      meta: { count: entries.length, limit, filters: { type, actor, since } },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

export default router
