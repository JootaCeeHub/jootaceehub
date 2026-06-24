import { describe, it, expect } from 'vitest'
import {
  SKILL_LIBRARY,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_META,
  SKILL_RISK_META,
  searchSkills,
  getSkillsByCategory,
  getSkillById,
  SKILL_COUNT,
} from './skill-library'

describe('SKILL_LIBRARY', () => {
  it('has at least 100 curated skills', () => {
    expect(SKILL_LIBRARY.length).toBeGreaterThanOrEqual(100)
  })

  it('SKILL_COUNT matches array length', () => {
    expect(SKILL_COUNT).toBe(SKILL_LIBRARY.length)
  })

  it('has no duplicate ids', () => {
    const ids = SKILL_LIBRARY.map(s => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('every skill has required fields', () => {
    for (const skill of SKILL_LIBRARY) {
      expect(skill.id, `${skill.id} missing id`).toBeTruthy()
      expect(skill.name, `${skill.id} missing name`).toBeTruthy()
      expect(skill.description, `${skill.id} missing description`).toBeTruthy()
      expect(Array.isArray(skill.capabilities), `${skill.id} capabilities not array`).toBe(true)
      expect(Array.isArray(skill.useCases), `${skill.id} useCases not array`).toBe(true)
      expect(Array.isArray(skill.tags), `${skill.id} tags not array`).toBe(true)
      expect(SKILL_CATEGORIES).toContain(skill.category)
    }
  })

  it('every skill has at least 1 capability and 1 useCase', () => {
    for (const skill of SKILL_LIBRARY) {
      expect(skill.capabilities.length, `${skill.id} has no capabilities`).toBeGreaterThan(0)
      expect(skill.useCases.length, `${skill.id} has no useCases`).toBeGreaterThan(0)
    }
  })

  it('all categories have at least one skill', () => {
    for (const cat of SKILL_CATEGORIES) {
      const skills = getSkillsByCategory(cat)
      expect(skills.length, `Category ${cat} has no skills`).toBeGreaterThan(0)
    }
  })
})

describe('searchSkills()', () => {
  it('finds skills by name (case-insensitive)', () => {
    const results = searchSkills('nextjs')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(s => s.id === 'nextjs-best-practices')).toBe(true)
  })

  it('finds skills by tag', () => {
    const results = searchSkills('threejs')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(s => s.category === 'threejs')).toBe(true)
  })

  it('finds skills by capability content', () => {
    const results = searchSkills('tailwind')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty array for no match', () => {
    const results = searchSkills('xyznonexistentskill999')
    expect(results).toEqual([])
  })

  it('returns all skills for empty query when called directly', () => {
    // searchSkills with empty string returns all (if caller doesn't trim)
    const all = searchSkills('')
    expect(all.length).toBe(SKILL_LIBRARY.length)
  })
})

describe('getSkillsByCategory()', () => {
  it('returns only skills from the requested category', () => {
    const threejs = getSkillsByCategory('threejs')
    expect(threejs.every(s => s.category === 'threejs')).toBe(true)
    expect(threejs.length).toBeGreaterThan(0)
  })

  it('returns non-empty array for every valid category', () => {
    for (const cat of SKILL_CATEGORIES) {
      expect(getSkillsByCategory(cat).length).toBeGreaterThan(0)
    }
  })
})

describe('getSkillById()', () => {
  it('finds an existing skill by id', () => {
    const skill = getSkillById('nextjs-best-practices')
    expect(skill).toBeDefined()
    expect(skill?.id).toBe('nextjs-best-practices')
  })

  it('returns undefined for unknown id', () => {
    const skill = getSkillById('non-existent-skill-xyz')
    expect(skill).toBeUndefined()
  })
})

describe('SKILL_CATEGORY_META', () => {
  it('has a meta entry for every category', () => {
    for (const cat of SKILL_CATEGORIES) {
      expect(SKILL_CATEGORY_META[cat], `Missing meta for ${cat}`).toBeDefined()
      expect(SKILL_CATEGORY_META[cat].label).toBeTruthy()
      expect(SKILL_CATEGORY_META[cat].color).toMatch(/^#/)
      expect(SKILL_CATEGORY_META[cat].emoji).toBeTruthy()
    }
  })
})

describe('SKILL_RISK_META', () => {
  it('has meta for all risk levels', () => {
    const levels = ['safe', 'moderate', 'critical', 'unknown'] as const
    for (const level of levels) {
      expect(SKILL_RISK_META[level]).toBeDefined()
      expect(SKILL_RISK_META[level].label).toBeTruthy()
    }
  })
})

describe('jootaceeNotes coverage', () => {
  it('at least 30% of skills have stack-specific notes', () => {
    const withNotes = SKILL_LIBRARY.filter(s => s.jootaceeNotes)
    const ratio = withNotes.length / SKILL_LIBRARY.length
    expect(ratio).toBeGreaterThanOrEqual(0.3)
  })

  it('skills without notes still have valid category', () => {
    const withoutNotes = SKILL_LIBRARY.filter(s => !s.jootaceeNotes)
    for (const skill of withoutNotes) {
      expect(SKILL_CATEGORIES).toContain(skill.category)
    }
  })
})
