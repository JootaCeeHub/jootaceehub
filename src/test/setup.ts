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

// Mock @supabase/supabase-js so tests never need real credentials.
// Individual test files can override this with vi.mock('@/lib/supabase/client').
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      insert: async () => ({ data: null, error: null }),
      update: () => ({ eq: async () => ({ data: null, error: null }) }),
      upsert: () => ({ onConflict: async () => ({ data: null, error: null }) }),
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}))

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
