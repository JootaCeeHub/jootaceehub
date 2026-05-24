'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useTranslations } from '@/lib/i18n/context'

interface PreloaderProps {
  onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const t = useTranslations('preloader')
  const [progress, setProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => {
            if (containerRef.current) containerRef.current.style.display = 'none'
            onComplete?.()
          },
        })
      },
    })

    const progressObj = { value: 0 }
    tl.to(progressObj, {
      value: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        setProgress(Math.round(progressObj.value))
      },
    })

    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 2.2, ease: 'power2.inOut' },
      0
    )

    tl.to(textRef.current, { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in' }, '-=0.4')

    return () => {
      tl.kill()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label={t('initializing')}
    >
      <div ref={textRef} className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-primary/40 bg-primary/12">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,220,255,0.7),transparent_60%)]" />
              <span className="relative text-sm font-semibold text-primary">JC</span>
            </span>
            <span className="text-lg font-semibold tracking-[0.22em] text-primary/95">JOOTACEE</span>
          </div>
        </div>

        <div className="w-64">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{t('initializing')}</span>
            <span ref={progressRef}>{progress}%</span>
          </div>
          <div className="h-[1px] w-full bg-border overflow-hidden">
            <div
              ref={lineRef}
              className="h-full w-full origin-left bg-gradient-to-r from-primary via-cyan-300 to-primary"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>

        <div className="space-y-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          <p>{t('role')}</p>
          <p>{t('version')}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 terminal-scan opacity-30" />
    </div>
  )
}
