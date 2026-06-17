'use client'

import { useRef, Children } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

// GSAP + ScrollTrigger replaced with framer-motion useInView + motion.div.
// Same props, same scroll-trigger behaviour, zero extra bundle weight
// (framer-motion is already in the critical bundle for other animations).

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 40,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: '-12% 0px' })

  const offset =
    direction === 'up'    ? { y:  distance } :
    direction === 'down'  ? { y: -distance } :
    direction === 'left'  ? { x:  distance } :
                            { x: -distance }

  const reset = direction === 'up' || direction === 'down' ? { y: 0 } : { x: 0 }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      animate={inView ? { opacity: 1, ...reset } : { opacity: 0, ...offset }}
      transition={{ duration, delay, ease: [0.215, 0.61, 0.355, 1.0] }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.1,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1.0] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
