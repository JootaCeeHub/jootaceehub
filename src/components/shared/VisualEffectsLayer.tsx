'use client'

import { useEffect } from 'react'
import { CustomCursor } from './CustomCursor'
import { Meteors } from './Meteors'
import { useVisualConfig } from '@/hooks/useVisualConfig'

// ─── CSS injector for body-level effects ─────────────────────────────────────

function useBodyEffect(className: string, active: boolean) {
  useEffect(() => {
    if (active) {
      document.body.classList.add(className)
    } else {
      document.body.classList.remove(className)
    }
    return () => document.body.classList.remove(className)
  }, [className, active])
}

// ─── Smooth scroll initializer ────────────────────────────────────────────────

function SmoothScrollController({ enabled, duration }: { enabled: boolean; duration: number }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Lenis is not available (SSR safe) — set CSS scroll-behavior as fallback
    const html = document.documentElement
    if (enabled) {
      html.style.scrollBehavior = 'smooth'
    } else {
      html.style.scrollBehavior = 'auto'
    }
  }, [enabled, duration])
  return null
}

// ─── Noise / Scanlines ───────────────────────────────────────────────────────

function NoiseCanvas({ intensity }: { intensity: number }) {
  // SVG-based noise filter — no canvas mutation needed
  return (
    <>
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id="fx-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        className="pointer-events-none fixed inset-0 z-[9990]"
        aria-hidden="true"
        style={{ filter: 'url(#fx-noise)', opacity: intensity * 0.4, mixBlendMode: 'overlay' }}
      />
    </>
  )
}

function ScanlinesOverlay({ intensity }: { intensity: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9989]"
      aria-hidden="true"
      style={{
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,${intensity * 2}) 2px,
          rgba(0,0,0,${intensity * 2}) 4px
        )`,
      }}
    />
  )
}

// ─── Aurora overlay ──────────────────────────────────────────────────────────

function AuroraOverlay({ intensity }: { intensity: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] animate-aurora"
      aria-hidden="true"
      style={{ opacity: intensity }}
    />
  )
}

// ─── Meteor shower (fixed overlay, hero visible) ─────────────────────────────

function MeteorLayer({ count, intensity }: { count: number; intensity: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
      style={{ opacity: intensity }}
    >
      <Meteors count={count} />
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function VisualEffectsLayer() {
  const { visualEffects: ve } = useVisualConfig()

  // Body-level CSS effects
  useBodyEffect('fx-glitch-text',    ve.glitchText.enabled)
  useBodyEffect('fx-parallax-ready', ve.parallax.enabled)

  return (
    <>
      {/* Cursor */}
      {ve.customCursor.enabled && <CustomCursor />}

      {/* Meteors */}
      {ve.meteors.enabled && (
        <MeteorLayer count={ve.meteors.count} intensity={ve.meteors.intensity} />
      )}

      {/* Aurora */}
      {ve.aurora.enabled && <AuroraOverlay intensity={ve.aurora.intensity} />}

      {/* Noise overlay */}
      {ve.noiseOverlay.enabled && <NoiseCanvas intensity={ve.noiseOverlay.intensity} />}

      {/* Scanlines */}
      {ve.scanlines.enabled && <ScanlinesOverlay intensity={ve.scanlines.intensity} />}

      {/* Smooth scroll */}
      <SmoothScrollController enabled={ve.smoothScroll.enabled} duration={(ve.smoothScroll as typeof ve.smoothScroll & { duration: number }).duration} />
    </>
  )
}
