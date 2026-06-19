import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware } from '../auth/middleware.js'
import { getStatus, getLog, stageAndCommit, revert } from '../lib/git-ops.js'
import { appendAudit } from '../lib/audit-log.js'
import { env } from '../env.js'
import type { HonoEnv } from '../types.js'

const router = new Hono<HonoEnv>()

function clientIP(c: { req: { header: (k: string) => string | undefined } }): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  )
}

// ---------------------------------------------------------------------------
// GET /git/status
// ---------------------------------------------------------------------------

router.get('/status', authMiddleware, async (c) => {
  try {
    const status = await getStatus()
    return c.json({ success: true, data: status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /git/log?limit=20
// ---------------------------------------------------------------------------

router.get('/log', authMiddleware, async (c) => {
  const limitRaw = c.req.query('limit')
  const limit = limitRaw ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20)) : 20

  try {
    const entries = await getLog(limit, 'src/content')
    return c.json({ success: true, data: entries, meta: { count: entries.length, limit } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /git/commit — protected
// ---------------------------------------------------------------------------

const CommitSchema = z.object({
  message: z.string().min(1, 'Commit message is required').max(500),
  files: z.array(z.string()).optional(),
})

router.post('/commit', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Request body must be JSON' }, 400)
  }

  const parsed = CommitSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      400,
    )
  }

  const { message, files } = parsed.data

  try {
    const result = await stageAndCommit(
      files ?? [],
      message,
      env.GIT_USER_NAME,
      env.GIT_USER_EMAIL,
    )

    await appendAudit({
      actor,
      action: 'git.commit',
      resource: 'repo',
      detail: `hash=${result.hash} message="${message}" files=${result.filesChanged.length}`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// POST /git/rollback — protected
// ---------------------------------------------------------------------------

const RollbackSchema = z.object({
  hash: z.string().min(7, 'Commit hash is required (min 7 chars)'),
})

router.post('/rollback', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Request body must be JSON' }, 400)
  }

  const parsed = RollbackSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      400,
    )
  }

  const { hash } = parsed.data

  try {
    const result = await revert(hash)

    await appendAudit({
      actor,
      action: 'git.rollback',
      resource: 'repo',
      detail: `reverted=${hash} revertCommit=${result.revertHash}`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

export default router
