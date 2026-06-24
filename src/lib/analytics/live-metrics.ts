export interface NavigationMetrics {
  ttfb:           number | null
  fcp:            number | null
  domInteractive: number | null
  domComplete:    number | null
  loadEventEnd:   number | null
  resourceCount:  number
  jsHeapUsed:     number | null
  jsHeapTotal:    number | null
  timestamp:      string
}

export interface LongTask {
  duration:  number
  startTime: number
  culprit?:  string
}

export type VitalRating = 'good' | 'needs-improvement' | 'poor'

const THRESHOLDS: Record<string, { good: number; poor: number; unit: string; scale: number }> = {
  LCP:  { good: 2500, poor: 4000, unit: 's',  scale: 1000 },
  FCP:  { good: 1800, poor: 3000, unit: 's',  scale: 1000 },
  CLS:  { good: 100,  poor: 250,  unit: '',   scale: 1000 },
  INP:  { good: 200,  poor: 500,  unit: 'ms', scale: 1    },
  TTFB: { good: 800,  poor: 1800, unit: 'ms', scale: 1    },
}

export function rateVital(name: string, rawMs: number): VitalRating {
  const t = THRESHOLDS[name]
  if (!t) return 'good'
  return rawMs <= t.good ? 'good' : rawMs <= t.poor ? 'needs-improvement' : 'poor'
}

export function formatVital(name: string, rawMs: number): string {
  const t = THRESHOLDS[name]
  if (!t) return `${Math.round(rawMs)}`
  if (t.scale === 1000) {
    if (name === 'CLS') return (rawMs / 1000).toFixed(3)
    return (rawMs / 1000).toFixed(1)
  }
  return Math.round(rawMs).toString()
}

export function vitalUnit(name: string): string {
  return THRESHOLDS[name]?.unit ?? 'ms'
}

export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local') || h.startsWith('192.168.')
}

export function collectNavigationMetrics(): NavigationMetrics {
  if (typeof window === 'undefined') {
    return {
      ttfb: null, fcp: null, domInteractive: null, domComplete: null,
      loadEventEnd: null, resourceCount: 0, jsHeapUsed: null, jsHeapTotal: null,
      timestamp: new Date().toISOString(),
    }
  }
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const mem = ('memory' in performance)
    ? (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
    : null

  const fcpEntries = performance.getEntriesByName('first-contentful-paint')
  const fcpRaw     = fcpEntries[0]?.startTime ?? null
  const fcp        = fcpRaw != null && fcpRaw < 30_000 ? Math.round(fcpRaw) : null

  // Cap TTFB at 5 s — values above that on localhost indicate dev-server compilation,
  // not real server latency. Return null rather than a misleading large number.
  let ttfb: number | null = null
  if (nav) {
    const raw = nav.responseStart - nav.requestStart
    ttfb = raw > 0 && raw < 5_000 ? Math.round(raw) : null
  }

  return {
    ttfb,
    fcp,
    domInteractive: nav ? Math.round(nav.domInteractive) : null,
    domComplete:    nav ? Math.round(nav.domComplete)    : null,
    loadEventEnd:   nav ? Math.round(nav.loadEventEnd)   : null,
    resourceCount:  performance.getEntriesByType('resource').length,
    jsHeapUsed:     mem ? Math.round(mem.usedJSHeapSize  / 1048576) : null,
    jsHeapTotal:    mem ? Math.round(mem.totalJSHeapSize / 1048576) : null,
    timestamp:      new Date().toISOString(),
  }
}

export function observeWebVitals(onUpdate: (vitals: Record<string, number>) => void): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return () => {}

  const observers: PerformanceObserver[] = []
  const vitals: Record<string, number> = {}

  // 150 ms debounce — batches rapid PerformanceObserver callbacks, reducing React render count
  // and admin panel INP.
  let emitTimer: ReturnType<typeof setTimeout> | null = null
  const emit = () => {
    if (emitTimer) clearTimeout(emitTimer)
    emitTimer = setTimeout(() => onUpdate({ ...vitals }), 150)
  }

  try {
    const obs = new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1)
      if (last && last.startTime < 60_000) { vitals['LCP'] = last.startTime; emit() }
    })
    obs.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(obs)
  } catch { /**/ }

  try {
    let clsVal = 0
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!entry.hadRecentInput && entry.value != null) clsVal += entry.value
      }
      vitals['CLS'] = Math.round(clsVal * 1000)
      emit()
    })
    obs.observe({ type: 'layout-shift', buffered: true })
    observers.push(obs)
  } catch { /**/ }

  try {
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { processingStart?: number }
        if (entry.processingStart != null) {
          const inp = Math.round(entry.processingStart - e.startTime)
          if (inp > (vitals['INP'] ?? 0)) { vitals['INP'] = inp; emit() }
        }
      }
    })
    obs.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
    observers.push(obs)
  } catch { /**/ }

  try {
    const obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.name === 'first-contentful-paint' && !vitals['FCP'] && e.startTime < 30_000) {
          vitals['FCP'] = Math.round(e.startTime)
          emit()
        }
      }
    })
    obs.observe({ type: 'paint', buffered: true })
    observers.push(obs)
  } catch { /**/ }

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) {
      const raw = nav.responseStart - nav.requestStart
      if (raw > 0 && raw < 5_000) { vitals['TTFB'] = Math.round(raw); emit() }
    }
  } catch { /**/ }

  return () => {
    if (emitTimer) clearTimeout(emitTimer)
    observers.forEach((o) => { try { o.disconnect() } catch { /**/ } })
  }
}

