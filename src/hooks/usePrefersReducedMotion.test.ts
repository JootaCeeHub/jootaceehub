import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type MatchMediaListener = (event: { matches: boolean }) => void

function mockMatchMedia(matches: boolean) {
  const listeners: MatchMediaListener[] = []
  const mql = {
    matches,
    addEventListener: vi.fn((_: string, cb: MatchMediaListener) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    dispatchChange: (newMatches: boolean) => {
      mql.matches = newMatches
      listeners.forEach((cb) => cb({ matches: newMatches }))
    },
  }
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn(() => mql),
    configurable: true,
  })
  return mql
}

describe('usePrefersReducedMotion', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when prefers-reduced-motion is not set', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('returns true when prefers-reduced-motion is set', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('updates when media query changes', () => {
    const mql = mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)

    act(() => {
      mql.dispatchChange(true)
    })
    expect(result.current).toBe(true)
  })

  it('removes event listener on unmount', () => {
    const mql = mockMatchMedia(false)
    const { unmount } = renderHook(() => usePrefersReducedMotion())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
  })
})
