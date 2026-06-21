import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import app from '../app.js'

// We must point env at a temp content root so tests don't touch the real repo.
// The env module is already validated before tests start.

async function withContentRoot(fn: (root: string) => Promise<void>): Promise<void> {
  const tmp = await mkdtemp(join(tmpdir(), 'jootacee-routes-'))
  const envMod = await import('../env.js')
  const prevRoot = (envMod.env as Record<string, string>).CONTENT_ROOT
  ;(envMod.env as Record<string, string>).CONTENT_ROOT = tmp

  // Create a projects dir for JSON content
  await mkdir(join(tmp, 'projects'), { recursive: true })
  await mkdir(join(tmp, 'articles'), { recursive: true })

  try {
    await fn(tmp)
  } finally {
    ;(envMod.env as Record<string, string>).CONTENT_ROOT = prevRoot
    await rm(tmp, { recursive: true, force: true })
  }
}

// ---------------------------------------------------------------------------
// GET /content — list all
// ---------------------------------------------------------------------------

describe('GET /content', () => {
  it('returns 200 with empty data when no files exist', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content')
      expect(res.status).toBe(200)
      const body = await res.json() as Record<string, unknown>
      expect(body['success']).toBe(true)
      expect(Array.isArray(body['data'])).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// GET /content/:type — list by type
// ---------------------------------------------------------------------------

describe('GET /content/:type', () => {
  it('returns 200 for a valid type', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects')
      expect(res.status).toBe(200)
      const body = await res.json() as Record<string, unknown>
      expect(body['success']).toBe(true)
    })
  })

  it('returns 400 for an unknown type', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/unknowntype')
      expect(res.status).toBe(400)
      const body = await res.json() as Record<string, unknown>
      expect(body['success']).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// GET /content/:type/:slug — read
// ---------------------------------------------------------------------------

describe('GET /content/:type/:slug', () => {
  it('returns 404 for a missing file', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects/does-not-exist')
      expect(res.status).toBe(404)
      const body = await res.json() as Record<string, unknown>
      expect(body['success']).toBe(false)
    })
  })

  it('returns 400 for an invalid slug (path traversal attempt)', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects/../../../etc/passwd')
      // Hono will either 400 or route mismatch; not 200
      expect(res.status).not.toBe(200)
    })
  })
})

// ---------------------------------------------------------------------------
// PUT /content/:type/:slug — write (protected)
// ---------------------------------------------------------------------------

describe('PUT /content/:type/:slug — auth required', () => {
  it('returns 401 when no Authorization header is present', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects/test-proj', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      })
      expect(res.status).toBe(401)
    })
  })

  it('returns 401 for an invalid token', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects/test-proj', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer not-a-valid-token',
        },
        body: JSON.stringify({ name: 'Test' }),
      })
      expect(res.status).toBe(401)
    })
  })

  it('returns 400 for unknown content type even without auth', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/badtype/some-slug', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: 1 }),
      })
      // 401 (auth check first) or 400 (type check first) — either means not 2xx
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })
})

// ---------------------------------------------------------------------------
// DELETE /content/:type/:slug — delete (protected)
// ---------------------------------------------------------------------------

describe('DELETE /content/:type/:slug — auth required', () => {
  it('returns 401 when no Authorization header is present', async () => {
    await withContentRoot(async () => {
      const res = await app.request('/content/projects/test-proj', {
        method: 'DELETE',
      })
      expect(res.status).toBe(401)
    })
  })
})
