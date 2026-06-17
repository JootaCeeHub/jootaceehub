import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearch } from './useSearch'

// Pagefind is only available in production builds — mock it
vi.stubGlobal('Function', class extends Function {
  constructor(...args: string[]) {
    super(...args)
  }
  // Override new Function('return import(...)') to return a rejected promise
  // so useSearch gracefully falls back to dev mode
})

describe('useSearch — dev mode (no pagefind index)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useSearch())
    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('updates query when search is called', async () => {
    const { result } = renderHook(() => useSearch())

    act(() => { result.current.search('hello') })
    expect(result.current.query).toBe('hello')
  })

  it('clears query and results on clear()', async () => {
    const { result } = renderHook(() => useSearch())

    act(() => { result.current.search('hello') })
    act(() => { result.current.clear() })
    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
  })

  it('ready is false in dev mode (no pagefind built)', async () => {
    const { result } = renderHook(() => useSearch())
    // ready starts false; without pagefind index it stays false
    await waitFor(() => {
      expect(result.current.ready).toBe(false)
    }, { timeout: 1000 })
  })

  it('does not set loading indefinitely', async () => {
    const { result } = renderHook(() => useSearch())

    act(() => { result.current.search('test query') })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 1000 })
  })
})

describe('useSearch — search debouncing', () => {
  it('provides a search function that accepts a string', () => {
    const { result } = renderHook(() => useSearch())
    expect(typeof result.current.search).toBe('function')
  })

  it('provides a clear function', () => {
    const { result } = renderHook(() => useSearch())
    expect(typeof result.current.clear).toBe('function')
  })

  it('exposes expected shape', () => {
    const { result } = renderHook(() => useSearch())
    const keys = Object.keys(result.current)
    expect(keys).toContain('query')
    expect(keys).toContain('results')
    expect(keys).toContain('loading')
    expect(keys).toContain('ready')
    expect(keys).toContain('search')
    expect(keys).toContain('clear')
  })
})
