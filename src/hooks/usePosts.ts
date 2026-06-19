'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import {
  listPosts,
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  slugify,
  estimateReadTime,
} from '@/lib/cms/posts'
import type { JournalPostRow, PostsFilter, JournalPostInsert, JournalPostUpdate } from '@/lib/cms/posts'

export interface UsePostsReturn {
  posts: JournalPostRow[]
  total: number
  loading: boolean
  error: string | null
  refresh: () => void
  createDraft: (title: string, category: JournalPostRow['category']) => Promise<JournalPostRow | null>
  savePost: (id: string, update: JournalPostUpdate) => Promise<boolean>
  publish: (id: string) => Promise<boolean>
  unpublish: (id: string) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

export function usePosts(filter: PostsFilter = {}): UsePostsReturn {
  const [posts, setPosts] = useState<JournalPostRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rev, setRev] = useState(0)

  const refresh = useCallback(() => setRev((r) => r + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listPosts(filter).then(({ posts: p, total: t, error: e }) => {
      if (cancelled) return
      setPosts(p)
      setTotal(t)
      setError(e)
      setLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, filter.status, filter.category, filter.search, filter.limit, filter.offset])

  const createDraft = useCallback(async (
    title: string,
    category: JournalPostRow['category']
  ): Promise<JournalPostRow | null> => {
    const insert: JournalPostInsert = {
      title,
      slug: slugify(title),
      category,
      content: '',
      status: 'draft',
      author_id: 'admin',
      read_time: 1,
    }
    const { post, error: e } = await createPost(insert)
    if (e) { setError(e); return null }
    refresh()
    return post
  }, [refresh])

  const savePost = useCallback(async (id: string, update: JournalPostUpdate): Promise<boolean> => {
    const content = update.content
    const payload: JournalPostUpdate = {
      ...update,
      ...(content !== undefined ? { read_time: estimateReadTime(content) } : {}),
    }
    const { error: e } = await updatePost(id, payload)
    if (e) { setError(e); return false }
    refresh()
    return true
  }, [refresh])

  const publish = useCallback(async (id: string): Promise<boolean> => {
    const { error: e } = await publishPost(id)
    if (e) { setError(e); return false }
    refresh()
    return true
  }, [refresh])

  const unpublish = useCallback(async (id: string): Promise<boolean> => {
    const { error: e } = await unpublishPost(id)
    if (e) { setError(e); return false }
    refresh()
    return true
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    const { error: e } = await deletePost(id)
    if (e) { setError(e); return false }
    refresh()
    return true
  }, [refresh])

  return { posts, total, loading, error, refresh, createDraft, savePost, publish, unpublish, remove }
}
