import { describe, it, expect } from 'vitest'
import {
  ALL_TAGS,
  ALL_CATEGORIES,
  ALL_SERIES,
  getTagBySlug,
  getCategoryBySlug,
  resolveTagLabels,
  resolveTagObjects,
  normaliseTagSlugs,
} from './taxonomy'

describe('ALL_TAGS', () => {
  it('loads tags from canonical JSON', () => {
    expect(ALL_TAGS.length).toBeGreaterThan(0)
  })

  it('every tag has slug, label, color, description', () => {
    for (const tag of ALL_TAGS) {
      expect(tag.slug).toBeTruthy()
      expect(tag.label).toBeTruthy()
      expect(tag.color).toMatch(/^#/)
      expect(tag.description).toBeTruthy()
    }
  })
})

describe('ALL_CATEGORIES', () => {
  it('loads categories from canonical JSON', () => {
    expect(ALL_CATEGORIES.length).toBeGreaterThan(0)
  })

  it('every category has slug and label', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(cat.slug).toBeTruthy()
      expect(cat.label).toBeTruthy()
    }
  })
})

describe('ALL_SERIES', () => {
  it('is an empty array (Phase 3 placeholder)', () => {
    expect(ALL_SERIES).toEqual([])
  })
})

describe('getTagBySlug', () => {
  it('returns a known tag', () => {
    const tag = getTagBySlug('ai')
    expect(tag).toBeDefined()
    expect(tag?.label).toBeTruthy()
  })

  it('returns undefined for unknown slug', () => {
    expect(getTagBySlug('nonexistent-xyz')).toBeUndefined()
  })
})

describe('getCategoryBySlug', () => {
  it('returns a known category', () => {
    const cat = getCategoryBySlug('article')
    expect(cat).toBeDefined()
    expect(cat?.label).toBeTruthy()
  })

  it('returns undefined for unknown slug', () => {
    expect(getCategoryBySlug('nonexistent-xyz')).toBeUndefined()
  })
})

describe('resolveTagLabels', () => {
  it('resolves known slugs to labels', () => {
    const labels = resolveTagLabels(['ai', 'typescript'])
    expect(labels).toHaveLength(2)
    expect(labels[0]).toBeTruthy()
    expect(labels[1]).toBeTruthy()
  })

  it('falls back to slug-formatted label for unknown slugs', () => {
    const labels = resolveTagLabels(['unknown-tag'])
    expect(labels[0]).toBe('unknown tag')
  })
})

describe('resolveTagObjects', () => {
  it('resolves known slugs to Tag objects', () => {
    const tags = resolveTagObjects(['ai', 'rust'])
    expect(tags).toHaveLength(2)
    expect(tags[0].color).toMatch(/^#/)
  })

  it('drops unknown slugs', () => {
    const tags = resolveTagObjects(['ai', 'unknown-xyz'])
    expect(tags).toHaveLength(1)
    expect(tags[0].slug).toBe('ai')
  })
})

describe('normaliseTagSlugs', () => {
  it('lowercases and hyphenates', () => {
    expect(normaliseTagSlugs(['AI', 'Open Source'])).toEqual(['ai', 'open-source'])
  })
})
