import { describe, it, expect } from 'vitest'
import { FULL_SKILL_CATALOG, FULL_SKILL_COUNT } from './full-catalog'

describe('FULL_SKILL_CATALOG', () => {
  it('has over 1000 skills', () => {
    expect(FULL_SKILL_CATALOG.length).toBeGreaterThan(1000)
  })

  it('FULL_SKILL_COUNT matches array length', () => {
    expect(FULL_SKILL_COUNT).toBe(FULL_SKILL_CATALOG.length)
  })

  it('every skill has an id', () => {
    for (const skill of FULL_SKILL_CATALOG) {
      expect(skill.id).toBeTruthy()
    }
  })

  it('every skill has a category', () => {
    for (const skill of FULL_SKILL_CATALOG) {
      expect(skill.category).toBeTruthy()
    }
  })

  it('has no duplicate ids', () => {
    const ids = FULL_SKILL_CATALOG.map(s => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('includes well-known skills', () => {
    const ids = new Set(FULL_SKILL_CATALOG.map(s => s.id))
    expect(ids.has('nextjs-best-practices') || ids.has('react-best-practices')).toBe(true)
  })

  it('has diverse categories', () => {
    const cats = new Set(FULL_SKILL_CATALOG.map(s => s.category))
    expect(cats.size).toBeGreaterThan(5)
  })
})
