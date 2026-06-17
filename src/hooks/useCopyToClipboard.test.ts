import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'

describe('useCopyToClipboard', () => {
  const mockWriteText = vi.fn()

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    })
    mockWriteText.mockResolvedValue(undefined)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initialises with copied=false', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current[0]).toBe(false)
  })

  it('sets copied=true after copy()', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      result.current[1]('hello')
    })
    expect(mockWriteText).toHaveBeenCalledWith('hello')
    expect(result.current[0]).toBe(true)
  })

  it('resets copied to false after the delay', async () => {
    const { result } = renderHook(() => useCopyToClipboard(1000))
    await act(async () => {
      result.current[1]('hello')
    })
    expect(result.current[0]).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current[0]).toBe(false)
  })

  it('clears previous timer when copy() is called again quickly', async () => {
    const { result } = renderHook(() => useCopyToClipboard(2000))
    await act(async () => { result.current[1]('first') })
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    // Still true — timer not yet done
    expect(result.current[0]).toBe(true)
    await act(async () => { result.current[1]('second') })
    await act(async () => {
      vi.advanceTimersByTime(1999)
    })
    // Still true — new 2s timer hasn't fired yet
    expect(result.current[0]).toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current[0]).toBe(false)
  })

  it('clears timer on unmount (no state update after unmount)', async () => {
    const { result, unmount } = renderHook(() => useCopyToClipboard(2000))
    await act(async () => { result.current[1]('text') })
    expect(result.current[0]).toBe(true)
    unmount()
    // Timer fires after unmount — should not throw
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow()
  })
})
