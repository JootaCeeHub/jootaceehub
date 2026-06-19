import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { listContent, readContent, writeContent, deleteContent } from '../lib/content-store.js'
import { validateContent } from '../validation/schemas.js'
import { appendAudit } from '../lib/audit-log.js'
import { CONTENT_TYPES } from '../types.js'
import type { HonoEnv, ContentType } from '../types.js'

const router = new Hono<HonoEnv>()

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function clientIP(c: { req: { header: (k: string) => string | undefined } }): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    'unknown'
  )
}

function isValidType(t: string): t is ContentType {
  return (CONTENT_TYPES as string[]).includes(t)
}

// ---------------------------------------------------------------------------
// GET /content — list all files
// ---------------------------------------------------------------------------

router.get('/', async (c) => {
  try {
    const files = await listContent()
    return c.json({ success: true, data: files, meta: { count: files.length } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /content/:type — list files for a type
// ---------------------------------------------------------------------------

router.get('/:type', async (c) => {
  const type = c.req.param('type')

  if (!isValidType(type)) {
    return c.json(
      { success: false, error: `Unknown content type "${type}"` },
      400,
    )
  }

  try {
    const files = await listContent(type)
    return c.json({ success: true, data: files, meta: { count: files.length } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /content/:type/:slug — read one file
// Query: ?format=raw|json (default json)
// ---------------------------------------------------------------------------

router.get('/:type/:slug', async (c) => {
  const type = c.req.param('type')
  const slug = c.req.param('slug')
  const format = c.req.query('format') ?? 'json'

  if (!isValidType(type)) {
    return c.json({ success: false, error: `Unknown content type "${type}"` }, 400)
  }

  try {
    const data = await readContent(type, slug)

    if (format === 'raw') {
      const raw = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      return c.text(raw)
    }

    return c.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('ENOENT') ? 404 : msg.includes('Invalid') ? 400 : 500
    return c.json({ success: false, error: msg }, status as 400 | 404 | 500)
  }
})

// ---------------------------------------------------------------------------
// PUT /content/:type/:slug — write file (protected)
// ---------------------------------------------------------------------------

router.put('/:type/:slug', authMiddleware, async (c) => {
  const type = c.req.param('type')
  const slug = c.req.param('slug')
  const actor = c.get('actor')
  const ip = clientIP(c)

  if (!isValidType(type)) {
    return c.json({ success: false, error: `Unknown content type "${type}"` }, 400)
  }

  let body: unknown
  const contentType = c.req.header('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      // Treat plain text / MDX as a raw string
      body = await c.req.text()
    }
  } catch {
    return c.json({ success: false, error: 'Failed to parse request body' }, 400)
  }

  // Validate JSON content types; MDX strings are validated via frontmatter schema
  if (typeof body !== 'string') {
    const validation = validateContent(type, body)
    if (!validation.ok) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          meta: { errors: validation.errors },
        },
        422,
      )
    }
    body = validation.data
  }

  try {
    const result = await writeContent(type, slug, body)

    await appendAudit({
      actor,
      action: 'content.write',
      resource: `${type}/${slug}`,
      detail: `size=${result.size} checksum=${result.checksum.slice(0, 8)}...`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('Invalid') || msg.includes('traversal') ? 400 : 500
    return c.json({ success: false, error: msg }, status as 400 | 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /content/:type/:slug — delete file (protected)
// ---------------------------------------------------------------------------

router.delete('/:type/:slug', authMiddleware, async (c) => {
  const type = c.req.param('type')
  const slug = c.req.param('slug')
  const actor = c.get('actor')
  const ip = clientIP(c)

  if (!isValidType(type)) {
    return c.json({ success: false, error: `Unknown content type "${type}"` }, 400)
  }

  try {
    const result = await deleteContent(type, slug)

    await appendAudit({
      actor,
      action: 'content.delete',
      resource: `${type}/${slug}`,
      detail: `path=${result.path}`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('ENOENT') ? 404 : msg.includes('Invalid') ? 400 : 500
    return c.json({ success: false, error: msg }, status as 400 | 404 | 500)
  }
})

export default router
