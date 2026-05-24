import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'

describe('ErrorFallback', () => {
  it('renders error title and buttons', () => {
    render(
      <ErrorFallback
        error={new Error('Test crash')}
        resetErrorBoundary={vi.fn()}
      />
    )

    expect(screen.getByText('System Error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument()
  })

  it('calls resetErrorBoundary when retry is clicked', () => {
    const reset = vi.fn()
    render(
      <ErrorFallback
        error={new Error('Test crash')}
        resetErrorBoundary={reset}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('toggles technical details', () => {
    render(
      <ErrorFallback
        error={new Error('Secret error')}
        resetErrorBoundary={vi.fn()}
      />
    )

    expect(screen.queryByText(/Secret error/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /show technical details/i }))
    expect(screen.getByText(/Secret error/)).toBeInTheDocument()
  })
})
