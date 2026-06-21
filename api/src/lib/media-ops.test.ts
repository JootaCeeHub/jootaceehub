import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// Set MEDIA_ROOT before importing so resolveMediaPath uses the temp dir.
async function setMediaRoot(root: string) {
  const envMod = await import('../env.js')
  ;(envMod.env as Record<string, string>).MEDIA_ROOT = root
}

// ---------------------------------------------------------------------------
// Path safety — resolveMediaPath (tested indirectly via deleteMedia)
// ---------------------------------------------------------------------------

describe('media-ops — path traversal protection', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-media-'))
    await setMediaRoot(tmp)
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('deleteMedia rejects traversal sequences', async () => {
    const { deleteMedia } = await import('./media-ops.js')
    await expect(deleteMedia('../../../etc/passwd')).rejects.toThrow('Path traversal')
  })

  it('deleteMedia rejects absolute paths that escape MEDIA_ROOT', async () => {
    const { deleteMedia } = await import('./media-ops.js')
    await expect(deleteMedia('/etc/hosts')).rejects.toThrow()
  })

  it('deleteMedia accepts a valid relative path within MEDIA_ROOT', async () => {
    const { deleteMedia } = await import('./media-ops.js')
    const folder = join(tmp, 'photos')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'img.webp'), Buffer.alloc(8))

    const result = await deleteMedia('photos/img.webp')
    expect(result.deleted).toBe(true)
    expect(result.path).toBe('photos/img.webp')
  })

  it('deleteMedia throws ENOENT for missing file (not silently succeeds)', async () => {
    const { deleteMedia } = await import('./media-ops.js')
    await expect(deleteMedia('photos/does-not-exist.webp')).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// writeMedia — sanitizes folder and filename
// ---------------------------------------------------------------------------

describe('media-ops — writeMedia sanitization', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-media-'))
    await setMediaRoot(tmp)
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('strips dangerous characters from folder name', async () => {
    const { writeMedia } = await import('./media-ops.js')
    const fakeProcessed = {
      buffer: Buffer.alloc(4),
      width: 100,
      height: 100,
      sizeBytes: 4,
      checksum: 'abc123',
    }
    // folder has traversal chars — should be stripped/sanitized
    const result = await writeMedia('../../../evil', 'photo.webp', fakeProcessed)
    // The sanitized folder should not contain the traversal
    expect(result.url).not.toContain('../')
    expect(result.url).toContain('/media/')
  })

  it('returns correct URL format', async () => {
    const { writeMedia } = await import('./media-ops.js')
    const fakeProcessed = {
      buffer: Buffer.alloc(4),
      width: 200,
      height: 150,
      sizeBytes: 4,
      checksum: 'deadbeef',
    }
    const result = await writeMedia('photos', 'my-image.jpg', fakeProcessed)
    expect(result.url).toBe('/media/photos/my-image.webp')
    expect(result.width).toBe(200)
    expect(result.height).toBe(150)
    expect(result.checksum).toBe('deadbeef')
  })
})

// ---------------------------------------------------------------------------
// getMediaList — directory walk
// ---------------------------------------------------------------------------

describe('media-ops — getMediaList', () => {
  let tmp: string

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'jootacee-media-'))
    await setMediaRoot(tmp)
  })

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true })
  })

  it('returns empty list when MEDIA_ROOT is empty', async () => {
    const { getMediaList } = await import('./media-ops.js')
    const list = await getMediaList()
    expect(list).toEqual([])
  })

  it('lists .webp files in subdirectories', async () => {
    const { getMediaList } = await import('./media-ops.js')
    const photos = join(tmp, 'photos')
    await mkdir(photos, { recursive: true })
    await writeFile(join(photos, 'test.webp'), Buffer.alloc(8))

    const list = await getMediaList()
    expect(list.length).toBe(1)
    expect(list[0]!.url).toBe('/media/photos/test.webp')
    expect(list[0]!.size).toBe(8)
    expect(list[0]!.path).toBe('photos/test.webp')
  })

  it('ignores non-media file extensions', async () => {
    const { getMediaList } = await import('./media-ops.js')
    await writeFile(join(tmp, 'README.md'), 'text')
    await writeFile(join(tmp, 'config.json'), '{}')

    const list = await getMediaList()
    expect(list.length).toBe(0)
  })

  it('includes multiple allowed extensions', async () => {
    const { getMediaList } = await import('./media-ops.js')
    const dir = join(tmp, 'assets')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'a.webp'), Buffer.alloc(1))
    await writeFile(join(dir, 'b.jpg'), Buffer.alloc(1))
    await writeFile(join(dir, 'c.png'), Buffer.alloc(1))
    await writeFile(join(dir, 'd.txt'), 'skip')

    const list = await getMediaList()
    expect(list.length).toBe(3)
    const exts = list.map((f) => f.path.split('.').pop())
    expect(exts).toContain('webp')
    expect(exts).toContain('jpg')
    expect(exts).toContain('png')
  })
})
