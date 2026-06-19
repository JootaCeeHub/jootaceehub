import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { writeFile, unlink, readdir, stat } from 'node:fs/promises'
import { join, resolve, extname, basename } from 'node:path'
import { env } from '../env.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_WIDTH = 2400

// ---------------------------------------------------------------------------
// Path safety
// ---------------------------------------------------------------------------

function resolveMediaPath(subPath: string): string {
  const mediaRoot = resolve(env.MEDIA_ROOT)
  const resolved = resolve(join(mediaRoot, subPath))

  if (!resolved.startsWith(mediaRoot + '/') && resolved !== mediaRoot) {
    throw new RangeError(`Path traversal detected for media path: "${subPath}"`)
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Image processing
// ---------------------------------------------------------------------------

export interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  sizeBytes: number
  checksum: string  // SHA-256 hex
}

export interface ProcessImageOptions {
  maxWidth?: number
}

/**
 * Converts an image buffer to WebP, resizing if wider than maxWidth.
 */
export async function processImage(
  input: Buffer,
  options: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  const maxWidth = options.maxWidth ?? MAX_WIDTH

  const pipeline = sharp(input)
  const meta = await pipeline.metadata()
  const originalWidth = meta.width ?? 0

  let transform = pipeline.webp({ quality: 85 })

  if (originalWidth > maxWidth) {
    transform = sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 85 })
  }

  const out = await transform.toBuffer({ resolveWithObject: true })
  const checksum = createHash('sha256').update(out.data).digest('hex')

  return {
    buffer: out.data,
    width: out.info.width,
    height: out.info.height,
    sizeBytes: out.info.size,
    checksum,
  }
}

// ---------------------------------------------------------------------------
// Write / delete
// ---------------------------------------------------------------------------

export interface MediaWriteResult {
  url: string            // public URL path, e.g. /media/photos/image.webp
  absolutePath: string
  width: number
  height: number
  sizeBytes: number
  checksum: string
}

/**
 * Writes a processed image to MEDIA_ROOT/folder/filename.webp.
 * Creates the folder if it does not exist.
 */
export async function writeMedia(
  folder: string,
  filename: string,
  processed: ProcessedImage,
): Promise<MediaWriteResult> {
  // Sanitize folder and filename — no path separators or traversal sequences
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, '').toLowerCase() || 'uploads'
  const safeName = basename(filename).replace(/[^a-z0-9-_.]/gi, '').replace(/\.[^.]+$/, '')
  const outName = `${safeName}.webp`

  const absPath = resolveMediaPath(`${safeFolder}/${outName}`)

  // Ensure directory exists
  const { mkdir } = await import('node:fs/promises')
  await mkdir(resolve(join(env.MEDIA_ROOT, safeFolder)), { recursive: true })

  await writeFile(absPath, processed.buffer)

  return {
    url: `/media/${safeFolder}/${outName}`,
    absolutePath: absPath,
    width: processed.width,
    height: processed.height,
    sizeBytes: processed.sizeBytes,
    checksum: processed.checksum,
  }
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface MediaFileMeta {
  path: string        // relative to MEDIA_ROOT
  url: string         // public URL
  size: number        // bytes
  lastModified: string // ISO-8601
}

/**
 * Returns a flat list of all media files under MEDIA_ROOT.
 */
export async function getMediaList(): Promise<MediaFileMeta[]> {
  const mediaRoot = resolve(env.MEDIA_ROOT)
  const results: MediaFileMeta[] = []

  async function walk(dir: string): Promise<void> {
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      return
    }

    for (const name of entries) {
      const abs = join(dir, name)
      const info = await stat(abs).catch(() => null)
      if (!info) continue

      if (info.isDirectory()) {
        await walk(abs)
      } else {
        const ext = extname(name).toLowerCase()
        if (!['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) continue

        const relPath = abs.slice(mediaRoot.length + 1)
        results.push({
          path: relPath,
          url: `/media/${relPath}`,
          size: info.size,
          lastModified: info.mtime.toISOString(),
        })
      }
    }
  }

  await walk(mediaRoot)
  return results
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Safely deletes a media file. Verifies the resolved path stays within MEDIA_ROOT.
 */
export async function deleteMedia(subPath: string): Promise<{ deleted: boolean; path: string }> {
  const absPath = resolveMediaPath(subPath)
  await unlink(absPath)
  return { deleted: true, path: subPath }
}
