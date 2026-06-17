'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isTouch,    setIsTouch]    = useState(false)
  const [mounted,    setMounted]    = useState(false)
  const [visible,    setVisible]    = useState(false)

  // Use a ref to track visibility inside event handlers (avoids stale closure)
  const visibleRef = useRef(false)

  // Start off-screen so springs don't animate from 0,0
  const rawX       = useMotionValue(-200)
  const rawY       = useMotionValue(-200)
  const clickScale = useMotionValue(1)

  // Dot: extremely tight spring — virtually zero lag
  const dotX = useSpring(rawX, { stiffness: 5000, damping: 80, mass: 0.05 })
  const dotY = useSpring(rawY, { stiffness: 5000, damping: 80, mass: 0.05 })

  // Ring: loose spring — smooth trailing halo
  const ringX = useSpring(rawX, { stiffness: 260, damping: 28, mass: 0.9 })
  const ringY = useSpring(rawY, { stiffness: 260, damping: 28, mass: 0.9 })

  const dotScaleSpring = useSpring(clickScale, { stiffness: 1200, damping: 45 })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouch(isTouchDevice)
    if (isTouchDevice) return

    const styleId = 'custom-cursor-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @media (hover: hover) and (pointer: fine) {
          body.custom-cursor-active,
          body.custom-cursor-active * { cursor: none !important; }
        }
      `
      document.head.appendChild(style)
      document.body.classList.add('custom-cursor-active')
    }

    const show = () => {
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
    }
    const hide = () => {
      visibleRef.current = false
      setVisible(false)
    }

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      show()
    }

    const onMouseDown = () => clickScale.set(0.55)
    const onMouseUp   = () => clickScale.set(1)

    // Single delegated handler — O(1) per event, no MutationObserver or querySelectorAll
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setIsHovering(!!(
        t.closest('button, a, [role="button"], input, textarea, select, label') ||
        (t as HTMLElement)?.style?.cursor === 'pointer'
      ))
    }

    // Hide when mouse exits the browser viewport entirely
    const onDocLeave  = (e: MouseEvent) => { if (!e.relatedTarget) hide() }
    const onDocEnter  = () => show()

    window.addEventListener('mousemove',    onMove,      { passive: true })
    window.addEventListener('mouseover',    onMouseOver, { passive: true })
    window.addEventListener('mousedown',    onMouseDown, { passive: true })
    window.addEventListener('mouseup',      onMouseUp,   { passive: true })
    document.addEventListener('mouseleave', onDocLeave)
    document.addEventListener('mouseenter', onDocEnter)

    return () => {
      window.removeEventListener('mousemove',    onMove)
      window.removeEventListener('mouseover',    onMouseOver)
      window.removeEventListener('mousedown',    onMouseDown)
      window.removeEventListener('mouseup',      onMouseUp)
      document.removeEventListener('mouseleave', onDocLeave)
      document.removeEventListener('mouseenter', onDocEnter)
      document.body.classList.remove('custom-cursor-active')
      document.getElementById(styleId)?.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || isTouch) return null

  return (
    <>
      {/*
        Dot — bg-white + mix-blend-difference = always visible via color inversion.
        White against dark (#05060a) → near-white. White against primary (#49b7ff) → orange.
        White against white → black. Visible on EVERY background color.
      */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          scale: dotScaleSpring,
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.15, ease: 'easeOut' } }}
      >
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width:  isHovering ? 14 : 7,
            height: isHovering ? 14 : 7,
          }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Ring — trailing halo with white border (visible on all backgrounds) */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2, ease: 'easeOut' } }}
      >
        <motion.div
          className="rounded-full border border-white/35"
          animate={{
            width:   isHovering ? 44 : 28,
            height:  isHovering ? 44 : 28,
            opacity: isHovering ? 0.6 : 0.28,
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </>
  )
}
