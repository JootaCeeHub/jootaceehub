import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { JournalPostRow } from '@/lib/supabase/types'

vi.mock('@/lib/cms/related', () => ({
  getRelatedPosts: vi.fn(),
}))

// Override the setup.ts supabase mock with a chain that matches useRelatedPosts:
// supabase.from().select().eq().neq().limit() → { data: [], error: null }
vi.mock('@/lib/supabase/client', () => {
  const chain = { data: [] as JournalPostRow[], error: null }
  const stub  = { limit: vi.fn(() => chain) }
  const eq    = { neq: vi.fn(() => stub), maybeSingle: vi.fn(async () => chain) }
  return {
    supabase: {
      from:   vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => eq) })) })),
      auth:   {
        getSession:        vi.fn(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    },
  }
})

import { useRelatedPosts } from './useRelatedPosts'
import { getRelatedPosts } from '@/lib/cms/related'

const mockGetRelatedPosts = vi.mocked(getRelatedPosts)

function makePost(overrides: Partial<JournalPostRow> = {}): JournalPostRow {
  return {
    id:         'post-1',
    slug:       'test-post',
    title:      'Test Post',
    content:    '',
    status:     'published',
    category:   'research',
    tags:       ['ai'],
    author_id:  'user-1',
    read_time:  3,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    published_at: null,
    excerpt:    null,
    cover_image: null,
    ...overrides,
  } as JournalPostRow
}

describe('useRelatedPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty posts and loading=false when current is null', () => {
    const { result } = renderHook(() => useRelatedPosts(null))
    expect(result.current.posts).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('does not call supabase when current is null', async () => {
    renderHook(() => useRelatedPosts(null))
    // Give any potential async work time to settle
    await new Promise((r) => setTimeout(r, 10))
    expect(mockGetRelatedPosts).not.toHaveBeenCalled()
  })

  it('fetches related posts when given a current post', async () => {
    const current = makePost()
    const related = [makePost({ id: 'post-2', slug: 'related-post' })]
    mockGetRelatedPosts.mockReturnValue(related)

    const { result } = renderHook(() => useRelatedPosts(current))
    // Initial loading state
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockGetRelatedPosts).toHaveBeenCalledWith(current, expect.any(Array), 3)
    expect(result.current.posts).toEqual(related)
  })

  it('respects the limit parameter', async () => {
    const current = makePost()
    mockGetRelatedPosts.mockReturnValue([])
    renderHook(() => useRelatedPosts(current, 5))

    await waitFor(() => {
      expect(mockGetRelatedPosts).toHaveBeenCalledWith(current, expect.any(Array), 5)
    })
  })

  it('returns empty posts when getRelatedPosts returns empty', async () => {
    const current = makePost()
    mockGetRelatedPosts.mockReturnValue([])

    const { result } = renderHook(() => useRelatedPosts(current))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.posts).toEqual([])
  })
})