export interface LongTaskSummary {
  tasks:          LongTask[]
  sessionTasks:   LongTask[]   // tasks observed AFTER admin panel mounted
  pageLoadTasks:  LongTask[]   // tasks replayed from buffered history (page load)
  totalMs:        number
  sessionMs:      number
  count:          number
  sessionCount:   number
  longestMs:      number
}

export function observeLongTasks(onUpdate: (summary: LongTaskSummary) => void): () => void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return () => {}

  // Tasks that started before this threshold are page-load context, not current admin session
  const sessionStart   = performance.now()
  const allTasks:      LongTask[] = []
  const sessionTasks:  LongTask[] = []
  const pageLoadTasks: LongTask[] = []

  let obs: PerformanceObserver | null = null
  try {
    obs = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const entry = e as PerformanceEntry & { attribution?: { name?: string }[] }
        const task: LongTask = {
          duration:  Math.round(e.duration),
          startTime: Math.round(e.startTime),
          culprit:   entry.attribution?.[0]?.name,
        }
        allTasks.push(task)
        if (e.startTime < sessionStart) {
          pageLoadTasks.push(task)
        } else {
          sessionTasks.push(task)
        }
      }
      const totalMs   = allTasks.reduce((a, t) => a + t.duration, 0)
      const sessionMs = sessionTasks.reduce((a, t) => a + t.duration, 0)
      const longestMs = allTasks.reduce((a, t) => Math.max(a, t.duration), 0)
      onUpdate({
        tasks:        [...allTasks],
        sessionTasks: [...sessionTasks],
        pageLoadTasks:[...pageLoadTasks],
        totalMs,
        sessionMs,
        count:        allTasks.length,
        sessionCount: sessionTasks.length,
        longestMs,
      })
    })
    obs.observe({ type: 'longtask', buffered: true })
  } catch {
    return () => {}
  }

  return () => { try { obs?.disconnect() } catch { /**/ } }
}

export function sampleHeap(): { used: number; total: number } | null {
  if (typeof window === 'undefined' || !('memory' in performance)) return null
  const mem = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
  return {
    used:  Math.round(mem.usedJSHeapSize  / 1048576),
    total: Math.round(mem.totalJSHeapSize / 1048576),
  }
}

// ─── Composite performance score ─────────────────────────────────────────────

export interface PerformanceScore {
  total:      number
  grade:      'A' | 'B' | 'C' | 'D' | 'F'
  cwv:        number | null   // 0-100 from CWV ratings
  threading:  number          // 0-100 from long tasks
  navigation: number | null   // 0-100 from TTFB
  resources:  number | null   // 0-100 from cache ratio + slow count
  memory:     number | null   // 0-100 from heap pressure
  hasData:    boolean
}

export function computePerformanceScore(
  liveVitals:      Record<string, number>,
  longTasks:       LongTaskSummary,
  navMetrics:      NavigationMetrics | null,
  resourceSummary: { slowCount: number; cacheRatio: number; entries: unknown[] } | null,
): PerformanceScore {
  // CWV (40%): rate each vital good=100 / needs-improvement=50 / poor=0
  const vitalScores: number[] = []
  for (const [name, raw] of Object.entries(liveVitals)) {
    const rating = rateVital(name, raw)
    vitalScores.push(rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0)
  }
  const cwv = vitalScores.length > 0
    ? Math.round(vitalScores.reduce((a, b) => a + b, 0) / vitalScores.length)
    : null

  // Threading (20%): totalMs=0→100, every 10ms costs 1 point, floor at 0
  const threading = Math.max(0, Math.round(100 - longTasks.totalMs / 10))

  // Navigation TTFB (15%): 0ms→100, 1800ms→0
  const navigation = navMetrics?.ttfb != null
    ? Math.max(0, Math.min(100, Math.round(100 - (navMetrics.ttfb / 1800) * 100)))
    : null

  // Resources (15%): cache ratio contributes 50pts, slow count takes 5pts each up to 50
  const resources = resourceSummary != null
    ? Math.min(100, Math.round(
        resourceSummary.cacheRatio * 50 +
        Math.max(0, 50 - resourceSummary.slowCount * 5),
      ))
    : null

  // Memory (10%): heap used/total → lower ratio = better
  let memory: number | null = null
  if (navMetrics?.jsHeapUsed != null && navMetrics.jsHeapTotal != null && navMetrics.jsHeapTotal > 0) {
    const ratio = navMetrics.jsHeapUsed / navMetrics.jsHeapTotal
    memory = Math.max(0, Math.round((1 - ratio) * 100))
  }

  // Weighted composite — if a dimension has no data, redistribute weight
  const dims: Array<{ score: number | null; weight: number }> = [
    { score: cwv,        weight: 0.40 },
    { score: threading,  weight: 0.20 },
    { score: navigation, weight: 0.15 },
    { score: resources,  weight: 0.15 },
    { score: memory,     weight: 0.10 },
  ]
  const available   = dims.filter(d => d.score !== null)
  const totalWeight = available.reduce((a, d) => a + d.weight, 0)
  const hasData     = available.length > 0

  const total = hasData && totalWeight > 0
    ? Math.round(available.reduce((a, d) => a + d.score! * d.weight, 0) / totalWeight)
    : 0

  const grade: PerformanceScore['grade'] =
    total >= 90 ? 'A' : total >= 75 ? 'B' : total >= 60 ? 'C' : total >= 40 ? 'D' : 'F'

  return { total, grade, cwv, threading, resources, navigation, memory, hasData }
}
