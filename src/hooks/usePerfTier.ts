'use client'

import { startTransition, useEffect, useState } from 'react'

export type PerfTier = 'low' | 'medium' | 'high'

export interface PerfTierResult {
  tier:                PerfTier
  isMobile:            boolean
  prefersReducedMotion: boolean
  /** True once the hook has measured — avoids SSR/hydration mismatches */
  ready:               boolean
}

const STORAGE_KEY = 'perf-tier'
const CACHE_TTL   = 30 * 60 * 1000 // 30 minutes

function detectTier(): PerfTierResult {
  if (typeof window === 'undefined') {
    return { tier: 'high', isMobile: false, prefersReducedMotion: false, ready: false }
  }

  const isMobile            = window.innerWidth < 768
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Low-end signals (avoid userAgent — use measurable capabilities)
  const lowCores    = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2
  const slowNet     = 'connection' in navigator && ['slow-2g', '2g', '3g'].includes((navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType ?? '')
  const saveData    = 'connection' in navigator && Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData)
  const lowMemory   = 'deviceMemory' in navigator && (navigator as { deviceMemory?: number }).deviceMemory !== undefined && ((navigator as { deviceMemory: number }).deviceMemory) <= 1

  const lowSignals  = [lowCores, slowNet, saveData, lowMemory, prefersReducedMotion].filter(Boolean).length

  const tier: PerfTier =
    lowSignals >= 2 || saveData || prefersReducedMotion
      ? 'low'
      : lowSignals >= 1 || isMobile
        ? 'medium'
        : 'high'

  return { tier, isMobile, prefersReducedMotion, ready: true }
}

/** Reads cached tier from sessionStorage; null if missing or expired */
function readCache(): PerfTierResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { result, ts } = JSON.parse(raw) as { result: PerfTierResult; ts: number }
    if (Date.now() - ts > CACHE_TTL) return null
    return result
  } catch {
    return null
  }
}

function writeCache(result: PerfTierResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ result, ts: Date.now() }))
  } catch { /**/ }
}

/**
 * Returns the device performance tier for the current session.
 * `ready: false` during SSR / first render — always check before using tier.
 *
 * Tier is cached in sessionStorage for 30 minutes to avoid re-detection on
 * every route change. The cache is session-scoped (not persisted across tabs).
 */
export function usePerfTier(): PerfTierResult {
  const [result, setResult] = useState<PerfTierResult>({
    tier: 'high', isMobile: false, prefersReducedMotion: false, ready: false,
  })

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      startTransition(() => setResult(cached))
      return
    }
    const detected = detectTier()
    writeCache(detected)
    startTransition(() => setResult(detected))
  }, [])

  return result
}
