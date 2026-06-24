import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReaderMode } from './useReaderMode'

const HTML_ATTR = 'data-reader-mode'

describe('useReaderMode', () => {
  beforeEach(() => {
    sessionStorage.clear()
    document.documentElement.removeAttribute(HTML_ATTR)
  })

  afterEach(() => {
    sessionStorage.clear()
    document.documentElement.removeAttribute(HTML_ATTR)
  })

  it('starts with readerMode false', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(result.current.readerMode).toBe(false)
  })

  it('toggleReaderMode flips readerMode to true', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.toggleReaderMode())
    expect(result.current.readerMode).toBe(true)
  })

  it('sets data-reader-mode on <html> when enabled', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.toggleReaderMode())
    expect(document.documentElement.getAttribute(HTML_ATTR)).toBe('true')
  })

  it('removes data-reader-mode from <html> when disabled', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.toggleReaderMode()) // on
    act(() => result.current.toggleReaderMode()) // off
    expect(document.documentElement.hasAttribute(HTML_ATTR)).toBe(false)
  })

  it('persists state to sessionStorage', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    act(() => result.current.toggleReaderMode())
    expect(sessionStorage.getItem('jc-reader-mode')).toBe('1')
  })

  it('restores state from sessionStorage on remount', async () => {
    sessionStorage.setItem('jc-reader-mode', '1')
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect(result.current.readerMode).toBe(true)
  })

  it('Alt+R keyboard shortcut toggles reader mode', async () => {
    const { result } = renderHook(() => useReaderMode())
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }))
    })
    expect(result.current.readerMode).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', altKey: true, bubbles: true }))
    })
    expect(result.current.readerMode).toBe(false)
  })
})
