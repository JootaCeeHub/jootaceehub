import { Hono } from 'hono'
import { authMiddleware } from '../auth/middleware.js'
import { processImage, writeMedia, getMediaList, deleteMedia } from '../lib/media-ops.js'
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

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/tiff',
  'image/bmp',
])

// ---------------------------------------------------------------------------
// POST /media — upload and process image (protected)
// Accepts multipart/form-data with fields: file, alt?, folder?
// ---------------------------------------------------------------------------

router.post('/', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  let formData: FormData
  try {
    formData = await c.req.formData()
  } catch {
    return c.json({ success: false, error: 'Request must be multipart/form-data' }, 400)
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return c.json({ success: false, error: 'Missing "file" field in form data' }, 400)
  }

  const folder = (formData.get('folder') as string | null) ?? 'uploads'
  const alt = (formData.get('alt') as string | null) ?? ''

  // Validate MIME type
  const mime = file.type.toLowerCase().split(';')[0] ?? ''
  if (!ALLOWED_MIME.has(mime)) {
    return c.json(
      { success: false, error: `Unsupported file type "${mime}". Must be image/*.` },
      415,
    )
  }

  // Validate size
  const maxBytes = env.MEDIA_MAX_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return c.json(
      {
        success: false,
        error: `File exceeds maximum size of ${env.MEDIA_MAX_SIZE_MB} MB`,
      },
      413,
    )
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const processed = await processImage(inputBuffer)
    const result = await writeMedia(folder, file.name, processed)

    await appendAudit({
      actor,
      action: 'media.upload',
      resource: result.url,
      detail: `originalName="${file.name}" size=${result.sizeBytes} alt="${alt}"`,
      ip,
    })

    return c.json({
      success: true,
      data: {
        url: result.url,
        width: result.width,
        height: result.height,
        size: result.sizeBytes,
        checksum: result.checksum,
        alt,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// GET /media — list all media files
// ---------------------------------------------------------------------------

router.get('/', authMiddleware, async (c) => {
  try {
    const files = await getMediaList()
    return c.json({ success: true, data: files, meta: { count: files.length } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ success: false, error: msg }, 500)
  }
})

// ---------------------------------------------------------------------------
// DELETE /media/:path — delete media file (protected)
// The :path param captures the sub-path within MEDIA_ROOT (e.g. "photos/image.webp")
// ---------------------------------------------------------------------------

router.delete('/*', authMiddleware, async (c) => {
  const actor = c.get('actor')
  const ip = clientIP(c)

  // Extract everything after /media/
  const subPath = c.req.path.replace(/^\/media\/?/, '')
  if (!subPath) {
    return c.json({ success: false, error: 'Missing media path' }, 400)
  }

  try {
    const result = await deleteMedia(subPath)

    await appendAudit({
      actor,
      action: 'media.delete',
      resource: `/media/${subPath}`,
      detail: `path=${result.path}`,
      ip,
    })

    return c.json({ success: true, data: result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('ENOENT') ? 404 : msg.includes('traversal') ? 400 : 500
    return c.json({ success: false, error: msg }, status as 400 | 404 | 500)
  }
})

export default router
