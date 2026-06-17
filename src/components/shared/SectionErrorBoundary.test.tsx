import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SectionErrorBoundary } from './SectionErrorBoundary'

// Suppress expected React error-boundary console.error noise
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalError
})

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('test-explosion')
  return <span data-testid="safe-content">safe</span>
}

describe('SectionErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <SectionErrorBoundary sectionName="Hero">
        <span data-testid="child">content</span>
      </SectionErrorBoundary>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders error fallback when child throws', () => {
    render(
      <SectionErrorBoundary sectionName="Systems">
        <Bomb shouldThrow />
      </SectionErrorBoundary>
    )
    expect(screen.getByText(/Systems Unavailable/i)).toBeInTheDocument()
  })

  it('includes the section name in the fallback title', () => {
    render(
      <SectionErrorBoundary sectionName="Labs">
        <Bomb shouldThrow />
      </SectionErrorBoundary>
    )
    expect(screen.getByText(/Labs Unavailable/i)).toBeInTheDocument()
  })

  it('does not render children after error', () => {
    render(
      <SectionErrorBoundary sectionName="GitHub">
        <Bomb shouldThrow />
      </SectionErrorBoundary>
    )
    expect(screen.queryByTestId('safe-content')).not.toBeInTheDocument()
  })

  it('resets and re-renders children when retry is clicked', () => {
    let shouldThrow = true

    function Toggleable() {
      if (shouldThrow) throw new Error('recoverable')
      return <span data-testid="recovered">recovered</span>
    }

    render(
      <SectionErrorBoundary sectionName="About">
        <Toggleable />
      </SectionErrorBoundary>
    )

    expect(screen.queryByTestId('recovered')).not.toBeInTheDocument()

    // Fix the error condition then retry
    shouldThrow = false
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    expect(screen.getByTestId('recovered')).toBeInTheDocument()
  })

  it('renders multiple children correctly when no error', () => {
    render(
      <SectionErrorBoundary sectionName="Contact">
        <p data-testid="a">first</p>
        <p data-testid="b">second</p>
      </SectionErrorBoundary>
    )
    expect(screen.getByTestId('a')).toBeInTheDocument()
    expect(screen.getByTestId('b')).toBeInTheDocument()
  })
})
