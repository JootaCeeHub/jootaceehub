import { describe, it, expect } from 'vitest'
import { createInitialState } from './state'
import { AdminStateSchema } from './schema'

describe('createInitialState()', () => {
  it('returns an object', () => {
    const state = createInitialState()
    expect(state).toBeDefined()
    expect(typeof state).toBe('object')
  })

  it('has required top-level keys', () => {
    const state = createInitialState()
    expect(state).toHaveProperty('site')
    expect(state).toHaveProperty('seo')
    expect(state).toHaveProperty('design')
    expect(state).toHaveProperty('panel')
  })

  it('site config has a name field', () => {
    const state = createInitialState()
    expect(typeof state.site.name).toBe('string')
    expect(state.site.name.length).toBeGreaterThan(0)
  })

  it('seo config has title and description', () => {
    const state = createInitialState()
    expect(typeof state.seo.defaultTitle).toBe('string')
    expect(typeof state.seo.defaultDescription).toBe('string')
  })

  it('produces consistent output on repeated calls (no random IDs)', () => {
    const a = createInitialState()
    const b = createInitialState()
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('AdminStateSchema partial validation', () => {
  it('validates an empty object as partial (all optional)', () => {
    const result = AdminStateSchema.partial().safeParse({})
    expect(result.success).toBe(true)
  })

  it('validates partial schema object without site (omitting required fields)', () => {
    const result = AdminStateSchema.partial().safeParse({ panel: 'dashboard' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid site config type (string instead of object)', () => {
    const result = AdminStateSchema.partial().safeParse({ site: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('validates valid panel value', () => {
    const result = AdminStateSchema.partial().safeParse({ panel: 'command' })
    expect(result.success).toBe(true)
  })
})
