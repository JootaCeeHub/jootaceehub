/**
 * Sentry edge runtime configuration.
 * Used by Next.js middleware running in the Vercel/Cloudflare edge runtime.
 *
 * For this project: output is 'export' so there is no edge middleware.
 * This file is included for completeness and future compatibility.
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.05,
    enabled: !!SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  })
}
