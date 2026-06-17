/**
 * Sentry utilities — thin wrappers that are safe to call even when Sentry
 * is not configured (NEXT_PUBLIC_SENTRY_DSN absent or empty).
 *
 * Import from here instead of @sentry/nextjs directly so the rest of the
 * codebase stays decoupled from the monitoring vendor.
 */
import * as SentrySDK from '@sentry/nextjs'

export type { SentrySDK }

/** Capture an exception with optional structured context. */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  SentrySDK.withScope((scope) => {
    if (context) {
      scope.setExtras(context)
    }
    SentrySDK.captureException(error)
  })
}

/** Capture a non-fatal message with a severity level. */
export function captureMessage(
  message: string,
  level: SentrySDK.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  SentrySDK.withScope((scope) => {
    if (context) scope.setExtras(context)
    SentrySDK.captureMessage(message, level)
  })
}

/** Add a breadcrumb to the current Sentry scope. */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  SentrySDK.addBreadcrumb({ message, category, data, level: 'info' })
}

/** Tag the current user (call on sign-in, clear on sign-out). */
export function setUser(user: { id: string; email?: string } | null): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
  SentrySDK.setUser(user)
}

/** Wrap a chunk of work in a Sentry performance span. */
export function withSpan<T>(
  name: string,
  op: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return fn()
  return SentrySDK.startSpan({ name, op }, fn)
}

/** React Error Boundary — re-export for convenience. */
export const ErrorBoundary = SentrySDK.ErrorBoundary
export const withErrorBoundary = SentrySDK.withErrorBoundary
