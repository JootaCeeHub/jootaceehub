import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// Patch env before importing the module so resolveContentPath reads the temp dir.
let tmpDir: string

async function makeStore(root: string) {
  // Dynamic import so we can re-resolve env per test suite.
  // We override env.CONTENT_ROOT via the module-level env object.
  const envMod = await import('../env.js')
  ;(envMod.env as Record<string, string>).CONTENT_ROOT = root
  // Force module re-evaluation by importing after env patch.
  // Vitest caches modules — use unstable_resetModules in setup if needed.
  return import('./content-store.js')
}

describe('content-store — path safety', () => {
  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'jootacee-content-'))
    // Pre-create a known type directory
    await mkdir(join(tmpDir, 'articles'), { recursive: true })
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('rejects unknown content types in assertSafeType', async () => {
    const { readContent } = await makeStore(tmpDir)
    await expect(readContent('../../evil' as never, 'slug')).rejects.toThrow()
  })

  it('rejects slugs with path separators', async () => {
    const { readContent } = await makeStore(tmpDir)
    await expect(readContent('articles', '../../../etc/passwd')).rejects.toThrow()
  })

  it('rejects slugs with spaces', async () => {
    const { readContent } = await makeStore(tmpDir)
    await expect(readContent('articles', 'my slug')).rejects.toThrow()
  })

  it('rejects slugs with uppercase letters', async () => {
    const { readContent } = await makeStore(tmpDir)
    await expect(readContent('articles', 'MySlug')).rejects.toThrow()
  })

  it('accepts a valid slug with hyphens', async () => {
    const { writeContent, readContent } = await makeStore(tmpDir)
    const data = { title: 'Test', body: 'hello' }
    await writeContent('articles', 'my-article', JSON.stringify(data))
    // articles is MDX type → stores as .mdx (raw string)
    const read = await readContent('articles', 'my-article')
    expect(typeof read).toBe('string')
    // JSON stringified content stored as raw MDX
    expect(read).toContain('title')
  })
})

describe('content-store — CRUD', () => {
  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'jootacee-content-'))
    await mkdir(join(tmpDir, 'projects'), { recursive: true })
    await mkdir(join(tmpDir, 'articles'), { recursive: true })
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('writeContent stores JSON and readContent parses it back', async () => {
    const { writeContent, readContent } = await makeStore(tmpDir)
    const payload = { name: 'My Project', status: 'live' }
    await writeContent('projects', 'my-project', payload)
    const result = await readContent('projects', 'my-project')
    expect(result).toEqual(payload)
  })

  it('writeContent returns size and sha256 checksum', async () => {
    const { writeContent } = await makeStore(tmpDir)
    const { size, checksum, path } = await writeContent('projects', 'test-proj', { x: 1 })
    expect(size).toBeGreaterThan(0)
    expect(checksum).toMatch(/^[0-9a-f]{64}$/)
    expect(path).toBe('projects/test-proj.json')
  })

  it('listContent returns the written file', async () => {
    const { writeContent, listContent } = await makeStore(tmpDir)
    await writeContent('projects', 'listed-proj', { y: 2 })
    const files = await listContent('projects')
    expect(files.some((f) => f.slug === 'listed-proj')).toBe(true)
  })

  it('deleteContent removes the file', async () => {
    const { writeContent, deleteContent, listContent } = await makeStore(tmpDir)
    await writeContent('projects', 'to-delete', { z: 3 })
    const { deleted } = await deleteContent('projects', 'to-delete')
    expect(deleted).toBe(true)
    const files = await listContent('projects')
    expect(files.some((f) => f.slug === 'to-delete')).toBe(false)
  })

  it('deleteContent rejects path traversal', async () => {
    const { deleteContent } = await makeStore(tmpDir)
    await expect(deleteContent('projects', '../../../etc/passwd')).rejects.toThrow()
  })

  it('readContent throws ENOENT for missing file', async () => {
    const { readContent } = await makeStore(tmpDir)
    await expect(readContent('projects', 'does-not-exist')).rejects.toThrow()
  })

  it('writeContent for MDX type stores raw string', async () => {
    const { writeContent, readContent } = await makeStore(tmpDir)
    const mdx = '---\ntitle: Test\n---\nBody text.'
    await writeContent('articles', 'my-post', mdx)
    const result = await readContent('articles', 'my-post')
    expect(result).toBe(mdx)
  })

  it('writeContent for MDX type rejects non-string data', async () => {
    const { writeContent } = await makeStore(tmpDir)
    await expect(writeContent('articles', 'bad-post', { not: 'a string' })).rejects.toThrow(TypeError)
  })
})
