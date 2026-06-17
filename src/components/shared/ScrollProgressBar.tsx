'use client'

import { useEffect, useState } from 'react'

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      const pct = total > 0 ? scrolled / total : 0
      setProgress(pct * 100)
      setVisible(pct > 0.02)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 8px var(--primary), 0 0 16px var(--primary)',
        }}
      />
    </div>
  )
}
