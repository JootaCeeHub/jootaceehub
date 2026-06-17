import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableOfContents } from './useTableOfContents'
import type { TocItem } from '@/lib/cms/toc'

const ITEMS: TocItem[] = [
  { id: 'intro',    level: 2, text: 'Intro'    },
  { id: 'details',  level: 2, text: 'Details'  },
  { id: 'summary',  level: 2, text: 'Summary'  },
]

// Helper: retrieve the most recently created mock IntersectionObserver instance.
function getMockObserver() {
  return (global.IntersectionObserver as ReturnType<typeof vi.fn>).mock.results.at(-1)
    ?.value as ReturnType<typeof global.IntersectionObserver> & {
      _fire: (entries: Partial<IntersectionObserverEntry>[]) => void
    }
}

// Create a real DOM heading element and attach it so getElementById works.
function mountHeadings(ids: string[]): HTMLElement[] {
  return ids.map((id) => {
    const existing = document.getElementById(id)
    if (existing) return existing
    const el = document.createElement('h2')
    el.id = id
    document.body.appendChild(el)
    return el
  })
}

describe('useTableOfContents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('initialises activeId to the first item', () => {
    mountHeadings(['intro', 'details', 'summary'])
    const { result } = renderHook(() => useTableOfContents(ITEMS))
    expect(result.current.activeId).toBe('intro')
  })

  it('initialises activeId to null when items is empty', () => {
    const { result } = renderHook(() => useTableOfContents([]))
    expect(result.current.activeId).toBeNull()
  })

  it('observes each heading element', () => {
    const els = mountHeadings(['intro', 'details', 'summary'])
    renderHook(() => useTableOfContents(ITEMS))
    const observer = getMockObserver()
    expect(observer.observe).toHaveBeenCalledTimes(els.length)
  })

  it('updates activeId to the first visible heading in document order', () => {
    mountHeadings(['intro', 'details', 'summary'])
    const { result } = renderHook(() => useTableOfContents(ITEMS))
    const observer = getMockObserver()

    act(() => {
      observer._fire([
        { isIntersecting: true,  target: { id: 'details' }  as Element },
        { isIntersecting: false, target: { id: 'intro' }    as Element },
      ])
    })
    expect(result.current.activeId).toBe('details')
  })

  it('keeps activeId on the first visible heading when multiple are visible', () => {
    mountHeadings(['intro', 'details', 'summary'])
    const { result } = renderHook(() => useTableOfContents(ITEMS))
    const observer = getMockObserver()

    act(() => {
      observer._fire([
        { isIntersecting: true, target: { id: 'intro' }   as Element },
        { isIntersecting: true, target: { id: 'details' } as Element },
      ])
    })
    // 'intro' is first in items order
    expect(result.current.activeId).toBe('intro')
  })

  it('scrollTo sets activeId immediately', () => {
    mountHeadings(['intro', 'details', 'summary'])
    const { result } = renderHook(() => useTableOfContents(ITEMS))
    const el = document.getElementById('details')!
    el.scrollIntoView = vi.fn()

    act(() => { result.current.scrollTo('details') })
    expect(result.current.activeId).toBe('details')
    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('scrollTo does nothing when the element does not exist', () => {
    const { result } = renderHook(() => useTableOfContents(ITEMS))
    expect(() => act(() => { result.current.scrollTo('nonexistent') })).not.toThrow()
  })

  it('disconnects the observer on unmount', () => {
    mountHeadings(['intro', 'details', 'summary'])
    const { unmount } = renderHook(() => useTableOfContents(ITEMS))
    const observer = getMockObserver()
    unmount()
    expect(observer.disconnect).toHaveBeenCalled()
  })

  it('creates a new observer when items change', () => {
    mountHeadings(['intro', 'details', 'summary', 'appendix'])
    const { rerender } = renderHook(
      ({ items }) => useTableOfContents(items),
      { initialProps: { items: ITEMS } }
    )
    const firstObserver = getMockObserver()

    const newItems: TocItem[] = [...ITEMS, { id: 'appendix', level: 2, text: 'Appendix' }]
    rerender({ items: newItems })

    expect(firstObserver.disconnect).toHaveBeenCalled()
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(2)
  })
})
