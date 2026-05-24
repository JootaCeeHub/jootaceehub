'use client'

import React from 'react'
import { ErrorFallback } from './ErrorFallback'
import { reportError } from '@/lib/error'

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
    reportError(error, {
      section: this.props.sectionName,
      componentStack: errorInfo.componentStack,
    })
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
