import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

/**
 * Traps keyboard focus within the given container while `active` is true.
 * Returns a ref to attach to the container element.
 *
 * - Tab / Shift+Tab cycle through focusable children only
 * - Restores focus to the previously focused element on deactivation
 * - Moves focus into the container (first focusable child) on activation
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) {
      // Restore focus to the element that was active before the trap opened
      previousFocusRef.current?.focus()
      return
    }

    // Remember where focus was before opening
    previousFocusRef.current = document.activeElement as HTMLElement

    // Move focus into the container
    const container = containerRef.current
    if (!container) return
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE)
    firstFocusable?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return
      const focusableEls = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusableEls.length === 0) return

      const first = focusableEls[0]
      const last  = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return containerRef
}
