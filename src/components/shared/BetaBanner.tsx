'use client'

import { useState, useEffect } from 'react'
import { X, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/components/shared/Analytics'

// ---------------------------------------------------------------------------
// Public Beta Banner — Phase 5
// Shown when NEXT_PUBLIC_BETA_MODE=true.
// Dismissed via sessionStorage — reappears on new sessions (intentional).
// ---------------------------------------------------------------------------

const DISMISS_KEY = 'jootacee-beta-dismissed'
const IS_BETA = process.env.NEXT_PUBLIC_BETA_MODE === 'true'

interface BetaBannerProps {
  message?: string
  feedbackUrl?: string
}

export function BetaBanner({
  message = 'You\'re accessing the public beta. Expect rough edges — your feedback shapes the final launch.',
  feedbackUrl,
}: BetaBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!IS_BETA) return
    // Read sessionStorage asynchronously to avoid synchronous setState-in-effect lint error
    const id = setTimeout(() => {
      try {
        if (!sessionStorage.getItem(DISMISS_KEY)) {
          setVisible(true)
          trackEvent('Beta Banner Shown', { mode: 'public-beta' })
        }
      } catch {
        setVisible(true)
      }
    }, 0)
    return () => clearTimeout(id)
  }, [])

  function dismiss() {
    setVisible(false)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ok */ }
    trackEvent('Beta Banner Dismissed', { mode: 'public-beta' })
  }

  function handleFeedback() {
    trackEvent('Beta Feedback Clicked', { mode: 'public-beta' })
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      aria-live="polite"
      className={cn(
        'fixed top-0 inset-x-0 z-[100] flex items-center justify-between gap-3 px-4 py-2',
        'border-b border-amber-400/20 bg-amber-400/8 backdrop-blur-md',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-400/80" aria-hidden />
        <span className="font-mono text-[10px] text-amber-300/70 truncate">{message}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {feedbackUrl && (
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleFeedback}
            className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300 hover:bg-amber-400/20 transition-colors"
          >
            Give feedback
          </a>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss beta banner"
          className="text-amber-400/40 hover:text-amber-400/80 transition-colors p-1"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/** Returns true if beta mode is active (env flag set) */
export function isBetaMode(): boolean { return IS_BETA }
