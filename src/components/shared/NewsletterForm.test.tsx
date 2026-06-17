import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsletterForm } from './NewsletterForm'

// Mock the subscribe function
vi.mock('@/lib/newsletter/subscribe', () => ({
  subscribe: vi.fn(),
}))

import { subscribe } from '@/lib/newsletter/subscribe'
const mockSubscribe = vi.mocked(subscribe)

describe('NewsletterForm — inline variant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input and submit button', () => {
    render(<NewsletterForm />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument()
  })

  it('disables submit button when email is empty', () => {
    render(<NewsletterForm />)
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeDisabled()
  })

  it('enables submit button when email is typed', async () => {
    const user = userEvent.setup()
    render(<NewsletterForm />)
    await user.type(screen.getByRole('textbox'), 'test@example.com')
    expect(screen.getByRole('button', { name: /subscribe/i })).not.toBeDisabled()
  })

  it('calls subscribe with the entered email on submit', async () => {
    mockSubscribe.mockResolvedValue({ status: 'success', message: 'Check your email!' })
    const user = userEvent.setup()
    render(<NewsletterForm source="test" />)

    await user.type(screen.getByRole('textbox'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    expect(mockSubscribe).toHaveBeenCalledWith('user@example.com', 'test')
  })

  it('shows success message after successful subscription', async () => {
    mockSubscribe.mockResolvedValue({ status: 'success', message: 'Check your email!' })
    const user = userEvent.setup()
    render(<NewsletterForm />)

    await user.type(screen.getByRole('textbox'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText('Check your email!')).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    mockSubscribe.mockResolvedValue({ status: 'error', message: 'Something went wrong.' })
    const user = userEvent.setup()
    render(<NewsletterForm />)

    await user.type(screen.getByRole('textbox'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })
  })

  it('shows already subscribed message', async () => {
    mockSubscribe.mockResolvedValue({ status: 'already_subscribed', message: "You're already subscribed." })
    const user = userEvent.setup()
    render(<NewsletterForm />)

    await user.type(screen.getByRole('textbox'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => {
      expect(screen.getByText("You're already subscribed.")).toBeInTheDocument()
    })
  })

  it('disables input while loading', async () => {
    let resolve!: (v: Awaited<ReturnType<typeof subscribe>>) => void
    mockSubscribe.mockReturnValue(new Promise((r) => { resolve = r }))
    const user = userEvent.setup()
    render(<NewsletterForm />)

    await user.type(screen.getByRole('textbox'), 'user@example.com')
    fireEvent.submit(screen.getByRole('button', { name: /subscribe/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    resolve({ status: 'success', message: 'Done!' })
  })
})

describe('NewsletterForm — card variant', () => {
  it('renders title and subtitle in card mode', () => {
    render(<NewsletterForm variant="card" title="Get Updates" subtitle="Weekly insights" />)
    expect(screen.getByText('Get Updates')).toBeInTheDocument()
    expect(screen.getByText('Weekly insights')).toBeInTheDocument()
  })

  it('renders disclaimer text', () => {
    render(<NewsletterForm variant="card" disclaimer="No spam ever." />)
    expect(screen.getByText('No spam ever.')).toBeInTheDocument()
  })
})
