'use client'

import { useState } from 'react'

interface GlitchTextProps {
  children: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
}

export function GlitchText({ children, className = '', tag: Tag = 'span' }: GlitchTextProps) {
  const [active, setActive] = useState(false)

  return (
    <Tag
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {children}
      {active && (
        <>
          <span
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              color: 'var(--systems-accent)',
              animation: 'glitch-x 0.4s steps(2) infinite',
            }}
          >
            {children}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              color: 'var(--labs-accent)',
              animation: 'glitch-y 0.4s steps(2) 0.1s infinite',
            }}
          >
            {children}
          </span>
        </>
      )}
    </Tag>
  )
}
