import type { FetchResult } from '../types'

const CACHE = new Map<string, { result: FetchResult; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function getCached(feedId: string): FetchResult | null {
  const entry = CACHE.get(feedId)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    CACHE.delete(feedId)
    return null
  }
  return entry.result
}

export function setCache(feedId: string, result: FetchResult) {
  CACHE.set(feedId, { result, ts: Date.now() })
}

export function clearCache(feedId?: string) {
  if (feedId) CACHE.delete(feedId)
  else CACHE.clear()
}
