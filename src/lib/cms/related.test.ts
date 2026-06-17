import { describe, it, expect } from 'vitest'
import { scoreRelatedPosts, getRelatedPosts } from './related'
import type { JournalPostRow } from './posts'

function makePost(overrides: Partial<JournalPostRow> = {}): JournalPostRow {
  return {
    id: 'test-id',
    slug: 'test-slug',
    title: 'Test Post',
    content: '',
    excerpt: null,
    category: 'essays',
    tags: [],
    status: 'published',
    author_id: 'user-1',
    cover_image_url: null,
    read_time: 5,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('scoreRelatedPosts', () => {
  it('scores higher for shared tags', () => {
    const current = makePost({ tags: ['ai', 'agents'] })
    const same    = makePost({ id: 'b', slug: 'b', tags: ['ai', 'agents'] })
    const diff    = makePost({ id: 'c', slug: 'c', tags: ['cooking'] })

    const scored = scoreRelatedPosts(current, [same, diff])
    const sameScore = scored.find((s) => s.post.id === 'b')!.score
    const diffScore = scored.find((s) => s.post.id === 'c')!.score
    expect(sameScore).toBeGreaterThan(diffScore)
  })

  it('scores higher for same category', () => {
    const current = makePost({ category: 'research' })
    const samecat = makePost({ id: 'b', slug: 'b', category: 'research', tags: [] })
    const diffcat = makePost({ id: 'c', slug: 'c', category: 'opinion',  tags: [] })

    const scored = scoreRelatedPosts(current, [samecat, diffcat])
    const sameCatScore = scored.find((s) => s.post.id === 'b')!.score
    const diffCatScore = scored.find((s) => s.post.id === 'c')!.score
    expect(sameCatScore).toBeGreaterThan(diffCatScore)
  })

  it('excludes the current post itself', () => {
    const current = makePost({ id: 'current' })
    const scored = scoreRelatedPosts(current, [current])
    expect(scored).toHaveLength(0)
  })

  it('returns empty array when candidates list is empty', () => {
    const current = makePost()
    expect(scoreRelatedPosts(current, [])).toEqual([])
  })
})

describe('getRelatedPosts', () => {
  it('returns at most `limit` posts', () => {
    const current = makePost({ tags: ['ai'] })
    const candidates = Array.from({ length: 10 }, (_, i) =>
      makePost({ id: `post-${i}`, slug: `slug-${i}`, tags: ['ai'] })
    )
    const result = getRelatedPosts(current, candidates, 3)
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('returns posts sorted by score descending', () => {
    const current = makePost({ tags: ['a', 'b', 'c'], category: 'research' })
    const highScore = makePost({ id: 'h', slug: 'h', tags: ['a', 'b', 'c'], category: 'research' })
    const lowScore  = makePost({ id: 'l', slug: 'l', tags: [],             category: 'opinion'  })

    const result = getRelatedPosts(current, [lowScore, highScore], 5)
    expect(result[0].id).toBe('h')
  })

  it('returns empty array when only post is itself', () => {
    const current = makePost({ id: 'only', slug: 'only' })
    expect(getRelatedPosts(current, [current], 3)).toHaveLength(0)
  })
})
