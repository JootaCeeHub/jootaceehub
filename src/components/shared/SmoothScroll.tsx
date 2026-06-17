'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out
      touchMultiplier: 1.8,
      infinite: false,
    })

    lenisRef.current = lenis

    // Capture frameId inside the loop so cancelAnimationFrame always
    // cancels the LATEST pending frame (not just the first one scheduled).
    let frameId = 0
    function raf(time: number) {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    if (typeof window !== 'undefined') {
      (window as typeof window & { lenis: Lenis }).lenis = lenis
    }

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
