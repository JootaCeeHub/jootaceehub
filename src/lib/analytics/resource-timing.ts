
export type ResourceType = 'script' | 'link' | 'img' | 'fetch' | 'xmlhttprequest' | 'font' | 'css' | 'other'

export interface TimedResource {
  name:          string
  fullUrl:       string
  type:          ResourceType
  transferSize:  number   // bytes (0 = cached / same-origin opaque)
  decodedSize:   number   // bytes
  duration:      number   // ms
  startTime:     number   // ms from navigation start
  cached:        boolean
  slow:          boolean  // > 500ms
  failed:        boolean  // transferSize 0 but not cached (cross-origin guess)
}

export interface ResourceSummary {
  entries:      TimedResource[]
  totalKB:      number
  totalMs:      number
  cachedCount:  number
  slowCount:    number
  byType:       Record<ResourceType, { count: number; kb: number; avgMs: number }>
  slowest:      TimedResource[]
  largest:      TimedResource[]
  cacheRatio:   number    // 0–1
  transferKB:   number
}

function classify(raw: PerformanceResourceTiming): ResourceType {
  const t = raw.initiatorType
  if (t === 'script')          return 'script'
  if (t === 'link')            return 'link'
  if (t === 'img')             return 'img'
  if (t === 'fetch')           return 'fetch'
  if (t === 'xmlhttprequest')  return 'xmlhttprequest'
  if (t === 'css')             return 'css'
  if (raw.name.match(/\.(woff2?|ttf|otf|eot)/i)) return 'font'
  return 'other'
}

function shortName(url: string): string {
  try {
    const u = new URL(url)
    return u.pathname.split('/').pop() || u.hostname
  } catch {
    return url.split('/').pop() || url
  }
}

export function getResourceSummary(): ResourceSummary {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return {
      entries: [], totalKB: 0, totalMs: 0, cachedCount: 0, slowCount: 0,
      byType: {} as ResourceSummary['byType'], slowest: [], largest: [], cacheRatio: 0, transferKB: 0,
    }
  }

  const raw = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  const entries: TimedResource[] = raw.map((r) => {
    const cached  = r.transferSize === 0 && r.decodedBodySize > 0
    const decoded = r.decodedBodySize ?? 0
    const transfer = r.transferSize ?? 0
    return {
      name:         shortName(r.name),
      fullUrl:      r.name,
      type:         classify(r),
      transferSize: transfer,
      decodedSize:  decoded,
      duration:     Math.round(r.duration),
      startTime:    Math.round(r.startTime),
      cached,
      slow:         r.duration > 500,
      failed:       transfer === 0 && decoded === 0 && r.duration < 5,
    }
  })

  const totalKB     = Math.round(entries.reduce((a, e) => a + e.decodedSize, 0) / 1024)
  const transferKB  = Math.round(entries.reduce((a, e) => a + e.transferSize, 0) / 1024)
  const totalMs     = entries.reduce((a, e) => a + e.duration, 0)
  const cachedCount = entries.filter((e) => e.cached).length
  const slowCount   = entries.filter((e) => e.slow).length

  const byType = {} as ResourceSummary['byType']
  for (const e of entries) {
    if (!byType[e.type]) byType[e.type] = { count: 0, kb: 0, avgMs: 0 }
    byType[e.type].count++
    byType[e.type].kb += Math.round(e.decodedSize / 1024)
  }
  for (const t of Object.keys(byType) as ResourceType[]) {
    const group = entries.filter((e) => e.type === t)
    byType[t].avgMs = Math.round(group.reduce((a, e) => a + e.duration, 0) / group.length)
  }

  const slowest = [...entries].sort((a, b) => b.duration  - a.duration).slice(0, 8)
  const largest = [...entries].sort((a, b) => b.decodedSize - a.decodedSize).slice(0, 8)

  return {
    entries,
    totalKB,
    transferKB,
    totalMs,
    cachedCount,
    slowCount,
    byType,
    slowest,
    largest,
    cacheRatio: entries.length > 0 ? cachedCount / entries.length : 0,
  }
}

export function collectNetworkFailures(): { url: string; status: number; ts: string }[] {
  // Populated by the error-collector fetch interceptor
  if (typeof window === 'undefined') return []
  return (window as Window & { __analyticsNetworkFails?: { url: string; status: number; ts: string }[] }).__analyticsNetworkFails ?? []
}
