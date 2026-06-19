import { describe, it, expect } from 'vitest'
import { applyContentFilter } from './repository'
import type { ContentItem } from './types'

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id:          overrides.id          ?? 'article:test-slug',
    type:        overrides.type        ?? 'article',
    title:       overrides.title       ?? 'Test Article',
    slug:        overrides.slug        ?? 'test-slug',
    description: overrides.description ?? 'A test article',
    status:      overrides.status      ?? 'published',
    locale:      overrides.locale      ?? 'en',
    tags:        overrides.tags        ?? ['ai'],
    publishedAt: overrides.publishedAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt:   overrides.updatedAt   ?? '2026-01-01T00:00:00.000Z',
    featured:    overrides.featured    ?? false,
  }
}

const ITEMS: ContentItem[] = [
  makeItem({ slug: 'a', type: 'article', status: 'published', locale: 'en',  tags: ['ai'],           featured: true  }),
  makeItem({ slug: 'b', type: 'project', status: 'draft',     locale: 'en',  tags: ['typescript'],   featured: false }),
  makeItem({ slug: 'c', type: 'lab',     status: 'published', locale: 'es',  tags: ['ai', 'rust'],   featured: false }),
  makeItem({ slug: 'd', type: 'article', status: 'published', locale: 'en',  tags: ['architecture'], featured: false }),
  makeItem({ slug: 'e', type: 'system',  status: 'archived',  locale: 'en',  tags: ['ai'],           featured: false }),
]

describe('applyContentFilter — no filter', () => {
  it('returns all items when filter is undefined', () => {
    expect(applyContentFilter(ITEMS, undefined)).toHaveLength(5)
  })
})

describe('applyContentFilter — type', () => {
  it('filters by single type', () => {
    const result = applyContentFilter(ITEMS, { type: 'article' })
    expect(result).toHaveLength(2)
    expect(result.every(i => i.type === 'article')).toBe(true)
  })

  it('filters by multiple types', () => {
    const result = applyContentFilter(ITEMS, { type: ['article', 'lab'] })
    expect(result).toHaveLength(3)
  })
})

describe('applyContentFilter — status', () => {
  it('returns only published items', () => {
    const result = applyContentFilter(ITEMS, { status: 'published' })
    expect(result).toHaveLength(3)
    expect(result.every(i => i.status === 'published')).toBe(true)
  })

  it('returns only draft items', () => {
    const result = applyContentFilter(ITEMS, { status: 'draft' })
    expect(result).toHaveLength(1)
  })
})

describe('applyContentFilter — locale', () => {
  it('filters by locale', () => {
    const result = applyContentFilter(ITEMS, { locale: 'es' })
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('c')
  })
})

describe('applyContentFilter — featured', () => {
  it('returns only featured items', () => {
    const result = applyContentFilter(ITEMS, { featured: true })
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('a')
  })

  it('returns only non-featured items', () => {
    const result = applyContentFilter(ITEMS, { featured: false })
    expect(result).toHaveLength(4)
  })
})

describe('applyContentFilter — tags', () => {
  it('returns items that have any of the specified tags', () => {
    const result = applyContentFilter(ITEMS, { tags: ['ai'] })
    expect(result).toHaveLength(3)
  })

  it('matches if item has at least one of multiple tags', () => {
    const result = applyContentFilter(ITEMS, { tags: ['typescript', 'architecture'] })
    expect(result).toHaveLength(2)
  })
})

describe('applyContentFilter — pagination', () => {
  it('applies limit', () => {
    const result = applyContentFilter(ITEMS, { limit: 2 })
    expect(result).toHaveLength(2)
  })

  it('applies offset', () => {
    const result = applyContentFilter(ITEMS, { offset: 3 })
    expect(result).toHaveLength(2)
  })

  it('applies limit after offset', () => {
    const result = applyContentFilter(ITEMS, { offset: 1, limit: 2 })
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe('b')
  })
})

describe('applyContentFilter — combined', () => {
  it('combines type + status + locale', () => {
    const result = applyContentFilter(ITEMS, { type: 'article', status: 'published', locale: 'en' })
    expect(result).toHaveLength(2)
  })

  it('returns empty array when no items match', () => {
    const result = applyContentFilter(ITEMS, { type: 'research' })
    expect(result).toHaveLength(0)
  })
})
