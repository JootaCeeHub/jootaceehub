'use client'

import { useRef } from 'react'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(73,183,255,0.08)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
    card.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={cardRef}
      className={`spotlight-card relative transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          '--spotlight-color': spotlightColor,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
