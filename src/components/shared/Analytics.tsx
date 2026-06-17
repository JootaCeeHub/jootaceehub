'use client'

import Script from 'next/script'

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
const PLAUSIBLE_SRC    = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? 'https://plausible.io/js/script.js'

/**
 * Plausible Analytics — privacy-first, GDPR-compliant, no cookies.
 * Only renders when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 *
 * Usage in root layout:
 *   <Analytics />
 *
 * Custom events (client components):
 *   plausible('Download', { props: { format: 'pdf' } })
 */
export function Analytics() {
  if (!PLAUSIBLE_DOMAIN) return null

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src={PLAUSIBLE_SRC}
      strategy="afterInteractive"
    />
  )
}

/**
 * Fire a custom Plausible event from any client component.
 * Safe to call when Plausible is not loaded — no-ops gracefully.
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return
  const w = window as typeof window & { plausible?: (e: string, o?: { props?: typeof props }) => void }
  w.plausible?.(eventName, props ? { props } : undefined)
}
