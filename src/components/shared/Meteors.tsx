'use client'

import { useEffect, useRef } from 'react'

interface MeteorsProps {
  count?: number
  className?: string
}

export function Meteors({ count = 16, className }: MeteorsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const meteors: HTMLSpanElement[] = []

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span')
      el.className = 'meteor'
      const top  = Math.random() * 100
      const left = Math.random() * 100
      const delay = Math.random() * 12
      const dur   = 3 + Math.random() * 6
      const size  = 60 + Math.random() * 80

      el.style.cssText = `
        top: ${top}%;
        left: ${left}%;
        width: 2px;
        height: ${size}px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
        opacity: 0;
      `
      container.appendChild(el)
      meteors.push(el)
    }

    return () => {
      meteors.forEach((m) => m.remove())
    }
  }, [count])

  return <div ref={containerRef} className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true" />
}
