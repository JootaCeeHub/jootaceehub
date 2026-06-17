'use client'

import { useRef, useState, useEffect } from 'react'

interface LazySectionProps {
  children: React.ReactNode
  /** IntersectionObserver rootMargin — how far before viewport entry to start loading.
   *  Default 400px gives time for chunk download + parse before visible. */
  rootMargin?: string
  /** Minimum height of placeholder while section hasn't loaded.
   *  Prevents layout jump when section renders. */
  minHeight?: string
  id?: string
  className?: string
}

/**
 * Defers rendering children (and their dynamic import chunk downloads)
 * until the section approaches the viewport via IntersectionObserver.
 *
 * Why this matters: next/dynamic chunks download when the component *renders*,
 * not at import() declaration time. Wrapping sections here ensures
 * SystemsPreview, LabsPreview, etc. chunks are never downloaded until needed,
 * reducing initial parse cost and TBT on first load.
 */
export function LazySection({
  children,
  rootMargin = '400px 0px',
  minHeight = '200px',
  id,
  className,
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    // Already visible on first render (e.g. tall viewport, sections already in view)
    if (el.getBoundingClientRect().top < window.innerHeight + 400) {
      setShouldRender(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div
      ref={sentinelRef}
      id={id}
      className={className}
      style={!shouldRender ? { minHeight } : undefined}
    >
      {shouldRender ? (
        children
      ) : (
        <div className="w-full animate-pulse rounded-lg bg-muted/10" style={{ minHeight }} aria-hidden="true" />
      )}
    </div>
  )
}
