'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getRelatedPosts } from '@/lib/cms/related'
import type { JournalPostRow } from '@/lib/supabase/types'

export interface UseRelatedPostsReturn {
  posts: JournalPostRow[]
  loading: boolean
}

export function useRelatedPosts(
  current: JournalPostRow | null,
  limit = 3
): UseRelatedPostsReturn {
  const [posts, setPosts] = useState<JournalPostRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!current) return
    let cancelled = false
    setLoading(true)

    const run = async () => {
      const { data } = await supabase
        .from('journal_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', current.id)
        .limit(50)

      if (cancelled) return
      const related = getRelatedPosts(current, (data as JournalPostRow[]) ?? [], limit)
      setPosts(related)
      setLoading(false)
    }

    void run()
    return () => { cancelled = true }
  }, [current?.id, limit]) // eslint-disable-line react-hooks/exhaustive-deps
  // Intentional: `current` identity changes are tracked via `current?.id`.
  // Including the full `current` object would cause infinite loops when the
  // parent component re-renders with a new object reference for the same post.

  return { posts, loading }
}
