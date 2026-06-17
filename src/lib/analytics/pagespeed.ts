
export interface PSIScore {
  label:        string
  score:        number
  displayValue?: string
}

export interface PSIAudit {
  title:        string
  score:        number | null
  displayValue?: string
}

export interface MainThreadItem {
  group:    string
  duration: number
}

export interface PSIResult {
  url:             string
  strategy:        'mobile' | 'desktop'
  fetchedAt:       string
  scores:          PSIScore[]
  audits:          Record<string, PSIAudit>
  error?:          string
  retryAfterSec?:  number
  /** Extra diagnostics captured by scripts/fetch-lighthouse.mjs */
  lcpElement?:     string | null
  renderBlockMs?:  number | null
  unusedJsKb?:     number | null
  mainThreadWork?: MainThreadItem[]
  seoFails?:       { id: string; title: string; score: number }[]
  /** UI-only hint set by the panel — not from the API */
  _source?:        'live' | 'cache' | 'build' | 'stale'
}

const KEY_AUDIT_IDS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
  'server-response-time',
]

export async function fetchPageSpeedInsights(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile',
): Promise<PSIResult> {
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  const apiKey   = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_PSI_API_KEY ?? '') : ''
  const params   = new URLSearchParams({ url, strategy })
  if (apiKey) params.set('key', apiKey)

  try {
    const res = await fetch(`${endpoint}?${params.toString()}`, {
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      const retryAfter = res.headers.get('Retry-After')
      const err = Object.assign(
        new Error(`PSI API ${res.status}: ${res.statusText}`),
        { retryAfterSec: retryAfter ? parseInt(retryAfter, 10) : res.status === 429 ? 65 : undefined }
      )
      throw err
    }

    const data = await res.json()
    const cats   = (data?.lighthouseResult?.categories ?? {}) as Record<string, { score?: number }>
    const audits = (data?.lighthouseResult?.audits ?? {}) as Record<string, { title?: string; score?: number | null; displayValue?: string }>

    const scores: PSIScore[] = [
      { label: 'Performance',    score: Math.round((cats.performance?.score     ?? 0) * 100) },
      { label: 'Accessibility',  score: Math.round((cats.accessibility?.score   ?? 0) * 100) },
      { label: 'Best Practices', score: Math.round((cats['best-practices']?.score ?? 0) * 100) },
      { label: 'SEO',            score: Math.round((cats.seo?.score             ?? 0) * 100) },
      { label: 'PWA',            score: Math.round((cats.pwa?.score             ?? 0) * 100) },
    ]

    const keyAudits: Record<string, PSIAudit> = {}
    for (const id of KEY_AUDIT_IDS) {
      const a = audits[id]
      if (a) {
        keyAudits[id] = {
          title:        a.title ?? id,
          score:        a.score != null ? Math.round(a.score * 100) : null,
          displayValue: a.displayValue,
        }
      }
    }

    return { url, strategy, fetchedAt: new Date().toISOString(), scores, audits: keyAudits }
  } catch (err) {
    return {
      url,
      strategy,
      fetchedAt:    new Date().toISOString(),
      scores:       [],
      audits:       {},
      error:        err instanceof Error ? err.message : String(err),
      retryAfterSec: (err as { retryAfterSec?: number }).retryAfterSec,
    }
  }
}
