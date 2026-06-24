import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePerfTier } from './usePerfTier'

// jsdom doesn't implement matchMedia — provide a minimal stub
function setupMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('usePerfTier', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setupMatchMedia(false)
    vi.restoreAllMocks()
    setupMatchMedia(false)
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('eventually has a ready state (true or false) after hook initializes', async () => {
    const { result } = renderHook(() => usePerfTier())
    // ready starts false; after effects, becomes true
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    // After mount, ready is always boolean
    expect(typeof result.current.ready).toBe('boolean')
  })

  it('sets ready: true after mount', async () => {
    const { result } = renderHook(() => usePerfTier())
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    expect(result.current.ready).toBe(true)
  })

  it('returns a valid tier (low | medium | high)', async () => {
    const { result } = renderHook(() => usePerfTier())
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    expect(['low', 'medium', 'high']).toContain(result.current.tier)
  })

  it('caches result in sessionStorage after first detection', async () => {
    renderHook(() => usePerfTier())
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    const raw = sessionStorage.getItem('perf-tier')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.result).toBeDefined()
    expect(parsed.ts).toBeTypeOf('number')
  })

  it('reads from cache on second render without calling matchMedia again', async () => {
    // First render — writes cache
    const { unmount } = renderHook(() => usePerfTier())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    unmount()

    // Reset call count
    const spy = vi.fn((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    Object.defineProperty(window, 'matchMedia', { writable: true, value: spy })

    renderHook(() => usePerfTier())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    // Cache was written — matchMedia should NOT be called again
    expect(spy).not.toHaveBeenCalled()
  })

  it('returns boolean for isMobile and prefersReducedMotion', async () => {
    const { result } = renderHook(() => usePerfTier())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(result.current.isMobile).toBeTypeOf('boolean')
    expect(result.current.prefersReducedMotion).toBeTypeOf('boolean')
  })
})
