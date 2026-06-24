/**
 * Sentry server-side configuration.
 * This file is auto-loaded by @sentry/nextjs on the Node.js runtime.
 *
 * For a static export (`output: 'export'`) there is no server runtime at
 * serve time, but Next.js still runs in Node.js during `next build`. This
 * config captures any build-time errors and instruments SSG data-fetch
 * functions (getStaticProps / generateStaticParams).
 */
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Low sample rate — build-time spans are not worth high overhead
    tracesSampleRate: 0.05,

    // Static export: no server-side replay or profiling
    enabled: !!SENTRY_DSN,

    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

    // Ignore noise from Node.js internals during build
    ignoreErrors: [
      'ECONNREFUSED',
      'ENOTFOUND',
      'FetchError',
    ],
  })
}
