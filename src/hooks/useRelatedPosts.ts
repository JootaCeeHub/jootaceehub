'use client'

import { useMemo } from 'react'
import { getRelatedPosts } from '@/lib/cms/related'
import type { JournalPostRow } from '@/lib/cms/posts'

export interface UseRelatedPostsReturn {
  posts: JournalPostRow[]
  loading: boolean
}

// Git-First CMS: related posts derived from static content loaded into AdminState.
// Callers should pass candidates from AdminState or static content registries.
export function useRelatedPosts(
  current: JournalPostRow | null,
  candidates: JournalPostRow[] = [],
  limit = 3
): UseRelatedPostsReturn {
  const posts = useMemo(
    () => current ? getRelatedPosts(current, candidates, limit) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id, candidates, limit]
  )
  return { posts, loading: false }
}
