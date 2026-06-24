/**
 * Enterprise error taxonomy.
 * Every thrown error should carry a code, severity, and optional metadata
 * so that monitoring/alerting can route and aggregate intelligently.
 */

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'
export type ErrorCode =
  | 'I18N_MISSING_KEY'
  | 'I18N_PROVIDER_MISSING'
  | 'RENDER_BOUNDARY'
  | 'ASSET_LOAD_FAIL'
  | 'TELEMETRY_TIMEOUT'
  | 'UNKNOWN'

interface AppErrorOptions {
  code: ErrorCode
  severity?: ErrorSeverity
  context?: Record<string, unknown>
  cause?: unknown
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly severity: ErrorSeverity
  readonly context?: Record<string, unknown>
  readonly timestamp: string

  constructor(message: string, options: AppErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.code = options.code
    this.severity = options.severity ?? 'error'
    this.context = options.context
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause,
    }
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}

/**
 * Safe error reporter. Routes to Sentry in production, console in dev.
 * Never throws — safe to call from error boundaries and catch blocks.
 */
export function reportError(err: unknown, context?: Record<string, unknown>) {
  try {
    if (isAppError(err)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AppError]', err.toJSON()) // ok — dev-only error sink
      }
      // Route to Sentry — dynamic import keeps bundle clean when DSN is absent
      if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
        import('@/lib/monitoring/sentry').then(({ captureException }) =>
          captureException(err, { ...err.context, ...context })
        )
      }
      return
    }

    const normalized =
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : { name: 'Unknown', message: String(err), stack: undefined }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Unhandled]', { ...normalized, context }) // ok — dev-only error sink
    }

    if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof window !== 'undefined') {
      import('@/lib/monitoring/sentry').then(({ captureException }) =>
        captureException(err instanceof Error ? err : new Error(String(err)), context)
      )
    }
  } catch {
    // Reporting must never throw.
  }
}
