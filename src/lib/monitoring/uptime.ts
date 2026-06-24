'use client'

// ---------------------------------------------------------------------------
// Client-side uptime + health monitoring — Phase 5
// Polls the VPS Content API /health endpoint from the admin panel.
// Works within static export (no server functions).
// ---------------------------------------------------------------------------

export interface HealthResult {
  ok: boolean
  latencyMs: number
  status: 'up' | 'down' | 'degraded'
  ts: string
  detail?: {
    version: string
    uptime: number
    heapUsedMB: number
    heapTotalMB: number
    rssMB: number
  }
  error?: string
}

export interface UptimeHistory {
  samples: HealthResult[]
  p99LatencyMs: number
  availability99d: number  // percentage 0-100
  consecutiveFailures: number
  alertActive: boolean
}

export interface UptimeAlert {
  level: 'warning' | 'critical' | 'resolved'
  message: string
  ts: string
  consecutiveFailures: number
}

const HISTORY_MAX          = 60   // 60 samples × 30s = 30 min of rolling history
const ALERT_THRESHOLD_WARN = 2    // warn after 2 consecutive failures (~1 min)
const ALERT_THRESHOLD_CRIT = 5    // critical after 5 consecutive failures (~2.5 min)
const LS_HISTORY_KEY       = 'jootacee-uptime-v1'
const LS_WEBHOOK_KEY       = 'jootacee-webhook-url'

// ---------------------------------------------------------------------------
// LocalStorage persistence — ring buffer survives page reload
// ---------------------------------------------------------------------------

function _loadFromStorage(): HealthResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    // Discard samples older than 30 min
    const cutoff = Date.now() - 30 * 60 * 1000
    return (parsed as HealthResult[])
      .filter(r => typeof r.ts === 'string' && new Date(r.ts).getTime() > cutoff)
      .slice(-HISTORY_MAX)
  } catch { return [] }
}

function _saveToStorage(): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(_history.slice(-HISTORY_MAX))) } catch { /* quota */ }
}

// ---------------------------------------------------------------------------
// Webhook notification — fires from browser when alerts cross thresholds
// ---------------------------------------------------------------------------

/** Set a webhook URL for external alert delivery (stored in localStorage) */
export function setAlertWebhookUrl(url: string | null): void {
  _webhookUrl = url
  if (typeof window === 'undefined') return
  try {
    if (url) localStorage.setItem(LS_WEBHOOK_KEY, url)
    else localStorage.removeItem(LS_WEBHOOK_KEY)
  } catch { /* quota */ }
}

/** Read configured webhook URL */
export function getAlertWebhookUrl(): string | null {
  if (_webhookUrl) return _webhookUrl
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(LS_WEBHOOK_KEY) } catch { return null }
}

async function _fireWebhook(alert: UptimeAlert): Promise<void> {
  const url = getAlertWebhookUrl()
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'jootacee-monitoring',
        level:  alert.level,
        message: alert.message,
        ts:     alert.ts,
        consecutiveFailures: alert.consecutiveFailures,
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch { /* webhook delivery failure is non-fatal */ }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// Initialize ring buffer from localStorage on module load
const _history: HealthResult[] = _loadFromStorage()
let _webhookUrl: string | null = null
let _subscribers:      Array<(r: HealthResult) => void> = []
let _alertSubscribers: Array<(a: UptimeAlert)  => void> = []
let _consecutiveFailures = 0

function p99(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length * 0.99)] ?? sorted[sorted.length - 1] ?? 0
}

// ---------------------------------------------------------------------------
// Core probe
// ---------------------------------------------------------------------------

/**
 * Probe the Content API /health endpoint.
 * Returns immediately when API URL is not configured (no-op safe).
 */
