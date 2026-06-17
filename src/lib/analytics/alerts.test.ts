import { describe, it, expect } from 'vitest'
import { evaluateAlerts, alertsCount } from './alerts'

// ─── alertsCount ──────────────────────────────────────────────────────────────

describe('alertsCount', () => {
  it('counts each severity correctly', () => {
    const alerts = [
      { id: 'a', severity: 'critical' as const, category: 'X', message: '' },
      { id: 'b', severity: 'critical' as const, category: 'X', message: '' },
      { id: 'c', severity: 'warning'  as const, category: 'X', message: '' },
      { id: 'd', severity: 'info'     as const, category: 'X', message: '' },
    ]
    const result = alertsCount(alerts)
    expect(result).toEqual({ critical: 2, warning: 1, info: 1, total: 4 })
  })

  it('returns all zeros for empty array', () => {
    expect(alertsCount([])).toEqual({ critical: 0, warning: 0, info: 0, total: 0 })
  })
})

// ─── evaluateAlerts — no false positives in quiet state ───────────────────────

describe('evaluateAlerts — quiet state produces no alerts', () => {
  it('returns no alerts when all inputs are at healthy defaults', () => {
    const result = evaluateAlerts({
      liveVitals: { LCP: 1500, CLS: 50, INP: 100, FCP: 800 },
      longTaskCount: 0, longTaskTotalMs: 0,
      sessionTaskCount: 0, sessionTaskMs: 0,
      errors: [],
      feedTotal: 0, feedConnected: 0,
    })
    expect(result).toHaveLength(0)
  })
})

// ─── LCP ─────────────────────────────────────────────────────────────────────

describe('evaluateAlerts — LCP', () => {
  it('fires critical when LCP > 4000ms', () => {
    const alerts = evaluateAlerts({ liveVitals: { LCP: 5000 } })
    expect(alerts.some(a => a.id === 'lcp-poor' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning when LCP is 2500–4000ms', () => {
    const alerts = evaluateAlerts({ liveVitals: { LCP: 3000 } })
    expect(alerts.some(a => a.id === 'lcp-improve' && a.severity === 'warning')).toBe(true)
  })

  it('fires no LCP alert when LCP <= 2500ms', () => {
    const alerts = evaluateAlerts({ liveVitals: { LCP: 2400 } })
    expect(alerts.some(a => a.id.startsWith('lcp'))).toBe(false)
  })
})

// ─── INP ─────────────────────────────────────────────────────────────────────

describe('evaluateAlerts — INP', () => {
  it('fires critical for public context (> 500ms)', () => {
    const alerts = evaluateAlerts({ liveVitals: { INP: 600 }, isAdminContext: false })
    expect(alerts.some(a => a.id === 'inp-poor' && a.severity === 'critical')).toBe(true)
  })

  it('does NOT fire critical for admin context at 600ms (relaxed to 1000ms)', () => {
    const alerts = evaluateAlerts({ liveVitals: { INP: 600 }, isAdminContext: true })
    expect(alerts.some(a => a.id === 'inp-poor' && a.severity === 'critical')).toBe(false)
  })

  it('fires critical for admin context when INP > 1000ms', () => {
    const alerts = evaluateAlerts({ liveVitals: { INP: 1200 }, isAdminContext: true })
    expect(alerts.some(a => a.id === 'inp-poor' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning for admin context between 500ms and 1000ms', () => {
    const alerts = evaluateAlerts({ liveVitals: { INP: 700 }, isAdminContext: true })
    expect(alerts.some(a => a.id === 'inp-warn' && a.severity === 'warning')).toBe(true)
  })
})

// ─── CLS ─────────────────────────────────────────────────────────────────────

describe('evaluateAlerts — CLS', () => {
  it('fires critical when CLS > 0.25 (raw > 250)', () => {
    const alerts = evaluateAlerts({ liveVitals: { CLS: 300 } })
    expect(alerts.some(a => a.id === 'cls-poor' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning when CLS is 0.1–0.25 (raw 100–250)', () => {
    const alerts = evaluateAlerts({ liveVitals: { CLS: 150 } })
    expect(alerts.some(a => a.id === 'cls-improve' && a.severity === 'warning')).toBe(true)
  })

  it('fires no CLS alert when CLS <= 0.1 (raw <= 100)', () => {
    const alerts = evaluateAlerts({ liveVitals: { CLS: 80 } })
    expect(alerts.some(a => a.id.startsWith('cls'))).toBe(false)
  })
})

// ─── TTFB ─────────────────────────────────────────────────────────────────────

describe('evaluateAlerts — TTFB', () => {
  it('fires warning when TTFB > 1800ms', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: 2000, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: null, jsHeapTotal: null, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'ttfb-slow')).toBe(true)
  })

  it('does NOT fire TTFB alert when value is null (dev-server cap)', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: null, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: null, jsHeapTotal: null, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'ttfb-slow')).toBe(false)
  })

  it('does NOT fire TTFB alert when TTFB is within good range', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: 400, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: null, jsHeapTotal: null, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'ttfb-slow')).toBe(false)
  })
})

// ─── JS Heap ─────────────────────────────────────────────────────────────────

