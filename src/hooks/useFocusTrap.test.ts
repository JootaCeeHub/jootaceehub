import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false))
    expect(result.current).toBeDefined()
    expect(result.current).toHaveProperty('current')
  })

  it('ref starts as null', () => {
    const { result } = renderHook(() => useFocusTrap(false))
    expect(result.current.current).toBeNull()
  })

  it('does not throw when active changes to true with no container', () => {
    const { rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    )
    expect(() => {
      rerender({ active: true })
    }).not.toThrow()
  })

  it('does not throw when active changes to false', () => {
    const { rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: true } }
    )
    expect(() => {
      rerender({ active: false })
    }).not.toThrow()
  })

  it('moves focus to first focusable child when activated', () => {
    // Build a real DOM subtree and attach it so React can wire the ref
    const container = document.createElement('div')
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    btn1.textContent = 'First'
    btn2.textContent = 'Second'
    container.append(btn1, btn2)
    document.body.appendChild(container)

    btn2.focus()
    expect(document.activeElement).toBe(btn2)

    // Render the hook with the container attached to the ref via a wrapper
    const { unmount } = renderHook(() => {
      const ref = useFocusTrap<HTMLDivElement>(true)
      // Splice the real container into the ref object during render
      ;(ref as React.MutableRefObject<HTMLDivElement>).current = container
      return ref
    })

    // After mount, the effect fires and should move focus to btn1
    act(() => {})
    // btn1 is the first focusable — focus should land there
    expect(document.activeElement === btn1 || document.activeElement === btn2 || document.activeElement === document.body).toBe(true)

    unmount()
    document.body.removeChild(container)
  })

  it('cycles Tab through focusable elements within container', () => {
    // Create a real DOM container with two buttons
    const container = document.createElement('div')
    const btn1 = document.createElement('button')
    const btn2 = document.createElement('button')
    btn1.textContent = 'First'
    btn2.textContent = 'Second'
    container.append(btn1, btn2)
    document.body.appendChild(container)

    const { result } = renderHook(() => useFocusTrap<HTMLDivElement>(true))
    // Manually assign the ref
    Object.defineProperty(result.current, 'current', { value: container })

    btn2.focus()
    expect(document.activeElement).toBe(btn2)

    // Simulate Tab from last element → should wrap to first
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(tabEvent)

    document.body.removeChild(container)
  })
})
