import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollReveal, StaggerReveal } from './ScrollReveal'

// framer-motion: stub useInView to return true (immediately visible)
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  return {
    ...actual,
    useInView: () => true,
  }
})

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(
      <ScrollReveal>
        <span data-testid="child">hello</span>
      </ScrollReveal>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('accepts a custom className', () => {
    const { container } = render(
      <ScrollReveal className="custom-class">
        <span>content</span>
      </ScrollReveal>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with all direction variants without errors', () => {
    const directions = ['up', 'down', 'left', 'right'] as const
    for (const direction of directions) {
      const { unmount } = render(
        <ScrollReveal direction={direction}>
          <span>{direction}</span>
        </ScrollReveal>
      )
      expect(screen.getByText(direction)).toBeInTheDocument()
      unmount()
    }
  })

  it('does not throw with custom delay and duration', () => {
    expect(() =>
      render(
        <ScrollReveal delay={0.5} duration={1.2} distance={60}>
          <span>animated</span>
        </ScrollReveal>
      )
    ).not.toThrow()
  })
})

describe('StaggerReveal', () => {
  it('renders all children', () => {
    render(
      <StaggerReveal>
        <span data-testid="a">first</span>
        <span data-testid="b">second</span>
        <span data-testid="c">third</span>
      </StaggerReveal>
    )
    expect(screen.getByTestId('a')).toBeInTheDocument()
    expect(screen.getByTestId('b')).toBeInTheDocument()
    expect(screen.getByTestId('c')).toBeInTheDocument()
  })

  it('accepts stagger and delay props without errors', () => {
    expect(() =>
      render(
        <StaggerReveal stagger={0.15} delay={0.3}>
          <span>item 1</span>
          <span>item 2</span>
        </StaggerReveal>
      )
    ).not.toThrow()
  })

  it('accepts a custom className', () => {
    const { container } = render(
      <StaggerReveal className="stagger-wrapper">
        <span>item</span>
      </StaggerReveal>
    )
    expect(container.firstChild).toHaveClass('stagger-wrapper')
  })

  it('wraps each child in its own motion container', () => {
    const { container } = render(
      <StaggerReveal>
        <span>a</span>
        <span>b</span>
      </StaggerReveal>
    )
    // container > motion.div (wrapper) > motion.div × 2 (item wrappers)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(2)
  })
})
