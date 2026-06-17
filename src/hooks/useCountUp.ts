'use client'
import { useEffect, useRef, useState } from 'react'

export function useCountUp(target: number, duration = 1.8, threshold = 0.3): [number, React.RefObject<HTMLDivElement | null>] {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        let start = 0
        const step = target / (duration * 60)
        const tick = () => {
          start += step
          if (start >= target) { setCount(target); return }
          setCount(Math.floor(start))
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, threshold])

  return [count, ref]
}
