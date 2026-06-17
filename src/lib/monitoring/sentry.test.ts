import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @sentry/nextjs before importing our wrapper
vi.mock('@sentry/nextjs', () => ({
  withScope:        vi.fn((fn) => fn({ setExtras: vi.fn() })),
  captureException: vi.fn(),
  captureMessage:   vi.fn(),
  addBreadcrumb:    vi.fn(),
  setUser:          vi.fn(),
  startSpan:        vi.fn((_opts, fn) => fn()),
  ErrorBoundary:    vi.fn(),
  withErrorBoundary:vi.fn(),
}))

const sentrySDK = await import('@sentry/nextjs')

describe('captureException', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('does not call Sentry when DSN is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '')
    const { captureException } = await import('./sentry')
    captureException(new Error('test'))
    expect(sentrySDK.captureException).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('calls Sentry captureException when DSN is present', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://test@sentry.io/123')
    const { captureException } = await import('./sentry')
    captureException(new Error('test'), { component: 'TestComponent' })
    expect(sentrySDK.withScope).toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})

describe('captureMessage', () => {
  it('does not call Sentry when DSN is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '')
    const { captureMessage } = await import('./sentry')
    captureMessage('hello')
    expect(sentrySDK.captureMessage).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})

describe('addBreadcrumb', () => {
  it('calls Sentry addBreadcrumb when DSN present', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://test@sentry.io/123')
    const { addBreadcrumb } = await import('./sentry')
    addBreadcrumb('User clicked', 'ui', { button: 'subscribe' })
    expect(sentrySDK.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User clicked', category: 'ui' })
    )
    vi.unstubAllEnvs()
  })
})

describe('setUser', () => {
  it('calls Sentry setUser when DSN present', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://test@sentry.io/123')
    const { setUser } = await import('./sentry')
    setUser({ id: 'user-123', email: 'test@example.com' })
    expect(sentrySDK.setUser).toHaveBeenCalledWith({ id: 'user-123', email: 'test@example.com' })
    vi.unstubAllEnvs()
  })

  it('clears user on setUser(null)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://test@sentry.io/123')
    const { setUser } = await import('./sentry')
    setUser(null)
    expect(sentrySDK.setUser).toHaveBeenCalledWith(null)
    vi.unstubAllEnvs()
  })
})

describe('withSpan', () => {
  it('executes the callback directly when DSN is absent', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '')
    const { withSpan } = await import('./sentry')
    const mockFn = vi.fn().mockReturnValue('result')
    const result = withSpan('test', 'op', mockFn)
    expect(mockFn).toHaveBeenCalled()
    expect(result).toBe('result')
    vi.unstubAllEnvs()
  })
})
