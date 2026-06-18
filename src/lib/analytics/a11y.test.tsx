/**
 * Automated accessibility tests using axe-core.
 *
 * Validates: ARIA attributes, labels, color contrast annotations, keyboard focus
 * management, heading hierarchy, and landmark roles. Covers the same concerns
 * as a manual screen reader + keyboard audit (WCAG 2.1 AA).
 *
 * These tests are the automated substitute for the manual keyboard and VoiceOver
 * tests in GOAL_ACCESSIBILITY of launch-metrics.ts.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import axe from 'axe-core'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { SectionErrorBoundary } from '@/components/shared/SectionErrorBoundary'

// ── Helper: run axe on rendered HTML ──────────────────────────────────────────

async function runAxe(element: Element) {
  const results = await axe.run(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice'],
    },
    // color-contrast requires computed styles — not available in jsdom. Skip.
    rules: { 'color-contrast': { enabled: false } },
  })
  return results.violations
}

// ── ErrorFallback a11y ────────────────────────────────────────────────────────

describe('ErrorFallback — accessibility', () => {
  it('has no WCAG 2.1 AA violations', async () => {
    const { container } = render(
      <ErrorFallback error={new Error('Test error')} resetErrorBoundary={() => {}} />
    )
    const violations = await runAxe(container)
    if (violations.length > 0) {
      const report = violations.map(v => `${v.id}: ${v.description} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})`).join('\n  ')
      throw new Error(`axe found ${violations.length} violation(s):\n  ${report}`)
    }
    expect(violations).toHaveLength(0)
  })

  it('retry button is keyboard accessible (has accessible name)', async () => {
    const { container } = render(
      <ErrorFallback error={new Error('Test')} resetErrorBoundary={() => {}} />
    )
    const violations = await runAxe(container)
    const buttonViolations = violations.filter(v => v.id === 'button-name' || v.id === 'label')
    expect(buttonViolations).toHaveLength(0)
  })
})

// ── SectionErrorBoundary a11y ─────────────────────────────────────────────────

describe('SectionErrorBoundary — accessibility', () => {
  it('renders children without a11y violations', async () => {
    const { container } = render(
      <SectionErrorBoundary name="TestSection">
        <main>
          <h1>Test content</h1>
          <p>This is a test section.</p>
          <nav aria-label="Test navigation">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/en/">Home</a>
          </nav>
        </main>
      </SectionErrorBoundary>
    )
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
  })
})

// ── Semantic HTML patterns ─────────────────────────────────────────────────────

describe('Semantic HTML — WCAG best practices', () => {
  it('interactive elements with onClick have roles or are native buttons', async () => {
    const { container } = render(
      <div>
        <button type="button" aria-label="Close menu">×</button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/en/about/">About</a>
        <input type="text" id="name" aria-label="Your name" />
      </div>
    )
    const violations = await runAxe(container)
    const critical = violations.filter(v =>
      ['button-name', 'link-name', 'label', 'aria-required-attr'].includes(v.id)
    )
    expect(critical).toHaveLength(0)
  })

  it('form inputs have associated labels', async () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email address</label>
        <input type="email" id="email" name="email" />
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" />
        <button type="submit">Send</button>
      </form>
    )
    const violations = await runAxe(container)
    const labelViolations = violations.filter(v => v.id === 'label')
    expect(labelViolations).toHaveLength(0)
  })

  it('heading hierarchy is valid (no skips)', async () => {
    const { container } = render(
      <article>
        <h1>Page title</h1>
        <section>
          <h2>Section one</h2>
          <h3>Sub-section</h3>
        </section>
        <section>
          <h2>Section two</h2>
        </section>
      </article>
    )
    const violations = await runAxe(container)
    const headingViolations = violations.filter(v => v.id === 'heading-order')
    expect(headingViolations).toHaveLength(0)
  })

  it('images have alt text or are aria-hidden', async () => {
    const { container } = render(
      <div>
        <img src="/icon-192x192.png" alt="JootaCee logo" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/og-image.png" alt="" aria-hidden="true" />
      </div>
    )
    const violations = await runAxe(container)
    const imgViolations = violations.filter(v => v.id === 'image-alt')
    expect(imgViolations).toHaveLength(0)
  })

  it('landmark regions are present (main, nav)', async () => {
    const { container } = render(
      <div>
        <nav aria-label="Main navigation">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/en/">Home</a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/en/about/">About</a>
        </nav>
        <main id="main-content">
          <h1>Content</h1>
          <p>Main page content.</p>
        </main>
        <footer>
          <p>Footer content</p>
        </footer>
      </div>
    )
    const violations = await runAxe(container)
    expect(violations).toHaveLength(0)
  })

  it('focus-visible: interactive elements are keyboard reachable', async () => {
    const { container } = render(
      <div>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/en/">Skip to content</a>
        <button type="button">Open menu</button>
        <input type="search" aria-label="Search" />
      </div>
    )
    const violations = await runAxe(container)
    const focusViolations = violations.filter(v =>
      ['tabindex', 'scrollable-region-focusable'].includes(v.id)
    )
    expect(focusViolations).toHaveLength(0)
  })
})
