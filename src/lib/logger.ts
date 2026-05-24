/**
 * Safe logger that silences known upstream warnings in production
 * and provides a unified log surface for the application.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const CURRENT_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) ?? 'warn'
    : 'debug'

function shouldLog(level: LogLevel) {
  return LEVELS[level] >= LEVELS[CURRENT_LEVEL]
}

/** Patterns that are known upstream noise and should be dropped. */
const SILENCED_PATTERNS = [
  /THREE\.Clock.*deprecated/i,
  /Detected `scroll-behavior: smooth`/i,
]

function isSilenced(message: unknown) {
  const text = typeof message === 'string' ? message : String(message)
  return SILENCED_PATTERNS.some((p) => p.test(text))
}

export const logger = {
  debug: (message: unknown, ...rest: unknown[]) => {
    if (!shouldLog('debug') || isSilenced(message)) return
    // eslint-disable-next-line no-console
    console.debug('[debug]', message, ...rest)
  },
  info: (message: unknown, ...rest: unknown[]) => {
    if (!shouldLog('info') || isSilenced(message)) return
    // eslint-disable-next-line no-console
    console.info('[info]', message, ...rest)
  },
  warn: (message: unknown, ...rest: unknown[]) => {
    if (!shouldLog('warn') || isSilenced(message)) return
    // eslint-disable-next-line no-console
    console.warn('[warn]', message, ...rest)
  },
  error: (message: unknown, ...rest: unknown[]) => {
    if (!shouldLog('error')) return
    // eslint-disable-next-line no-console
    console.error('[error]', message, ...rest)
  },
}

/**
 * Patch console in the browser to globally drop silenced warnings.
 * Call once at app startup (e.g. in layout.tsx or a provider).
 */
export function installConsoleFilter() {
  if (typeof window === 'undefined') return

  const originalWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (args.some((a) => isSilenced(a))) return
    originalWarn.apply(console, args)
  }
}
