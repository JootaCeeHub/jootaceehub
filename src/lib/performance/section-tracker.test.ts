import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  recordSectionRender,
  recordSectionVisible,
  getSectionPerfEntries,
  clearSectionPerf,
} from './section-tracker'

// ─── localStorage mock (jsdom may not expose it as a bare global) ──────────────

const _store: Record<string, string> = {}
const mockStorage: Storage = {
  getItem:    (k: string) => _store[k] ?? null,
  setItem:    (k: string, v: string) => { _store[k] = v },
  removeItem: (k: string) => { delete _store[k] },
  clear:      () => { for (const k in _store) delete _store[k] },
  get length()  { return Object.keys(_store).length },
  key:        (i: number) => Object.keys(_store)[i] ?? null,
}

beforeEach(() => {
  mockStorage.clear()
  Object.defineProperty(globalThis, 'localStorage', {
    value:       mockStorage,
    writable:    true,
    configurable: true,
  })
  // Stub performance.getEntriesByName (jsdom returns empty array by default)
  vi.spyOn(performance, 'getEntriesByName').mockReturnValue([])
})

afterEach(() => {
  mockStorage.clear()
  vi.restoreAllMocks()
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('recordSectionRender()', () => {
  it('stores a render entry in localStorage', () => {
    recordSectionRender('hero', 1200)
    const entries = getSectionPerfEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0].name).toBe('hero')
    expect(entries[0].renderMs).toBe(1200)
  })

  it('rounds fractional ms values', () => {
    recordSectionRender('systems', 1234.789)
    const [e] = getSectionPerfEntries()
    expect(e.renderMs).toBe(1235)
  })

  it('initialises visibleMs as null', () => {
    recordSectionRender('labs', 800)
    expect(getSectionPerfEntries()[0].visibleMs).toBeNull()
  })

  it('preserves existing visibleMs when render is re-recorded', () => {
    recordSectionRender('hero', 500)
    recordSectionVisible('hero', 900)
    // Re-record render (e.g. StrictMode double-invoke)
    recordSectionRender('hero', 505)
    const [e] = getSectionPerfEntries()
    expect(e.visibleMs).toBe(900)
  })

  it('assigns the correct budget for known sections', () => {
    recordSectionRender('hero', 100)
    expect(getSectionPerfEntries()[0].budget).toBe(2500)
    recordSectionRender('labs', 100)
    const labs = getSectionPerfEntries().find(e => e.name === 'labs')
    expect(labs?.budget).toBe(4000)
  })

  it('assigns status good when render is fast', () => {
    recordSectionRender('hero', 1000) // well under 2500ms budget
    expect(getSectionPerfEntries()[0].status).toBe('good')
  })

  it('assigns status poor when render is slow', () => {
    recordSectionRender('hero', 3000) // above 2500ms hero budget
    expect(getSectionPerfEntries()[0].status).toBe('poor')
  })
})

describe('recordSectionVisible()', () => {
  it('updates visibleMs for an existing entry', () => {
    recordSectionRender('systems', 2000)
    recordSectionVisible('systems', 2500)
    const [e] = getSectionPerfEntries()
    expect(e.visibleMs).toBe(2500)
  })

  it('is a no-op when no render entry exists', () => {
    recordSectionVisible('ghost', 1000)
    expect(getSectionPerfEntries()).toHaveLength(0)
  })

  it('updates status based on visible time', () => {
    recordSectionRender('hero', 100)
    recordSectionVisible('hero', 4500) // > 2500ms hero budget → poor
    expect(getSectionPerfEntries()[0].status).toBe('poor')
  })
})

describe('getSectionPerfEntries()', () => {
  it('returns entries sorted by renderMs ascending', () => {
    recordSectionRender('labs', 3000)
    recordSectionRender('hero', 500)
    recordSectionRender('systems', 2000)
    const entries = getSectionPerfEntries()
    expect(entries.map(e => e.name)).toEqual(['hero', 'systems', 'labs'])
  })

  it('returns empty array when localStorage is empty', () => {
    expect(getSectionPerfEntries()).toHaveLength(0)
  })

  it('handles corrupted localStorage gracefully', () => {
    mockStorage.setItem('jc-section-perf-v2', 'not-json{{{')
    expect(() => getSectionPerfEntries()).not.toThrow()
    expect(getSectionPerfEntries()).toHaveLength(0)
  })
})

describe('clearSectionPerf()', () => {
  it('removes all stored entries', () => {
    recordSectionRender('hero', 100)
    recordSectionRender('labs', 200)
    clearSectionPerf()
    expect(getSectionPerfEntries()).toHaveLength(0)
  })

  it('is idempotent on empty storage', () => {
    expect(() => clearSectionPerf()).not.toThrow()
  })
})
