'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const posRef = useRef({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(isTouchDevice)
    if (isTouchDevice) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Inject global cursor styles
    const styleId = 'custom-cursor-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @media (hover: hover) and (pointer: fine) {
          body.custom-cursor-active, body.custom-cursor-active * {
            cursor: none !important;
          }
        }
      `
      document.head.appendChild(style)
      document.body.classList.add('custom-cursor-active')
    }

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power2.out' })
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, ease: 'power2.out' })
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)

    const onMouseDown = () => {
      gsap.to(dot, { scale: 0.6, duration: 0.15 })
      gsap.to(ring, { scale: 0.8, duration: 0.15 })
    }

    const onMouseUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.15 })
      gsap.to(ring, { scale: 1, duration: 0.15 })
    }

    const detectPointer = () => {
      const el = document.elementFromPoint(posRef.current.x, posRef.current.y)
      const isPointerEl =
        el?.tagName === 'BUTTON' ||
        el?.tagName === 'A' ||
        el?.closest('button') ||
        el?.closest('a') ||
        (el as HTMLElement)?.style?.cursor === 'pointer'
      setIsPointer(!!isPointerEl)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseover', detectPointer)

    const attachListeners = () => {
      const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, textarea')
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive)
        el.addEventListener('mouseleave', onLeaveInteractive)
      })
    }

    attachListeners()

    const observer = new MutationObserver(() => {
      attachListeners()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseover', detectPointer)
      observer.disconnect()
      document.body.classList.remove('custom-cursor-active')
      const s = document.getElementById(styleId)
      if (s) s.remove()
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="h-2 w-2 rounded-full bg-primary transition-transform duration-150"
          style={{
            transform: `scale(${isHovering ? 2.5 : 1})`,
            opacity: isPointer ? 1 : 0.8,
          }}
        />
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="rounded-full border border-primary/50 transition-all duration-300"
          style={{
            width: isHovering ? 48 : 32,
            height: isHovering ? 48 : 32,
            opacity: isHovering ? 0.6 : 0.3,
          }}
        />
      </div>
    </>
  )
}
