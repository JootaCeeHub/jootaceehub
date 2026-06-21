'use client'

import { startTransition, useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'jc-reader-mode'
const HTML_ATTR   = 'data-reader-mode'

/** Reads initial state from sessionStorage — avoids a flash on route change */
function read(): boolean {
  try { return sessionStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

function write(value: boolean): void {
  try { sessionStorage.setItem(STORAGE_KEY, value ? '1' : '0') } catch { /**/ }
}

function applyToDOM(enabled: boolean): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  if (enabled) {
    html.setAttribute(HTML_ATTR, 'true')
  } else {
    html.removeAttribute(HTML_ATTR)
  }
}

/**
 * Reader Mode — strips non-essential visuals for distraction-free reading.
 *
 * When active:
 * - Sets `data-reader-mode="true"` on `<html>` (targeted by globals.css)
 * - Hides 3D canvas, VisualEffectsLayer, parallax gradients
 * - Silences all CSS transitions and animations
 * - Persists across route changes (sessionStorage, not localStorage)
 *
 * Toggle via keyboard: Alt+R
 */
export function useReaderMode(): { readerMode: boolean; toggleReaderMode: () => void } {
  const [readerMode, setReaderMode] = useState(false)

  // Sync from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = read()
    applyToDOM(stored)
    startTransition(() => setReaderMode(stored))
  }, [])

  // Keyboard shortcut: Alt+R
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setReaderMode(prev => {
          const next = !prev
          write(next)
          applyToDOM(next)
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleReaderMode = useCallback(() => {
    setReaderMode(prev => {
      const next = !prev
      write(next)
      applyToDOM(next)
      return next
    })
  }, [])

  return { readerMode, toggleReaderMode }
}
