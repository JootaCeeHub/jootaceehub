'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface SearchResult {
  url: string
  title: string
  excerpt: string
  meta: Record<string, string>
  id: string
}

interface PagefindResult {
  id: string
  data: () => Promise<{
    url: string
    title: string
    excerpt: string
    meta: Record<string, string>
  }>
}

interface PagefindModule {
  init: () => Promise<void>
  search: (query: string) => Promise<{ results: PagefindResult[] }>
  debouncedSearch: (query: string, opts?: unknown, debounceMs?: number) => Promise<{ results: PagefindResult[] } | null>
}

// Module-level singleton — loaded once per page session, never retried after failure.
let pagefindPromise: Promise<PagefindModule | null> | null = null
let pagefindFailed = false

async function loadPagefind(): Promise<PagefindModule | null> {
  // Skip in dev mode — pagefind index only exists after `npm run build`.
  // Avoids a noisy 404 on every dev page load.
  if (typeof window === 'undefined' || pagefindFailed) return null
  if (process.env.NODE_ENV === 'development') return null
  if (pagefindPromise) return pagefindPromise

  pagefindPromise = (async () => {
    try {
      // Function constructor bypasses TypeScript's static import analysis.
      const pf = await (new Function('return import("/_pagefind/pagefind.js")')() as Promise<PagefindModule>)
      await pf.init()
      return pf
    } catch {
      pagefindFailed = true
      pagefindPromise = null
      return null
    }
  })()

  return pagefindPromise
}

export interface UseSearchReturn {
  query: string
  results: SearchResult[]
  loading: boolean
  ready: boolean
  search: (q: string) => void
  clear: () => void
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Warm up pagefind on mount (non-blocking)
  useEffect(() => {
    loadPagefind().then((pf) => setReady(pf !== null))
  }, [])

  const search = useCallback((q: string) => {
    setQuery(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    debounceRef.current = setTimeout(async () => {
      const pf = await loadPagefind()

      if (!pf) {
        setResults([])
        setLoading(false)
        return
      }

      const response = await pf.search(q.trim())
      const top = response.results.slice(0, 8)

      const resolved = await Promise.all(
        top.map(async (r) => {
          const d = await r.data()
          return {
            id: r.id,
            url: d.url,
            title: d.meta?.title ?? d.title ?? 'Untitled',
            excerpt: d.excerpt ?? '',
            meta: d.meta ?? {},
          } satisfies SearchResult
        })
      )

      setResults(resolved)
      setLoading(false)
    }, 300)
  }, [])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setLoading(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return { query, results, loading, ready, search, clear }
}
