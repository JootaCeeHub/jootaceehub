import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useCountUp } from './useCountUp'

// Wrapper component that attaches the hook's ref to a real DOM element
// so IntersectionObserver.observe() actually gets called.
function Counter({ target }: { target: number }) {
  const [count, ref] = useCountUp(target)
  return <div ref={ref} data-testid="counter">{count}</div>
}

// Retrieve the most recently created mock IntersectionObserver instance.
function getLatestObserver() {
  return (global.IntersectionObserver as ReturnType<typeof vi.fn>).mock.results.at(-1)
    ?.value as {
      observe:    ReturnType<typeof vi.fn>
      disconnect: ReturnType<typeof vi.fn>
      _fire:      (entries: Partial<IntersectionObserverEntry>[]) => void
    }
}

describe('useCountUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at 0', () => {
    render(<Counter target={100} />)
    expect(screen.getByTestId('counter')).toHaveTextContent('0')
  })

  it('creates an IntersectionObserver on mount', () => {
    render(<Counter target={100} />)
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1)
  })

  it('observes the rendered element', () => {
    render(<Counter target={100} />)
    const observer = getLatestObserver()
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId('counter'))
  })

  it('does not start counting before the element is visible', () => {
    render(<Counter target={100} />)
    expect(screen.getByTestId('counter')).toHaveTextContent('0')
  })

  it('counts to the target after enough frames when the element becomes visible', () => {
    render(<Counter target={50} />)
    const observer = getLatestObserver()

    act(() => {
      observer._fire([
        { isIntersecting: true, target: screen.getByTestId('counter') },
      ])
      // jsdom implements requestAnimationFrame as setTimeout(cb, 0).
      // Advance far enough for all animation frames to complete (~180 frames).
      vi.runAllTimers()
    })

    expect(screen.getByTestId('counter')).toHaveTextContent('50')
  })

  it('does not count when entry is not intersecting', () => {
    render(<Counter target={100} />)
    const observer = getLatestObserver()

    act(() => {
      observer._fire([{ isIntersecting: false, target: screen.getByTestId('counter') }])
      vi.runAllTimers()
    })

    expect(screen.getByTestId('counter')).toHaveTextContent('0')
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<Counter target={100} />)
    const observer = getLatestObserver()
    unmount()
    expect(observer.disconnect).toHaveBeenCalled()
  })
})
