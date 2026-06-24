/**
 * Section Performance Tracker
 *
 * Records render + visibility timing for each landing section.
 * Persists to localStorage so the admin panel can read cross-page metrics:
 *   public site (write) → /admin PerformanceTab (read)
 *
 * Static-export compatible — zero server dependencies.
 */

const STORAGE_KEY = 'jc-section-perf-v2'
const MAX_AGE_MS  = 12 * 60 * 60 * 1000 // evict entries older than 12h

export type SectionStatus = 'good' | 'needs-improvement' | 'poor'

export interface SectionPerfEntry {
  name: string
  renderMs: number         // ms since nav start when component first mounted
  visibleMs: number | null // ms since nav start when section crossed IO threshold
  capturedAt: number       // absolute Date.now() — used for eviction
  url: string              // pathname where captured
  fcp: number | null       // FCP value at time of capture (ms)
  status: SectionStatus    // derived from visibleMs (or renderMs if not yet visible)
  budget: number           // expected maximum ms for this section
}

// Section budgets — how long each section *should* take to appear
const SECTION_BUDGETS: Record<string, number> = {
  hero:           2500,
  systems:        3500,
  labs:           4000,
  infrastructure: 4500,
  journal:        5000,
  collaborate:    5500,
}

function classifyStatus(ms: number, budget?: number): SectionStatus {
  const b = budget ?? 4000
  if (ms <= b * 0.625) return 'good'
  if (ms <= b)         return 'needs-improvement'
  return 'poor'
}

function getFCP(): number | null {
  if (typeof performance === 'undefined') return null
  const entries = performance.getEntriesByName('first-contentful-paint')
  const val = entries[0]?.startTime
  return val != null && val < 30_000 ? Math.round(val) : null
}

// ─── Internal store helpers ────────────────────────────────────────────────────

type SectionStore = Record<string, SectionPerfEntry>

function readStore(): SectionStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: SectionStore = JSON.parse(raw)
    const now = Date.now()
    const fresh: SectionStore = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (now - v.capturedAt < MAX_AGE_MS) fresh[k] = v
    }
    return fresh
  } catch {
    return {}
  }
}

function writeStore(store: SectionStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch { /* quota exceeded or SSR — fail silently */ }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** Called when a section component first mounts (in useEffect). */
export function recordSectionRender(name: string, nowMs: number): void {
  if (typeof window === 'undefined') return
  const store   = readStore()
  const budget  = SECTION_BUDGETS[name] ?? 5000
  const rounded = Math.round(nowMs)

  store[name] = {
    name,
    renderMs:   rounded,
    visibleMs:  store[name]?.visibleMs ?? null,
    capturedAt: Date.now(),
    url:        window.location.pathname,
    fcp:        getFCP(),
    budget,
    status:     classifyStatus(rounded, budget),
  }
  writeStore(store)
}

/** Called when IntersectionObserver fires (section crosses 10% threshold). */
export function recordSectionVisible(name: string, nowMs: number): void {
  if (typeof window === 'undefined') return
  const store    = readStore()
  const existing = store[name]
  if (!existing) return
  const rounded       = Math.round(nowMs)
  existing.visibleMs  = rounded
  existing.status     = classifyStatus(rounded, existing.budget)
  existing.capturedAt = Date.now()
  writeStore(store)
}

/** Returns all captured entries sorted by render time (earliest first). */
export function getSectionPerfEntries(): SectionPerfEntry[] {
  return Object.values(readStore()).sort((a, b) => a.renderMs - b.renderMs)
}

/** Clears all captured section metrics. */
export function clearSectionPerf(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ok */ }
}
