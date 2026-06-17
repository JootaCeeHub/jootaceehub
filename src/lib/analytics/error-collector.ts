
export type ErrorType = 'js' | 'promise' | 'react' | 'console' | 'network'

export interface RuntimeError {
  id:        string
  type:      ErrorType
  message:   string
  source?:   string
  lineno?:   number
  colno?:    number
  stack?:    string
  timestamp: string
  count:     number
}

type Listener = (errors: RuntimeError[]) => void

declare global {
  interface Window {
    __analyticsNetworkFails?: { url: string; status: number; ts: string }[]
  }
}

function makeId(type: string, message: string, source = '', lineno = 0): string {
  return `${type}:${message.slice(0, 80)}:${source}:${lineno}`
}

class ErrorCollector {
  private map:         Map<string, RuntimeError> = new Map()
  private listeners:   Set<Listener>             = new Set()
  private installed    = false
  private consoleHooked = false

  install(): void {
    if (this.installed || typeof window === 'undefined') return
    this.installed = true

    // JS errors
    window.addEventListener('error', (ev) => {
      this.push({
        type:    'js',
        message: ev.message || 'Unknown JavaScript error',
        source:  ev.filename,
        lineno:  ev.lineno,
        colno:   ev.colno,
        stack:   ev.error?.stack,
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (ev) => {
      const msg = ev.reason instanceof Error
        ? ev.reason.message
        : String(ev.reason ?? 'Unhandled promise rejection')
      this.push({
        type:  'promise',
        message: msg,
        stack: ev.reason instanceof Error ? ev.reason.stack : undefined,
      })
    })

    // Network failure registry for fetch interceptor
    if (!window.__analyticsNetworkFails) {
      window.__analyticsNetworkFails = []
    }

    // Intercept global fetch for failed network requests
    this.installFetchInterceptor()
  }

  installConsoleCapture(): void {
    if (this.consoleHooked || typeof window === 'undefined') return
    this.consoleHooked = true

    const orig = console.error.bind(console)
    console.error = (...args: unknown[]) => {
      orig(...args)
      const msg = args
        .map((a) => (a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ')
        .slice(0, 300)
      // Suppress known noisy patterns
      if (/THREE\.Clock|scroll-behavior|Warning: Can't perform|ResizeObserver loop|hydrat/i.test(msg)) return
      this.push({ type: 'console', message: msg })
    }
  }

  private installFetchInterceptor(): void {
    if (typeof window === 'undefined') return
    const orig = window.fetch.bind(window)
    window.fetch = async (input, init) => {
      const res = await orig(input, init)
      if (!res.ok) {
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
        window.__analyticsNetworkFails!.push({ url: shortUrl(url), status: res.status, ts: new Date().toISOString() })
        if (window.__analyticsNetworkFails!.length > 50) window.__analyticsNetworkFails!.shift()
        if (res.status >= 500) {
          this.push({ type: 'network', message: `${res.status} ${res.statusText || 'Server Error'}`, source: shortUrl(url) })
        }
      }
      return res
    }
  }

  reportReact(message: string, stack?: string): void {
    this.push({ type: 'react', message, stack })
  }

  private push(raw: Omit<RuntimeError, 'id' | 'timestamp' | 'count'>): void {
    const id = makeId(raw.type, raw.message, raw.source, raw.lineno)
    const existing = this.map.get(id)
    if (existing) {
      existing.count++
      existing.timestamp = new Date().toISOString()
    } else {
      this.map.set(id, { id, ...raw, timestamp: new Date().toISOString(), count: 1 })
    }
    this.notify()
  }

  get(): RuntimeError[] {
    return Array.from(this.map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  clear(): void {
    this.map.clear()
    this.notify()
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify(): void {
    const list = this.get()
    this.listeners.forEach((fn) => fn(list))
  }
}

function shortUrl(url: string): string {
  try { return new URL(url).pathname } catch { return url.slice(0, 80) }
}

export const errorCollector = new ErrorCollector()
