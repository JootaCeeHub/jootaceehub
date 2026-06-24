/**
 * uptime.ts unit tests — Phase 5 monitoring
 *
 * Tests the ring buffer, threshold alerting, webhook config,
 * localStorage persistence helpers, and derived getters.
 *
 * NOTE: probeHealth() does live fetches and is tested indirectly.
 * The internal _push path is exercised via the exported API.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getUptimeHistory,
  getLastHealth,
  getConsecutiveFailures,
  clearHistory,
  subscribeHealth,
  subscribeAlerts,
  setAlertWebhookUrl,
  getAlertWebhookUrl,
  probeHealth,
} from './uptime'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Expose internal _push by calling probeHealth with a controlled fetch mock.
// We mock globalThis.fetch and process.env for each test group.

function mockFetch(status: number, body: object) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }))
}

function mockFetchError(msg: string) {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(msg)))
}

beforeEach(() => {
  clearHistory()
  vi.unstubAllGlobals()
  // Ensure env is set so probeHealth doesn't short-circuit
  vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL', 'http://localhost:3001')
})

// ---------------------------------------------------------------------------
// Ring buffer
// ---------------------------------------------------------------------------

describe('ring buffer', () => {
  it('starts empty after clearHistory', () => {
    const h = getUptimeHistory()
    expect(h.samples).toHaveLength(0)
    expect(h.availability99d).toBe(100)
    expect(h.consecutiveFailures).toBe(0)
  })

  it('accumulates samples up to HISTORY_MAX (60)', async () => {
    mockFetch(200, { status: 'ok', version: '1.0.0', uptime: 10, memory: { heapUsedMB: 10, heapTotalMB: 20, rssMB: 30 } })
    for (let i = 0; i < 65; i++) await probeHealth()
    expect(getUptimeHistory().samples).toHaveLength(60)
  })

  it('computes availability correctly', async () => {
    mockFetch(200, { status: 'ok', uptime: 0, memory: { heapUsedMB: 1, heapTotalMB: 1, rssMB: 1 } })
    await probeHealth()
    await probeHealth()
    mockFetch(500, {})
    await probeHealth()
    const h = getUptimeHistory()
    expect(h.availability99d).toBe(67) // 2/3 ≈ 67%
  })

  it('getLastHealth returns the most recent sample', async () => {
    mockFetch(200, { uptime: 42, memory: { heapUsedMB: 5, heapTotalMB: 10, rssMB: 8 } })
    await probeHealth()
    const last = getLastHealth()
    expect(last).not.toBeNull()
    expect(last!.ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Threshold alerting
// ---------------------------------------------------------------------------

describe('threshold alerting', () => {
  it('fires warning alert after 2 consecutive failures', async () => {
    const alerts: string[] = []
    const unsub = subscribeAlerts(a => alerts.push(a.level))
    mockFetch(500, {})
    await probeHealth()
    await probeHealth()
    expect(alerts).toContain('warning')
    unsub()
  })

  it('fires critical alert after 5 consecutive failures', async () => {
    const levels: string[] = []
    const unsub = subscribeAlerts(a => levels.push(a.level))
    mockFetch(500, {})
    for (let i = 0; i < 5; i++) await probeHealth()
    expect(levels).toContain('critical')
    unsub()
  })

  it('fires resolved alert on recovery', async () => {
    const levels: string[] = []
    const unsub = subscribeAlerts(a => levels.push(a.level))
    mockFetch(500, {})
    await probeHealth()
    await probeHealth()
    mockFetch(200, { uptime: 1, memory: { heapUsedMB: 1, heapTotalMB: 1, rssMB: 1 } })
    await probeHealth()
    expect(levels).toContain('resolved')
    unsub()
  })

  it('resets consecutiveFailures to 0 after recovery', async () => {
    mockFetch(500, {})
    await probeHealth()
    await probeHealth()
    mockFetch(200, { uptime: 1, memory: { heapUsedMB: 1, heapTotalMB: 1, rssMB: 1 } })
    await probeHealth()
    expect(getConsecutiveFailures()).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// subscribeHealth pub/sub
// ---------------------------------------------------------------------------

describe('subscribeHealth', () => {
  it('notifies subscriber on every probe', async () => {
    const results: boolean[] = []
    const unsub = subscribeHealth(r => results.push(r.ok))
    mockFetch(200, { uptime: 0, memory: { heapUsedMB: 1, heapTotalMB: 1, rssMB: 1 } })
    await probeHealth()
    await probeHealth()
    expect(results).toHaveLength(2)
    unsub()
  })

  it('does not notify after unsubscribe', async () => {
    const results: boolean[] = []
    const unsub = subscribeHealth(r => results.push(r.ok))
    mockFetch(200, { uptime: 0, memory: { heapUsedMB: 1, heapTotalMB: 1, rssMB: 1 } })
    await probeHealth()
    unsub()
    await probeHealth()
    expect(results).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Webhook config
// ---------------------------------------------------------------------------

describe('webhook config', () => {
  it('setAlertWebhookUrl / getAlertWebhookUrl roundtrip', () => {
    setAlertWebhookUrl('https://example.com/hook')
    expect(getAlertWebhookUrl()).toBe('https://example.com/hook')
  })

  it('setAlertWebhookUrl(null) clears the URL', () => {
    setAlertWebhookUrl('https://example.com/hook')
    setAlertWebhookUrl(null)
    expect(getAlertWebhookUrl()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Error handling — fetch rejection
// ---------------------------------------------------------------------------

describe('probeHealth error handling', () => {
  it('returns ok=false on network error', async () => {
    mockFetchError('connection refused')
    const result = await probeHealth()
    expect(result.ok).toBe(false)
    expect(result.status).toBe('down')
    expect(result.error).toContain('connection refused')
  })

  it('returns ok=false when API_URL is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_CONTENT_API_URL', '')
    const result = await probeHealth('')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not configured')
  })
})
