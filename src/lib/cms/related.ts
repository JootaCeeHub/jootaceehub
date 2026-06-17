import type { JournalPostRow } from '@/lib/supabase/types'

export interface ScoredPost {
  post: JournalPostRow
  score: number
  sharedTags: string[]
}

/**
 * Score candidates against `current` using:
 *   - Tag overlap   → 3 pts per shared tag
 *   - Same category → 2 pts
 *   - Published recently (< 90 days) → 1 pt
 */
export function scoreRelatedPosts(
  current: JournalPostRow,
  candidates: JournalPostRow[]
): ScoredPost[] {
  const currentTags = new Set(current.tags ?? [])
  const now = Date.now()
  const ninetyDays = 90 * 24 * 60 * 60 * 1000

  return candidates
    .filter((p) => p.id !== current.id && p.status === 'published')
    .map((post) => {
      const sharedTags = (post.tags ?? []).filter((t) => currentTags.has(t))
      const score =
        sharedTags.length * 3 +
        (post.category === current.category ? 2 : 0) +
        (now - new Date(post.created_at).getTime() < ninetyDays ? 1 : 0)
      return { post, score, sharedTags }
    })
    .sort((a, b) => b.score - a.score)
}

export function getRelatedPosts(
  current: JournalPostRow,
  candidates: JournalPostRow[],
  limit = 3
): JournalPostRow[] {
  return scoreRelatedPosts(current, candidates)
    .slice(0, limit)
    .map(({ post }) => post)
}
