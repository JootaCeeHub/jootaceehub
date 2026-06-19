import { Hono } from 'hono'
import { z } from 'zod'
import { authMiddleware } from '../auth/middleware.js'
import { enqueue, getJob, getHistory, runBuild, isBuildRunning } from '../lib/build-queue.js'
import { rollbackDeploy } from '../lib/atomic-deploy.js'
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
// POST /build/trigger — protected
// ---------------------------------------------------------------------------

const TriggerSchema = z.object({
  reason: z.string().max(200).optional(),
})

router.post('/trigger', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  if (isBuildRunning()) {
    return c.json(
      { success: false, error: 'A build is already in progress. Try again after it completes.' },
      409,
    )
  }

  let body: unknown = {}
  try {
    body = await c.req.json()
  } catch {
    // Body is optional — default to empty object
  }

  const parsed = TriggerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      400,
    )
  }

  const reason = parsed.data.reason ?? `Triggered by ${actor}`
  const job = enqueue(reason)

  // Fire-and-forget — runBuild updates the job map asynchronously
  runBuild(job.id, env.REPO_ROOT)

  await appendAudit({
    actor,
    action: 'build.trigger',
    resource: `job/${job.id}`,
    detail: `reason="${reason}"`,
    ip,
  })

  return c.json({ success: true, data: { jobId: job.id, status: job.status } }, 202)
})

// ---------------------------------------------------------------------------
// GET /build/status/:jobId
// ---------------------------------------------------------------------------

router.get('/status/:jobId', authMiddleware, async (c) => {
  const jobId = c.req.param('jobId')
  const job = getJob(jobId)

  if (!job) {
    return c.json({ success: false, error: `Job "${jobId}" not found` }, 404)
  }

  return c.json({ success: true, data: job })
})

// ---------------------------------------------------------------------------
// GET /build/history?limit=10
// ---------------------------------------------------------------------------

router.get('/history', authMiddleware, async (c) => {
  const limitRaw = c.req.query('limit')
  const limit = limitRaw ? Math.min(50, Math.max(1, parseInt(limitRaw, 10) || 10)) : 10

  const history = getHistory(limit)
  return c.json({ success: true, data: history, meta: { count: history.length, limit } })
})

// ---------------------------------------------------------------------------
// POST /build/deploy-rollback — swap Nginx symlink back to previous slot
// Does NOT re-run npm build; just swaps the already-deployed slot.
// Use /git/rollback first to revert content, then trigger this to serve the old dist.
// ---------------------------------------------------------------------------

router.post('/deploy-rollback', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  try {
    const result = await rollbackDeploy()

    await appendAudit({
      actor,
      action: 'build.deploy-rollback',
      resource: 'nginx-root',
      detail: `swapped from=${result.from} to=${result.to}`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

export default router
