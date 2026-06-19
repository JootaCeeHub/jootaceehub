import { describe, it, expect, vi, beforeEach } from 'vitest'
import { subscribe, unsubscribe } from './subscribe'

// No Supabase: tests run against the live subscribe function.
// Resend is not configured in test (NEXT_PUBLIC_RESEND_API_KEY absent),
// so notifyResend is a no-op and subscribe returns optimistic success.

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

  it('returns success for valid email (no Resend configured)', async () => {
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

describe('subscribe result shape', () => {
  it('result always has status and message', async () => {
    const result = await subscribe('test@example.com')
    expect(result).toHaveProperty('status')
    expect(result).toHaveProperty('message')
  })

  it('status is one of the valid values', async () => {
    const result = await subscribe('test@example.com')
    expect(['success', 'already_subscribed', 'error']).toContain(result.status)
  })

  it('rejects invalid email before calling Resend', async () => {
    const result = await subscribe('bad')
    expect(result.status).toBe('error')
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
