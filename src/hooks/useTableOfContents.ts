'use client'

import { useState, useEffect, useRef } from 'react'
import type { TocItem } from '@/lib/cms/toc'

export function useTableOfContents(items: TocItem[]) {
  const [activeId, setActiveId] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  )
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    // Disconnect previous observer
    observerRef.current?.disconnect()

    const headingElements = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (headingElements.length === 0) return

    // Track which headings are visible and pick the topmost
    const visibleIds = new Set<string>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleIds.add(entry.target.id)
          else visibleIds.delete(entry.target.id)
        }
        // Activate the first visible heading in document order
        for (const item of items) {
          if (visibleIds.has(item.id)) {
            setActiveId(item.id)
            break
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    for (const el of headingElements) {
      observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [items])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return { activeId, scrollTo }
}