export async function probeHealth(apiBase?: string): Promise<HealthResult> {
  const base = apiBase ?? process.env.NEXT_PUBLIC_CONTENT_API_URL ?? ''
  const ts   = new Date().toISOString()

  if (!base) {
    return { ok: false, latencyMs: 0, status: 'down', ts, error: 'API_URL not configured' }
  }

  const t0 = performance.now()
  try {
    const res = await fetch(`${base}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      cache:  'no-store',
    })
    const latencyMs = Math.round(performance.now() - t0)

    if (!res.ok) {
      const r: HealthResult = { ok: false, latencyMs, status: 'down', ts, error: `HTTP ${res.status}` }
      _push(r); return r
    }

    const data = await res.json() as {
      version?: string; uptime?: number
      memory?: { heapUsedMB: number; heapTotalMB: number; rssMB: number }
    }
    const status: HealthResult['status'] = latencyMs > 1500 ? 'degraded' : 'up'

    const result: HealthResult = {
      ok: true,
      latencyMs,
      status,
      ts,
      detail: {
        version:     data.version          ?? '?',
        uptime:      data.uptime           ?? 0,
        heapUsedMB:  data.memory?.heapUsedMB  ?? 0,
        heapTotalMB: data.memory?.heapTotalMB ?? 0,
        rssMB:       data.memory?.rssMB       ?? 0,
      },
    }
    _push(result)
    return result
  } catch (err) {
    const latencyMs = Math.round(performance.now() - t0)
    const result: HealthResult = {
      ok: false, latencyMs, status: 'down', ts,
      error: err instanceof Error ? err.message : String(err),
    }
    _push(result)
    return result
  }
}

// ---------------------------------------------------------------------------
// Internal push — updates ring buffer, fires alerts, persists
// ---------------------------------------------------------------------------

function _push(r: HealthResult): void {
  _history.push(r)
  if (_history.length > HISTORY_MAX) _history.shift()
  _saveToStorage()

  if (!r.ok) {
    _consecutiveFailures++
    const level: UptimeAlert['level'] = _consecutiveFailures >= ALERT_THRESHOLD_CRIT ? 'critical' : 'warning'
    if (_consecutiveFailures === ALERT_THRESHOLD_WARN || _consecutiveFailures === ALERT_THRESHOLD_CRIT) {
      const alert: UptimeAlert = {
        level,
        message: level === 'critical'
          ? `Content API has been down for ${_consecutiveFailures} consecutive probes (~${Math.round(_consecutiveFailures * 30 / 60)} min). Immediate action required.`
          : `Content API failed ${_consecutiveFailures} consecutive health checks. Investigating…`,
        ts: r.ts,
        consecutiveFailures: _consecutiveFailures,
      }
      _alertSubscribers.forEach(fn => fn(alert))
      void _fireWebhook(alert)
    }
  } else {
    if (_consecutiveFailures > 0) {
      const alert: UptimeAlert = {
        level: 'resolved',
        message: `Content API recovered after ${_consecutiveFailures} failure(s).`,
        ts: r.ts,
        consecutiveFailures: 0,
      }
      _alertSubscribers.forEach(fn => fn(alert))
      void _fireWebhook(alert)
    }
    _consecutiveFailures = 0
  }

  _subscribers.forEach(fn => fn(r))
}

// ---------------------------------------------------------------------------
// Public subscriptions
// ---------------------------------------------------------------------------

/** Subscribe to every health probe result — returns unsubscribe fn */
export function subscribeHealth(fn: (r: HealthResult) => void): () => void {
  _subscribers.push(fn)
  return () => { _subscribers = _subscribers.filter(s => s !== fn) }
}

/** Subscribe to threshold alerts (warn / critical / resolved) — returns unsubscribe fn */
export function subscribeAlerts(fn: (a: UptimeAlert) => void): () => void {
  _alertSubscribers.push(fn)
  return () => { _alertSubscribers = _alertSubscribers.filter(s => s !== fn) }
}

// ---------------------------------------------------------------------------
// Derived getters
// ---------------------------------------------------------------------------

/** Aggregated uptime history — rebuilt from persisted ring buffer */
export function getUptimeHistory(): UptimeHistory {
  const latencies = _history.filter(r => r.ok).map(r => r.latencyMs)
  const upCount   = _history.filter(r => r.ok).length
  return {
    samples:             [..._history],
    p99LatencyMs:        p99(latencies),
    availability99d:     _history.length === 0 ? 100 : Math.round((upCount / _history.length) * 100),
    consecutiveFailures: _consecutiveFailures,
    alertActive:         _consecutiveFailures >= ALERT_THRESHOLD_WARN,
  }
}

/** Last probe result or null */
export function getLastHealth(): HealthResult | null {
  return _history[_history.length - 1] ?? null
}

/** Current consecutive failure count */
export function getConsecutiveFailures(): number { return _consecutiveFailures }

/** Clear persisted history (useful for reset/testing) */
export function clearHistory(): void {
  _history.length = 0
  _consecutiveFailures = 0
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LS_HISTORY_KEY) } catch { /* ok */ }
  }
}
