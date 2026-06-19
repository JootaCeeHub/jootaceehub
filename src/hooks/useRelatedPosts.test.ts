import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { JournalPostRow } from '@/lib/cms/posts'

vi.mock('@/lib/cms/related', () => ({
  getRelatedPosts: vi.fn(),
}))

import { useRelatedPosts } from './useRelatedPosts'
import { getRelatedPosts } from '@/lib/cms/related'

const mockGetRelatedPosts = vi.mocked(getRelatedPosts)

function makePost(overrides: Partial<JournalPostRow> = {}): JournalPostRow {
  return {
    id:           'post-1',
    slug:         'test-post',
    title:        'Test Post',
    content:      '',
    status:       'published',
    category:     'research',
    tags:         ['ai'],
    author_id:    'admin',
    read_time:    3,
    created_at:   '2026-01-01T00:00:00Z',
    updated_at:   '2026-01-01T00:00:00Z',
    published_at: null,
    excerpt:      null,
    cover_image_url: null,
    ...overrides,
  }
}

describe('useRelatedPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetRelatedPosts.mockReturnValue([])
  })

  it('returns empty posts and loading=false when current is null', () => {
    const { result } = renderHook(() => useRelatedPosts(null))
    expect(result.current.posts).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('does not call getRelatedPosts when current is null', () => {
    renderHook(() => useRelatedPosts(null))
    expect(mockGetRelatedPosts).not.toHaveBeenCalled()
  })

  it('derives related posts synchronously from candidates', () => {
    const current = makePost()
    const candidate = makePost({ id: 'post-2', slug: 'candidate' })
    const related = [candidate]
    mockGetRelatedPosts.mockReturnValue(related)

    const { result } = renderHook(() => useRelatedPosts(current, [candidate]))
    expect(result.current.loading).toBe(false)
    expect(mockGetRelatedPosts).toHaveBeenCalledWith(current, [candidate], 3)
    expect(result.current.posts).toEqual(related)
  })

  it('respects the limit parameter', () => {
    const current = makePost()
    mockGetRelatedPosts.mockReturnValue([])
    renderHook(() => useRelatedPosts(current, [], 5))
    expect(mockGetRelatedPosts).toHaveBeenCalledWith(current, [], 5)
  })

  it('returns empty posts when getRelatedPosts returns empty', () => {
    const current = makePost()
    mockGetRelatedPosts.mockReturnValue([])

    const { result } = renderHook(() => useRelatedPosts(current, []))
    expect(result.current.posts).toEqual([])
  })
})
