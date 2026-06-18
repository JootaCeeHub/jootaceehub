/**
 * Content Security Policy — single source of truth.
 *
 * Why 'unsafe-eval' is required:
 *   - Three.js / React Three Fiber: compiles GLSL shaders at runtime via `new Function()`
 *   - Next.js Turbopack (dev): uses eval-based source maps
 *
 * Why 'unsafe-inline' is required:
 *   - Next.js injects inline hydration scripts (cannot be nonce-based in static export)
 *   - Framer Motion inlines CSS-in-JS style blocks
 *
 * connect-src includes ws:/wss: for dev HMR; harmless in production.
 * Sentry and Plausible domains added for monitoring/analytics.
 */

const cspDirectives: Record<string, string[]> = {
  'default-src':    ["'self'"],
  'script-src':     ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                     'https://plausible.io'],
  'style-src':      ["'self'", "'unsafe-inline'"],
  'img-src':        ["'self'", 'data:', 'blob:', 'https:'],
  'font-src':       ["'self'", 'data:'],
  'connect-src':    ["'self'", 'https:', 'ws:', 'wss:',
                     'https://*.sentry.io',
                     'https://o*.ingest.sentry.io',
                     'https://plausible.io'],
  'worker-src':     ["'self'", 'blob:'],
  'frame-src':      ["'self'", 'blob:'],
  'frame-ancestors':["'none'"],
  'base-uri':       ["'self'"],
  'form-action':    ["'self'"],
  'manifest-src':   ["'self'"],
  'media-src':      ["'self'", 'blob:', 'data:'],
}

/**
 * Serialized CSP string — safe to embed directly in `content` attribute.
 * Do NOT pass through React's JSX string interpolation without
 * `dangerouslySetInnerHTML`; use as a bare string in `content={CSP_STRING}`.
 */
export const CSP_STRING = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ')
