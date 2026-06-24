'use client'

import React from 'react'
import { ErrorFallback } from './ErrorFallback'
import { reportError } from '@/lib/error'
import { captureException, addBreadcrumb } from '@/lib/monitoring/sentry'

interface SectionErrorBoundaryProps {
  children: React.ReactNode
  sectionName: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, State> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const ctx = {
      section: this.props.sectionName,
      componentStack: errorInfo.componentStack,
    }
    // 1. Internal error taxonomy (logs + reportError routing)
    reportError(error, ctx)
    // 2. Sentry — adds section + component stack to the event
    addBreadcrumb(`Section crashed: ${this.props.sectionName}`, 'ui.error')
    captureException(error, ctx)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="relative py-12">
          <div className="container mx-auto px-6">
            <ErrorFallback
              error={this.state.error!}
              resetErrorBoundary={() => this.setState({ hasError: false })}
              title={`${this.props.sectionName} Unavailable`}
              description="This section failed to render. You can retry or continue browsing the rest of the page."
            />
          </div>
        </section>
      )
    }

    return this.props.children
  }
}
