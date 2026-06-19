import { describe, it, expect } from 'vitest'
import {
  makeCanonicalId,
  parseCanonicalId,
  isCanonicalId,
  slugify,
} from './canonical-id'

describe('makeCanonicalId', () => {
  it('produces type:slug format', () => {
    expect(makeCanonicalId('article', 'hello-world')).toBe('article:hello-world')
  })

  it('works for every content type', () => {
    const types = ['article', 'project', 'lab', 'system', 'research', 'resource'] as const
    for (const type of types) {
      expect(makeCanonicalId(type, 'test-slug')).toBe(`${type}:test-slug`)
    }
  })
})

describe('parseCanonicalId', () => {
  it('splits a well-formed ID', () => {
    expect(parseCanonicalId('article:hello-world')).toEqual({ type: 'article', slug: 'hello-world' })
  })

  it('handles slugs with multiple hyphens', () => {
    expect(parseCanonicalId('lab:aura-v2-beta')).toEqual({ type: 'lab', slug: 'aura-v2-beta' })
  })

  it('returns null when no colon present', () => {
    expect(parseCanonicalId('nocolon')).toBeNull()
  })

  it('returns null when colon is first character', () => {
    expect(parseCanonicalId(':slug')).toBeNull()
  })

  it('returns null when colon is last character', () => {
    expect(parseCanonicalId('type:')).toBeNull()
  })
})

describe('isCanonicalId', () => {
  it('accepts valid IDs', () => {
    expect(isCanonicalId('article:building-with-llms')).toBe(true)
    expect(isCanonicalId('project:jootaceehub')).toBe(true)
    expect(isCanonicalId('lab:aura')).toBe(true)
  })

  it('rejects IDs without colon', () => {
    expect(isCanonicalId('nocolon')).toBe(false)
  })

  it('rejects IDs with uppercase letters', () => {
    expect(isCanonicalId('Article:hello')).toBe(false)
    expect(isCanonicalId('article:Hello')).toBe(false)
  })

  it('rejects IDs starting with hyphen', () => {
    expect(isCanonicalId('-article:slug')).toBe(false)
    expect(isCanonicalId('article:-slug')).toBe(false)
  })
})

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips special characters', () => {
    expect(slugify('My Post! (2026)')).toBe('my-post-2026')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --my post--  ')).toBe('my-post')
  })

  it('collapses consecutive spaces and underscores', () => {
    expect(slugify('foo   bar__baz')).toBe('foo-bar-baz')
  })
})
