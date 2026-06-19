import '@testing-library/jest-dom'

// ── Browser API stubs (jsdom does not implement these) ─────────────────────

// vi.fn() used as a constructor requires 'function' (not arrow) syntax.
global.IntersectionObserver = vi.fn(function MockIntersectionObserver(
  callback: IntersectionObserverCallback,
) {
  return {
    observe:     vi.fn(),
    unobserve:   vi.fn(),
    disconnect:  vi.fn(),
    takeRecords: vi.fn((): IntersectionObserverEntry[] => []),
    root:        null as Element | null,
    rootMargin:  '',
    thresholds:  [] as number[],
    // Test helper — fire the observer callback with synthetic entries.
    _fire(entries: Partial<IntersectionObserverEntry>[]) {
      callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
    },
  }
}) as unknown as typeof IntersectionObserver

// requestAnimationFrame: let jsdom's implementation run normally.
// Tests that need to control RAF should use vi.useFakeTimers() locally.

// ── Module mocks ───────────────────────────────────────────────────────────

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))
