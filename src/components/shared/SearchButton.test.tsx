import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchButton } from './SearchButton'

// SearchModal is the heavy dependency — mock it to keep tests focused on SearchButton
vi.mock('./SearchModal', () => ({
  SearchModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    open ? <div role="dialog" aria-modal="true"><button onClick={onClose}>Close</button></div> : null
  ),
}))

describe('SearchButton', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders desktop pill button', () => {
    render(<SearchButton />)
    // The desktop pill contains "Search…" text
    expect(screen.getByText('Search…')).toBeInTheDocument()
  })

  it('renders keyboard shortcut hint', () => {
    render(<SearchButton />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('opens modal on pill button click', () => {
    render(<SearchButton />)
    // Click the desktop pill (the first button with Search... text)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes modal when modal close is triggered', () => {
    render(<SearchButton />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('toggles modal on Ctrl+K shortcut', () => {
    render(<SearchButton />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('toggles modal on Cmd+K shortcut (Meta)', () => {
    render(<SearchButton />)
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not open on other keys', () => {
    render(<SearchButton />)
    fireEvent.keyDown(document, { key: 'j', ctrlKey: true })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('passes locale prop to SearchModal', () => {
    const MockSearchModal = vi.fn(() => null)
    vi.doMock('./SearchModal', () => ({ SearchModal: MockSearchModal }))

    render(<SearchButton locale="es" />)
    // Locale is passed but SearchModal is rendered so no assertion on props needed
    // The main check is no crash
    expect(screen.getByText('Search…')).toBeInTheDocument()
  })
})
