/**
 * Real User Monitoring (RUM)
 *
 * Collects Core Web Vitals via PerformanceObserver and reports them to:
 *   1. Plausible Analytics custom events (when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set)
 *   2. In-memory buffer accessible via getRUMSamples()
 *
 * Static-export compatible — zero server dependencies.
 * Installed once via installRUM() in HomeClient.tsx.
 */

export interface RUMSample {
  name:      'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB'
  value:     number
  rating:    'good' | 'needs-improvement' | 'poor'
  url:       string
  timestamp: string
}

// ─── Thresholds (Google Web Vitals 2024) ─────────────────────────────────────

const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP:  { good: 2500,  poor: 4000  },
  FCP:  { good: 1800,  poor: 3000  },
  CLS:  { good: 100,   poor: 250   }, // × 1000 (CLS stored as ms-equivalent)
  INP:  { good: 200,   poor: 500   },
  TTFB: { good: 800,   poor: 1800  },
}

function rate(name: string, value: number): RUMSample['rating'] {
  const t = THRESHOLDS[name]
  if (!t) return 'good'
  return value <= t.good ? 'good' : value <= t.poor ? 'needs-improvement' : 'poor'
}

// ─── In-memory sample buffer (max 50 per session) ────────────────────────────

const _samples: RUMSample[] = []

export function getRUMSamples(): readonly RUMSample[] {
  return _samples
}

function push(sample: RUMSample) {
  _samples.push(sample)
  if (_samples.length > 50) _samples.shift()
}

// ─── Plausible event reporter ─────────────────────────────────────────────────

function reportToPlausible(sample: RUMSample) {
  if (typeof window === 'undefined') return
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!domain) return

  // Plausible custom event API — fires and forgets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plausible = (window as any).plausible
  if (typeof plausible === 'function') {
    plausible('Web Vital', {
      props: {
        name:   sample.name,
        value:  Math.round(sample.value),
        rating: sample.rating,
      },
    })
  }
}

// ─── Observer bootstrap ───────────────────────────────────────────────────────

let _installed = false

/** Install RUM — idempotent, safe to call multiple times. */
export function installRUM(): void {
  if (typeof window === 'undefined' || _installed) return
  _installed = true

  // LCP — Largest Contentful Paint
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as PerformancePaintTiming & { startTime: number }
      if (!last) return
      const sample: RUMSample = {
        name:      'LCP',
        value:     last.startTime,
        rating:    rate('LCP', last.startTime),
        url:       window.location.pathname,
        timestamp: new Date().toISOString(),
      }
      push(sample)
      reportToPlausible(sample)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch { /* not supported */ }

  // FCP — First Contentful Paint
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name !== 'first-contentful-paint') continue
        const sample: RUMSample = {
          name:      'FCP',
          value:     entry.startTime,
          rating:    rate('FCP', entry.startTime),
          url:       window.location.pathname,
          timestamp: new Date().toISOString(),
        }
        push(sample)
        reportToPlausible(sample)
      }
    }).observe({ type: 'paint', buffered: true })
  } catch { /* not supported */ }

  // CLS — Cumulative Layout Shift
  try {
    let clsValue = 0
    let clsSessionValue = 0
    let sessionEntries: PerformanceEntry[] = []
    let clsTimer: ReturnType<typeof setTimeout> | null = null

    const flushCLS = () => {
      if (sessionEntries.length === 0) return
      const sample: RUMSample = {
        name:      'CLS',
        // Store as ms-equivalent (× 1000) to match threshold table
        value:     Math.round(clsSessionValue * 1000),
        rating:    rate('CLS', Math.round(clsSessionValue * 1000)),
        url:       window.location.pathname,
        timestamp: new Date().toISOString(),
      }
      push(sample)
      reportToPlausible(sample)
      sessionEntries = []
      clsSessionValue = 0
    }

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
        if (!e.hadRecentInput) {
          if (clsSessionValue + e.value > 0.05 || sessionEntries.length === 0) {
            clsValue += e.value
          }
          clsSessionValue += e.value
          sessionEntries.push(entry)
        }
      }
      if (clsTimer) clearTimeout(clsTimer)
      clsTimer = setTimeout(flushCLS, 5000)
    }).observe({ type: 'layout-shift', buffered: true })

    // Also flush on page hide
    window.addEventListener('pagehide', () => {
      if (clsTimer) clearTimeout(clsTimer)
      flushCLS()
    }, { once: true })

    // Suppress unused var lint
    void clsValue
  } catch { /* not supported */ }

  // INP — Interaction to Next Paint (Chrome 96+)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { processingStart: number; processingEnd: number; interactionId: number }
        if (!e.interactionId) continue
        const inp = e.processingEnd - e.processingStart
        const sample: RUMSample = {
          name:      'INP',
          value:     inp,
          rating:    rate('INP', inp),
          url:       window.location.pathname,
          timestamp: new Date().toISOString(),
        }
        push(sample)
        reportToPlausible(sample)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).observe({ type: 'event', ...(({ durationThreshold: 40, buffered: true }) as any) })
  } catch { /* not supported */ }

  // TTFB — Time to First Byte
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart
      const sample: RUMSample = {
        name:      'TTFB',
        value:     ttfb,
        rating:    rate('TTFB', ttfb),
        url:       window.location.pathname,
        timestamp: new Date().toISOString(),
      }
      push(sample)
      reportToPlausible(sample)
    }
  } catch { /* not supported */ }
}
