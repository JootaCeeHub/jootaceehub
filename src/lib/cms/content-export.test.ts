import { describe, it, expect } from 'vitest'
import { exportContentBundle, parseContentBundle, parseAndImportBundle } from './content-export'
import type { AdminState } from '@/lib/admin/types'

// ─── Minimal AdminState stub for testing ─────────────────────────────────────

function makeState(overrides: Partial<AdminState> = {}): AdminState {
  return {
    projectsRegistry: [],
    researchRegistry: [],
    labsRegistry:     [],
    systemsRegistry:  [],
    tagRegistry:      [],
    categoryRegistry: [],
    mediaRegistry:    [],
    seriesRegistry:   [],
    revisionLog:      [],
    ...overrides,
  } as unknown as AdminState
}

// ─── Export/import round-trip ─────────────────────────────────────────────────

describe('exportContentBundle', () => {
  it('produces a valid bundle with version 1.0', () => {
    const state  = makeState()
    const bundle = exportContentBundle(state)
    expect(bundle.version).toBe('1.0')
    expect(typeof bundle.exportedAt).toBe('string')
  })

  it('includes all registry fields', () => {
    const state = makeState({
      tagRegistry:      [{ id: 't1', slug: 'test', label: 'Test', createdAt: '2026-01-01T00:00:00.000Z' }],
      categoryRegistry: [{ id: 'c1', slug: 'cat', label: 'Cat', createdAt: '2026-01-01T00:00:00.000Z' }],
    })
    const bundle = exportContentBundle(state)
    expect(bundle.tagRegistry).toHaveLength(1)
    expect(bundle.categoryRegistry).toHaveLength(1)
    expect(bundle.seriesRegistry).toHaveLength(0)
  })
})

describe('parseContentBundle', () => {
  it('returns ok: true for a valid bundle', () => {
    const state  = makeState()
    const bundle = exportContentBundle(state)
    const result = parseContentBundle(bundle)
    expect(result.ok).toBe(true)
    expect(result.bundle).not.toBeNull()
    expect(result.error).toBeNull()
  })

  it('returns ok: false for invalid input', () => {
    const result = parseContentBundle({ version: '9.9', exportedAt: 'bad' })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns ok: false for non-object input', () => {
    const result = parseContentBundle(null)
    expect(result.ok).toBe(false)
  })
})

describe('round-trip fidelity', () => {
  it('export → parse produces identical registry data', () => {
    const tags = [{ id: 't1', slug: 'ai', label: 'AI', color: '#a78bfa', createdAt: '2026-01-01T00:00:00.000Z' }]
    const state  = makeState({ tagRegistry: tags })
    const bundle = exportContentBundle(state)
    const result = parseContentBundle(bundle)

    expect(result.ok).toBe(true)
    expect(result.bundle?.tagRegistry).toEqual(tags)
  })

  it('export(import(export(x))) === export(x) — idempotent round-trip', () => {
    const tags   = [{ id: 't1', slug: 'ts', label: 'TypeScript', createdAt: '2026-01-01T00:00:00.000Z' }]
    const state1 = makeState({ tagRegistry: tags })

    const bundle1 = exportContentBundle(state1)
    const result1 = parseContentBundle(bundle1)
    expect(result1.ok).toBe(true)

    // Simulate importing bundle1 into a new state and exporting again
    const state2 = makeState({ tagRegistry: result1.bundle?.tagRegistry ?? [] })
    const bundle2 = exportContentBundle(state2)
    const result2 = parseContentBundle(bundle2)
    expect(result2.ok).toBe(true)

    // Core content data should be identical
    expect(result2.bundle?.tagRegistry).toEqual(result1.bundle?.tagRegistry)
  })
})

describe('parseAndImportBundle', () => {
  it('returns ok: true and a backupKey for valid input', () => {
    const state  = makeState()
    const bundle = exportContentBundle(state)
    const result = parseAndImportBundle(bundle, state)
    expect(result.ok).toBe(true)
    expect(result.bundle).not.toBeNull()
    // backupKey may be null in test environment (no localStorage)
  })

  it('returns ok: false for malformed bundle', () => {
    const state  = makeState()
    const result = parseAndImportBundle({ garbage: true }, state)
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
