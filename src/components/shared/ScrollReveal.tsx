'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease: 'power3.out',
    }

    if (direction === 'up') fromVars.y = distance
    if (direction === 'down') fromVars.y = -distance
    if (direction === 'left') fromVars.x = distance
    if (direction === 'right') fromVars.x = -distance

    const tween = gsap.from(el, {
      ...fromVars,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: 'top 20%',
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
      },
    })

    return () => {
      tween.kill()
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [direction, delay, duration, distance, once])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
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

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.children
    if (!children.length) return

    const tween = gsap.from(children, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })

    return () => {
      tween.kill()
    }
  }, [stagger, delay])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
