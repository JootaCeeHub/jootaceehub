import { describe, it, expect } from 'vitest'
import app from './app.js'

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body['status']).toBe('ok')
    expect(typeof body['version']).toBe('string')
    expect(typeof body['uptime']).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// POST /auth/login — input validation (no real password needed)
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  it('returns 400 when body is missing', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    expect(res.status).toBe(400)
    const body = await res.json() as Record<string, unknown>
    expect(body['success']).toBe(false)
  })

  it('returns 400 when body is not JSON', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    expect(res.status).toBe(400)
  })

  it('returns 401 for a wrong password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    })
    // 401 = valid request but wrong credentials
    expect(res.status).toBe(401)
    const body = await res.json() as Record<string, unknown>
    expect(body['success']).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Unknown routes
// ---------------------------------------------------------------------------

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/not-a-real-route')
    expect(res.status).toBe(404)
    const body = await res.json() as Record<string, unknown>
    expect(body['success']).toBe(false)
  })
})
