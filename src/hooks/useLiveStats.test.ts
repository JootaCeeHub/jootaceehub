import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLiveStats } from './useLiveStats'

describe('useLiveStats', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns sensible initial values', () => {
    const { result } = renderHook(() => useLiveStats())
    const { fps, cpu, memory, network, activeConnections, latency } = result.current
    expect(fps).toBeGreaterThanOrEqual(30)
    expect(cpu).toBeGreaterThanOrEqual(0)
    expect(memory).toBeGreaterThanOrEqual(0)
    expect(network).toBeGreaterThan(0)
    expect(activeConnections).toBeGreaterThanOrEqual(1)
    expect(latency).toBeGreaterThan(0)
  })

  it('updates stats after the interval fires', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useLiveStats(500))
    const initial = { ...result.current }

    // Run enough ticks that at least one value is likely to have changed
    act(() => { vi.advanceTimersByTime(500 * 10) })

    // Stats are bounded — verify they stay within defined ranges
    expect(result.current.fps).toBeGreaterThanOrEqual(30)
    expect(result.current.fps).toBeLessThanOrEqual(144)
    expect(result.current.cpu).toBeGreaterThanOrEqual(2)
    expect(result.current.cpu).toBeLessThanOrEqual(45)
    expect(result.current.memory).toBeGreaterThanOrEqual(20)
    expect(result.current.memory).toBeLessThanOrEqual(60)
    expect(result.current.latency).toBeGreaterThanOrEqual(12)
    expect(result.current.latency).toBeLessThanOrEqual(80)

    // At least one stat should have changed over 10 ticks
    const changed =
      result.current.fps       !== initial.fps       ||
      result.current.cpu       !== initial.cpu       ||
      result.current.memory    !== initial.memory    ||
      result.current.latency   !== initial.latency
    expect(changed).toBe(true)
  })

  it('clears the interval on unmount', () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = renderHook(() => useLiveStats(1000))
    unmount()
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  it('respects a custom interval', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useLiveStats(100))
    const before = result.current.cpu

    act(() => { vi.advanceTimersByTime(99) })
    // Should not have ticked yet
    expect(result.current.cpu).toBe(before)
  })
})
