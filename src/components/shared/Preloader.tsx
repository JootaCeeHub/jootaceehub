'use client'

import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import { useTranslations } from '@/lib/i18n/context'

interface PreloaderProps {
  onComplete?: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const t = useTranslations('preloader')
  const [progress,  setProgress]  = useState(0)
  const [fadeOut,   setFadeOut]   = useState(false)

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: 0.45,
      ease: 'easeInOut',
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => setFadeOut(true),
    })
    return () => controls.stop()
  }, [])

  // After the fade-out transition fires onComplete
  useEffect(() => {
    if (!fadeOut) return
    const id = setTimeout(() => onComplete?.(), 260)
    return () => clearTimeout(id)
  }, [fadeOut, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      role="status"
      aria-live="polite"
      aria-label={t('initializing') as string}
    >
      <div className="flex flex-col items-center gap-8">
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
            <span>{t('initializing') as string}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[1px] w-full bg-border overflow-hidden">
            <motion.div
              className="h-full w-full origin-left bg-gradient-to-r from-primary via-cyan-300 to-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.03 }}
            />
          </div>
        </div>

        <div className="space-y-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
          <p>{t('role') as string}</p>
          <p>{t('version') as string}</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 terminal-scan opacity-30" />
    </motion.div>
  )
}
