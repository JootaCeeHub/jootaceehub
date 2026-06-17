
export interface AnalysisSnapshot {
  id:            string
  timestamp:     string
  lighthouseScores?: { label: string; score: number }[]
  vitals?:       Record<string, number>
  domSeoPass?:   number
  domSeoTotal?:  number
  domA11yPass?:  number
  domA11yTotal?: number
  errorCount:    number
  feedConnected?:number
  feedTotal?:    number
  navTTFB?:      number | null
  heapUsed?:     number | null
  resourceCount?:number
  url?:          string
  strategy?:     'mobile' | 'desktop'
  type:          'manual' | 'psi' | 'auto'
}

const KEY     = 'jootacee-analytics-history-v1'
const MAX_LEN = 30

export function saveSnapshot(entry: Omit<AnalysisSnapshot, 'id'>): AnalysisSnapshot {
  const snap: AnalysisSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...entry,
  }
  try {
    const all = getHistory()
    const next = [snap, ...all].slice(0, MAX_LEN)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* storage full / SSR */ }
  return snap
}

export function getHistory(): AnalysisSnapshot[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AnalysisSnapshot[]) : []
  } catch { return [] }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(KEY) } catch {}
}

export function getScoreTrend(label: string, n = 10): number[] {
  return getHistory()
    .filter((e) => e.lighthouseScores != null)
    .map((e) => e.lighthouseScores!.find((s) => s.label === label)?.score ?? -1)
    .filter((s) => s >= 0)
    .slice(0, n)
    .reverse()
}

export function getVitalTrend(name: string, n = 10): number[] {
  return getHistory()
    .filter((e) => e.vitals?.[name] != null)
    .map((e) => e.vitals![name])
    .slice(0, n)
    .reverse()
}

export function getErrorTrend(n = 10): number[] {
  return getHistory()
    .map((e) => e.errorCount)
    .slice(0, n)
    .reverse()
}

// Inline sparkline as SVG path string from a series of values
export function buildSparklinePath(values: number[], width = 80, height = 24): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${points.join(' L ')}`
}

export interface HistoryStats {
  totalRuns:      number
  psiRuns:        number
  avgPerformance: number | null
  avgSEO:         number | null
  bestPerf:       number | null
  worstPerf:      number | null
  totalErrors:    number
  lastRun:        string | null
}

export function computeHistoryStats(): HistoryStats {
  const all = getHistory()
  if (all.length === 0) {
    return { totalRuns: 0, psiRuns: 0, avgPerformance: null, avgSEO: null, bestPerf: null, worstPerf: null, totalErrors: 0, lastRun: null }
  }
  const psiEntries = all.filter((e) => e.lighthouseScores?.length)
  const perfScores  = psiEntries.map((e) => e.lighthouseScores!.find((s) => s.label === 'Performance')?.score ?? -1).filter((s) => s >= 0)
  const seoScores   = psiEntries.map((e) => e.lighthouseScores!.find((s) => s.label === 'SEO')?.score ?? -1).filter((s) => s >= 0)
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  return {
    totalRuns:      all.length,
    psiRuns:        psiEntries.length,
    avgPerformance: avg(perfScores),
    avgSEO:         avg(seoScores),
    bestPerf:       perfScores.length ? Math.max(...perfScores) : null,
    worstPerf:      perfScores.length ? Math.min(...perfScores) : null,
    totalErrors:    all.reduce((a, e) => a + e.errorCount, 0),
    lastRun:        all[0]?.timestamp ?? null,
  }
}
