'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { reportError } from '@/lib/error'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'System Error',
  description = 'An unexpected problem occurred. The error has been logged and the team notified.',
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 inline-flex rounded-full border border-amber-400/30 bg-amber-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {resetErrorBoundary && (
          <button
            type="button"
            onClick={() => {
              try {
                resetErrorBoundary()
              } catch (err) {
                reportError(err, { action: 'resetErrorBoundary' })
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
        <Link
          href="/en"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card/80"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((s) => !s)}
        className="mt-4 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        {showDetails ? 'Hide details' : 'Show technical details'}
      </button>

      {showDetails && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-lg border border-border bg-card/60 p-4 text-left text-xs text-muted-foreground">
          <code>
            {error.name}: {error.message}
            {'\n'}
            {error.stack}
          </code>
        </pre>
      )}
    </div>
  )
}