describe('evaluateAlerts — JS heap', () => {
  it('fires critical when heap > 90% and total >= 64MB', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: null, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: 61, jsHeapTotal: 64, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'heap-critical' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning when heap 70–90% and total >= 64MB', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: null, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: 48, jsHeapTotal: 64, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'heap-warn' && a.severity === 'warning')).toBe(true)
  })

  it('does NOT fire critical for small Chrome initial heap (35/36MB)', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: null, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: 35, jsHeapTotal: 36, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'heap-critical')).toBe(false)
  })

  it('fires info for small heap filling initial allocation', () => {
    const alerts = evaluateAlerts({
      navMetrics: { ttfb: null, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: 35, jsHeapTotal: 36, timestamp: '' },
    })
    expect(alerts.some(a => a.id === 'heap-growing' && a.severity === 'info')).toBe(true)
  })
})

// ─── Long tasks — session vs page-load ───────────────────────────────────────

describe('evaluateAlerts — long tasks', () => {
  it('fires critical for session tasks > 5 with > 600ms', () => {
    const alerts = evaluateAlerts({ sessionTaskCount: 6, sessionTaskMs: 700 })
    expect(alerts.some(a => a.id === 'longtask-session' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning for 3–5 session tasks', () => {
    const alerts = evaluateAlerts({ sessionTaskCount: 3, sessionTaskMs: 200 })
    expect(alerts.some(a => a.id === 'longtask-session-warn' && a.severity === 'warning')).toBe(true)
  })

  it('fires info (not critical) for page-load-only tasks when sessionTaskCount is 0', () => {
    const alerts = evaluateAlerts({ longTaskCount: 10, longTaskTotalMs: 1500, sessionTaskCount: 0, sessionTaskMs: 0 })
    expect(alerts.some(a => a.id === 'longtask-pageload' && a.severity === 'info')).toBe(true)
    expect(alerts.some(a => a.severity === 'critical' && a.id.includes('longtask'))).toBe(false)
  })

  it('does NOT fire page-load info alert when sessionTaskCount > 0', () => {
    const alerts = evaluateAlerts({ longTaskCount: 5, longTaskTotalMs: 1000, sessionTaskCount: 1, sessionTaskMs: 100 })
    expect(alerts.some(a => a.id === 'longtask-pageload')).toBe(false)
  })

  it('fires no task alert when all counts are zero', () => {
    const alerts = evaluateAlerts({ longTaskCount: 0, longTaskTotalMs: 0, sessionTaskCount: 0, sessionTaskMs: 0 })
    expect(alerts.some(a => a.id.includes('longtask'))).toBe(false)
  })
})

// ─── Runtime errors ───────────────────────────────────────────────────────────

describe('evaluateAlerts — runtime errors', () => {
  it('fires critical for JS errors', () => {
    const alerts = evaluateAlerts({ errors: [{ id: '1', type: 'js', message: 'oops', timestamp: '' }] })
    expect(alerts.some(a => a.id === 'js-errors' && a.severity === 'critical')).toBe(true)
  })

  it('fires warning for unhandled promise rejections', () => {
    const alerts = evaluateAlerts({ errors: [{ id: '1', type: 'promise', message: 'rejected', timestamp: '' }] })
    expect(alerts.some(a => a.id === 'promise-errors' && a.severity === 'warning')).toBe(true)
  })

  it('fires critical for React errors', () => {
    const alerts = evaluateAlerts({ errors: [{ id: '1', type: 'react', message: 'crash', timestamp: '' }] })
    expect(alerts.some(a => a.id === 'react-errors' && a.severity === 'critical')).toBe(true)
  })

  it('fires info for > 5 console errors', () => {
    const errors = Array.from({ length: 6 }, (_, i) => ({ id: String(i), type: 'console' as const, message: 'err', timestamp: '' }))
    const alerts = evaluateAlerts({ errors })
    expect(alerts.some(a => a.id === 'console-noise' && a.severity === 'info')).toBe(true)
  })
})

// ─── Intelligence feeds ───────────────────────────────────────────────────────

describe('evaluateAlerts — feeds', () => {
  it('fires info (not warning) when ratio < 0.15', () => {
    const alerts = evaluateAlerts({ feedTotal: 10, feedConnected: 1 })
    expect(alerts.some(a => a.id === 'feeds-low' && a.severity === 'info')).toBe(true)
    expect(alerts.some(a => a.severity === 'warning' && a.id.includes('feed'))).toBe(false)
  })

  it('fires no feed alert when feedTotal is 0', () => {
    const alerts = evaluateAlerts({ feedTotal: 0, feedConnected: 0 })
    expect(alerts.some(a => a.id.includes('feed'))).toBe(false)
  })
})

// ─── Alert ordering ───────────────────────────────────────────────────────────

describe('evaluateAlerts — ordering', () => {
  it('returns critical alerts before warnings before info', () => {
    const alerts = evaluateAlerts({
      liveVitals: { LCP: 5000 },             // critical
      liveVitals2: undefined,
      navMetrics: { ttfb: 2500, fcp: null, domInteractive: null, domComplete: null, loadEventEnd: null, resourceCount: 0, jsHeapUsed: null, jsHeapTotal: null, timestamp: '' },  // warning
      feedTotal: 10, feedConnected: 0,        // info
    })
    const severities = alerts.map(a => a.severity)
    const critIdx  = severities.indexOf('critical')
    const warnIdx  = severities.indexOf('warning')
    const infoIdx  = severities.indexOf('info')
    if (critIdx !== -1 && warnIdx !== -1) expect(critIdx).toBeLessThan(warnIdx)
    if (warnIdx !== -1 && infoIdx !== -1) expect(warnIdx).toBeLessThan(infoIdx)
  })
})
