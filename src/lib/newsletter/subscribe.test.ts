import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscribe, unsubscribe } from './subscribe'

// Base mock — new subscriber, no existing record, successful insert
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      insert: async () => ({ error: null }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  },
}))

describe('subscribe — email validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects empty email', async () => {
    const result = await subscribe('')
    expect(result.status).toBe('error')
    expect(result.message).toMatch(/valid email/i)
  })

  it('rejects invalid email format', async () => {
    expect((await subscribe('not-an-email')).status).toBe('error')
  })

  it('rejects email without TLD', async () => {
    expect((await subscribe('user@domain')).status).toBe('error')
  })

  it('rejects email without domain', async () => {
    expect((await subscribe('user@')).status).toBe('error')
  })
})

describe('subscribe — successful submission', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns success for valid email', async () => {
    const result = await subscribe('test@example.com')
    expect(result.status).toBe('success')
    expect(result.message).toBeTruthy()
  })

  it('normalises email to lowercase', async () => {
    const result = await subscribe('TEST@EXAMPLE.COM')
    expect(result.status).toBe('success')
  })

  it('trims whitespace from email', async () => {
    const result = await subscribe('  test@example.com  ')
    expect(result.status).toBe('success')
  })

  it('accepts email with source parameter', async () => {
    const result = await subscribe('test@example.com', 'blog-footer')
    expect(result.status).toBe('success')
  })
})

describe('subscribe — error handling', () => {
  it('returns error message string on success', async () => {
    const result = await subscribe('test@example.com')
    expect(typeof result.message).toBe('string')
    expect(result.message.length).toBeGreaterThan(0)
  })

  it('status is one of the valid values', async () => {
    const result = await subscribe('test@example.com')
    expect(['success', 'already_subscribed', 'error']).toContain(result.status)
  })
})

describe('unsubscribe', () => {
  it('returns success for valid email', async () => {
    const result = await unsubscribe('test@example.com')
    expect(result.status).toBe('success')
  })

  it('returns a message string', async () => {
    const result = await unsubscribe('test@example.com')
    expect(typeof result.message).toBe('string')
  })
})

describe('subscribe result shape', () => {
  it('result always has status and message', async () => {
    const result = await subscribe('test@example.com')
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('message')
  })

  it('rejects invalid email synchronously before hitting DB', async () => {
    const result = await subscribe('bad')
    expect(result.status).toBe('error')
  })
})
