/**
 * API Content Adapter — implements ContentRepository against the Hono VPS API.
 *
 * CLIENT-SAFE. Uses fetch() — works in browser and Node.js 18+.
 *
 * Phase 3 activation: set NEXT_PUBLIC_CONTENT_API_URL in Cloudflare Pages env.
 * When the env var is absent the factory returns null so callers can fall back
 * to the MDX adapter or AdminState adapter gracefully.
 *
 * @example
 * const repo = createApiContentAdapter()
 * if (!repo) return fallbackToMdxAdapter()
 * const articles = await repo.findAll({ status: 'published' })
 */

import type { ContentItem, ContentLocale } from '@/lib/content/types'
import type { ContentFilter, ContentRepository } from '@/lib/content/repository'

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? ''

// ── Wire filter to query string ───────────────────────────────────────────────

function filterToParams(filter?: ContentFilter): URLSearchParams {
  const p = new URLSearchParams()
  if (!filter) return p
  if (filter.type) {
    const types = Array.isArray(filter.type) ? filter.type : [filter.type]
    types.forEach(t => p.append('type', t))
  }
  if (filter.status)   p.set('status',   filter.status)
  if (filter.locale)   p.set('locale',   filter.locale)
  if (filter.featured !== undefined) p.set('featured', String(filter.featured))
  if (filter.tags?.length)  filter.tags.forEach(t => p.append('tag', t))
  if (filter.offset)   p.set('offset',   String(filter.offset))
  if (filter.limit)    p.set('limit',    String(filter.limit))
  return p
}

// ── Fetch helper with auth forwarding ────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('jootacee-api-token')
    : null

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`)
  }

  return res.json() as Promise<T>
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Returns null when NEXT_PUBLIC_CONTENT_API_URL is not configured — callers
 * should fall back to the MDX or AdminState adapter.
 */
export function createApiContentAdapter(): ContentRepository<ContentItem> | null {
  if (!API_BASE) return null

  return {
    async findBySlug(slug: string, locale?: ContentLocale): Promise<ContentItem | null> {
      try {
        const params = new URLSearchParams({ slug })
        if (locale) params.set('locale', locale)
        const results = await apiFetch<ContentItem[]>(`/content?${params}`)
        return results[0] ?? null
      } catch {
        return null
      }
    },

    async findAll(filter?: ContentFilter): Promise<ContentItem[]> {
      const params = filterToParams(filter)
      return apiFetch<ContentItem[]>(`/content?${params}`)
    },

    async count(filter?: ContentFilter): Promise<number> {
      const params = filterToParams(filter)
      params.set('count', 'true')
      const res = await apiFetch<{ count: number }>(`/content/count?${params}`)
      return res.count
    },

    async search(query: string, filter?: ContentFilter): Promise<ContentItem[]> {
      const params = filterToParams(filter)
      params.set('q', query)
      return apiFetch<ContentItem[]>(`/content/search?${params}`)
    },
  }
}

// ── Singleton for admin panel use ─────────────────────────────────────────────

let _singleton: ContentRepository<ContentItem> | null | undefined

/** Lazily-resolved singleton. Returns null if API is not configured. */
export function getApiContentAdapter(): ContentRepository<ContentItem> | null {
  if (_singleton === undefined) {
    _singleton = createApiContentAdapter()
  }
  return _singleton
}
