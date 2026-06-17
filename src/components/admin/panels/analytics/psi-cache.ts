import type { PSIResult } from '@/lib/analytics/pagespeed'

const PSI_CACHE_KEY      = 'jootacee-psi-v1'
const PSI_LAST_GOOD_KEY  = 'jootacee-psi-last-good'   // never expires — always the last successful result
const PSI_COOLDOWN_KEY   = 'jootacee-psi-last-attempt'
const PSI_CACHE_TTL_MS   = 6 * 60 * 60 * 1000         // 6 h — fresh window (was 24h)
const PSI_COOLDOWN_MS    = 5 * 60 * 1000               // 5 min between auto-fetch attempts

// ─── Fresh cache (6h TTL) ────────────────────────────────────────────────────

export function loadPSICache(): { result: PSIResult; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(PSI_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { result: PSIResult; savedAt: number }
    if (Date.now() - parsed.savedAt > PSI_CACHE_TTL_MS) return null
    return parsed
  } catch { return null }
}

export function savePSICache(result: PSIResult): void {
  try {
    const payload = { result, savedAt: Date.now() }
    localStorage.setItem(PSI_CACHE_KEY, JSON.stringify(payload))
    localStorage.setItem(PSI_COOLDOWN_KEY, String(Date.now()))
    // Also update the permanent last-known-good record
    saveLastGoodPSI(result)
  } catch {}
}

// ─── Last-known-good (never expires) ─────────────────────────────────────────

export function loadLastGoodPSI(): { result: PSIResult; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(PSI_LAST_GOOD_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { result: PSIResult; savedAt: number }
  } catch { return null }
}

function saveLastGoodPSI(result: PSIResult): void {
  try {
    localStorage.setItem(PSI_LAST_GOOD_KEY, JSON.stringify({ result, savedAt: Date.now() }))
  } catch {}
}

// ─── Cooldown ────────────────────────────────────────────────────────────────

export function markPSIAttempt(): void {
  try { localStorage.setItem(PSI_COOLDOWN_KEY, String(Date.now())) } catch {}
}

export function isPSIOnCooldown(): boolean {
  try {
    const last = parseInt(localStorage.getItem(PSI_COOLDOWN_KEY) ?? '0', 10)
    return Date.now() - last < PSI_COOLDOWN_MS
  } catch { return false }
}

// ─── 429 retry tracking ───────────────────────────────────────────────────────

const PSI_429_RETRY_KEY = 'jootacee-psi-429-retry'

export function mark429(retryAfterSec = 65): void {
  try { localStorage.setItem(PSI_429_RETRY_KEY, String(Date.now() + retryAfterSec * 1000)) } catch {}
}

export function get429RetryMs(): number {
  try {
    const retryAt = parseInt(localStorage.getItem(PSI_429_RETRY_KEY) ?? '0', 10)
    const remaining = retryAt - Date.now()
    return remaining > 0 ? remaining : 0
  } catch { return 0 }
}

export function clear429(): void {
  try { localStorage.removeItem(PSI_429_RETRY_KEY) } catch {}
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

export function isPublicUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return hostname !== 'localhost' && !hostname.startsWith('127.') && !hostname.endsWith('.local')
  } catch { return false }
}

export function psiLandingUrl(base: string): string {
  try {
    const u = new URL(base.endsWith('/') ? base : base + '/')
    if (u.pathname === '/') return base.replace(/\/$/, '') + '/en/'
    return base
  } catch { return base }
}

// Parse PSI audit displayValue → rawMs scale used by the CWV chart.
export function parsePSIAuditMs(id: string, dv: string | undefined): number | null {
  if (!dv) return null
  const clean = dv.replace(/,/g, '')
  const num   = parseFloat(clean)
  if (isNaN(num)) return null
  if (id === 'cumulative-layout-shift') return num * 1000
  if (/\d\s*s$/.test(clean) && !/ms/.test(clean)) return num * 1000
  return num
}

// ─── Staleness label ─────────────────────────────────────────────────────────

export function staleLabel(savedAt: number): string {
  const ms   = Date.now() - savedAt
  const mins = Math.floor(ms / 60_000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
