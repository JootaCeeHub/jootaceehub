import { createHash } from 'node:crypto'
import { readFile, writeFile, unlink, readdir, stat, mkdir } from 'node:fs/promises'
import { join, resolve, extname, dirname } from 'node:path'
import { env } from '../env.js'
import { MDX_TYPES, CONTENT_TYPES } from '../types.js'
import type { ContentType } from '../types.js'

// ---------------------------------------------------------------------------
// Slug / path validation — deny traversal and special characters.
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/

function assertSafeType(type: string): asserts type is ContentType {
  if (!(CONTENT_TYPES as string[]).includes(type)) {
    throw new RangeError(`Unknown content type: "${type}"`)
  }
}

function assertSafeSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new RangeError(`Invalid slug: "${slug}". Only lowercase alphanumeric and hyphens allowed.`)
  }
}

/**
 * Returns the file extension for a given content type.
 * MDX types use .mdx; everything else uses .json.
 */
function extFor(type: ContentType): string {
  return (MDX_TYPES as ContentType[]).includes(type) ? '.mdx' : '.json'
}

/**
 * Resolves the absolute path for a content file and verifies it stays
 * within CONTENT_ROOT (path traversal protection).
 */
function resolveContentPath(type: ContentType, slug: string): string {
  const contentRoot = env.CONTENT_ROOT
  const ext = extFor(type)
  const resolved = resolve(join(contentRoot, type, `${slug}${ext}`))

  if (!resolved.startsWith(resolve(contentRoot) + '/')) {
    throw new RangeError(`Path traversal detected for type="${type}" slug="${slug}"`)
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ContentFileMeta {
  type: ContentType
  slug: string
  path: string      // relative to CONTENT_ROOT
  size: number      // bytes
  lastModified: string  // ISO-8601
  format: 'json' | 'mdx'
}

/**
 * Lists all content files. If `type` is provided, limits to that type.
 */
export async function listContent(type?: ContentType): Promise<ContentFileMeta[]> {
  const contentRoot = resolve(env.CONTENT_ROOT)
  const types: ContentType[] = type ? [type] : CONTENT_TYPES
  const results: ContentFileMeta[] = []

  for (const t of types) {
    const dir = join(contentRoot, t)
    let entries: string[]
    try {
      entries = await readdir(dir)
    } catch {
      continue // directory may not exist yet
    }

    for (const name of entries) {
      const ext = extname(name)
      if (ext !== '.json' && ext !== '.mdx') continue

      const slug = name.slice(0, -ext.length)
      const absPath = join(dir, name)
      let info
      try {
        info = await stat(absPath)
      } catch {
        continue
      }

      results.push({
        type: t,
        slug,
        path: `${t}/${name}`,
        size: info.size,
        lastModified: info.mtime.toISOString(),
        format: ext === '.mdx' ? 'mdx' : 'json',
      })
    }
  }

  return results
}

/**
 * Reads a content file.
 *
 * For JSON types: returns a parsed object.
 * For MDX types:  returns the raw string.
 */
export async function readContent(
  type: ContentType,
  slug: string,
): Promise<unknown> {
  assertSafeType(type)
  assertSafeSlug(slug)
  const filePath = resolveContentPath(type, slug)
  const raw = await readFile(filePath, 'utf-8')

  if (extFor(type) === '.json') {
    return JSON.parse(raw) as unknown
  }
  return raw
}

/**
 * Writes a content file.
 *
 * @param type   Content type.
 * @param slug   File slug (no extension).
 * @param data   For JSON types: any serialisable object. For MDX types: raw string.
 * @returns SHA-256 checksum (hex) and byte size of the written content.
 */
export async function writeContent(
  type: ContentType,
  slug: string,
  data: unknown,
): Promise<{ path: string; size: number; checksum: string }> {
  assertSafeType(type)
  assertSafeSlug(slug)
  const filePath = resolveContentPath(type, slug)

  let serialized: string
  if (extFor(type) === '.json') {
    serialized = JSON.stringify(data, null, 2)
  } else {
    if (typeof data !== 'string') {
      throw new TypeError('MDX content must be a string')
    }
    serialized = data
  }

  const buf = Buffer.from(serialized, 'utf-8')
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, buf)

  const checksum = createHash('sha256').update(buf).digest('hex')
  const relPath = `${type}/${slug}${extFor(type)}`

  return { path: relPath, size: buf.byteLength, checksum }
}

/**
 * Deletes a content file.
 */
export async function deleteContent(
  type: ContentType,
  slug: string,
): Promise<{ deleted: boolean; path: string }> {
  assertSafeType(type)
  assertSafeSlug(slug)
  const filePath = resolveContentPath(type, slug)
  await unlink(filePath)
  return { deleted: true, path: `${type}/${slug}${extFor(type)}` }
}
