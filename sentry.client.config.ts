import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance tracing — sample 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay — capture 5% of sessions, 100% on error
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Disable in development to avoid noise
    enabled: process.env.NODE_ENV === 'production',

    environment: process.env.NODE_ENV,

    // Release is injected by CI via NEXT_PUBLIC_SENTRY_RELEASE
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Ignore common noisy errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors that are user/network problems, not code bugs
      'ChunkLoadError',
      'Loading chunk',
      // Safari-specific
      "Can't find variable: __gCrWeb",
      // Random plugins/extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
    ],

    beforeSend(event) {
      // Strip any PII that might leak into error messages
      if (event.request?.url) {
        // Remove query params that might contain sensitive data
        try {
          const url = new URL(event.request.url)
          url.search = ''
          event.request.url = url.toString()
        } catch {
          // ignore invalid URLs
        }
      }
      return event
    },
  })
}
