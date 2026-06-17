import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import type { JournalPostRow, JournalPostInsert } from '@/lib/cms/posts'

vi.mock('@/lib/supabase/context', () => ({
  useSupabaseAuth: vi.fn(),
}))

vi.mock('@/lib/cms/posts', () => ({
  listPosts:        vi.fn(),
  createPost:       vi.fn(),
  updatePost:       vi.fn(),
  publishPost:      vi.fn(),
  unpublishPost:    vi.fn(),
  deletePost:       vi.fn(),
  slugify:          vi.fn((t: string) => t.toLowerCase().replace(/\s+/g, '-')),
  estimateReadTime: vi.fn(() => 3),
}))

import { usePosts } from './usePosts'
import * as postsMod from '@/lib/cms/posts'
import { useSupabaseAuth } from '@/lib/supabase/context'

const mocked = {
  listPosts:     vi.mocked(postsMod.listPosts),
  createPost:    vi.mocked(postsMod.createPost),
  updatePost:    vi.mocked(postsMod.updatePost),
  publishPost:   vi.mocked(postsMod.publishPost),
  unpublishPost: vi.mocked(postsMod.unpublishPost),
  deletePost:    vi.mocked(postsMod.deletePost),
  auth:          vi.mocked(useSupabaseAuth),
}

const SAMPLE_POST: JournalPostRow = {
  id: 'p1', slug: 'test', title: 'Test', content: '',
  status: 'draft', category: 'research', tags: [],
  author_id: 'u1', read_time: 2,
  created_at: '2026-01-01', updated_at: '2026-01-01',
  published_at: null, excerpt: null, cover_image: null,
}

function setupAuth(userId = 'u1') {
  mocked.auth.mockReturnValue({
    user: { id: userId } as ReturnType<typeof useSupabaseAuth>['user'],
    session: null, isConfigured: true, isLoading: false,
  } as ReturnType<typeof useSupabaseAuth>)
}

describe('usePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupAuth()
    mocked.listPosts.mockResolvedValue({ posts: [SAMPLE_POST], total: 1, error: null })
  })

  it('starts loading and then returns posts', async () => {
    const { result } = renderHook(() => usePosts())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.posts).toEqual([SAMPLE_POST])
    expect(result.current.total).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('refresh increments the revision and re-fetches', async () => {
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => { result.current.refresh() })
    await waitFor(() => expect(mocked.listPosts).toHaveBeenCalledTimes(2))
  })

  it('createDraft returns null when user is not signed in', async () => {
    mocked.auth.mockReturnValue({
      user: null, session: null, isConfigured: false, isLoading: false,
    } as ReturnType<typeof useSupabaseAuth>)
    const { result } = renderHook(() => usePosts())
    const post = await result.current.createDraft('New Post', 'research')
    expect(post).toBeNull()
  })

  it('createDraft calls createPost and refreshes', async () => {
    mocked.createPost.mockResolvedValue({ post: SAMPLE_POST, error: null })
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.createDraft('New Post', 'research')
    })

    expect(mocked.createPost).toHaveBeenCalledWith(
      expect.objectContaining<Partial<JournalPostInsert>>({ title: 'New Post', status: 'draft' })
    )
    expect(mocked.listPosts).toHaveBeenCalledTimes(2)
  })

  it('savePost calls updatePost with estimated read time', async () => {
    mocked.updatePost.mockResolvedValue({ error: null })
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.savePost('p1', { content: 'body text' })
    })

    expect(mocked.updatePost).toHaveBeenCalledWith('p1', expect.objectContaining({ read_time: 3 }))
  })

  it('publish calls publishPost and refreshes', async () => {
    mocked.publishPost.mockResolvedValue({ error: null })
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ok = await act(async () => result.current.publish('p1'))
    expect(ok).toBe(true)
    expect(mocked.publishPost).toHaveBeenCalledWith('p1')
  })

  it('remove calls deletePost and refreshes', async () => {
    mocked.deletePost.mockResolvedValue({ error: null })
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const ok = await act(async () => result.current.remove('p1'))
    expect(ok).toBe(true)
    expect(mocked.deletePost).toHaveBeenCalledWith('p1')
  })

  it('sets error state when listPosts returns an error', async () => {
    mocked.listPosts.mockResolvedValue({ posts: [], total: 0, error: 'Network error' })
    const { result } = renderHook(() => usePosts())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network error')
  })
})
