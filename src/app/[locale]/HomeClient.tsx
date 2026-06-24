'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Navigation, Footer } from '@/components/layout'
import { StatusBar, SectionErrorBoundary } from '@/components/shared'
import { VisualEffectsLayer } from '@/components/shared/VisualEffectsLayer'
import { LazySection } from '@/components/shared/LazySection'
import { HeroSection } from '@/components/sections/HeroSection'
import { useTranslations } from '@/lib/i18n'
import { installConsoleFilter } from '@/lib/logger'
import { usePerfTier } from '@/hooks/usePerfTier'
import { useReaderMode } from '@/hooks/useReaderMode'
import { useRUM } from '@/hooks/useRUM'
import { recordSectionRender, recordSectionVisible } from '@/lib/performance/section-tracker'
import type { ArticleMeta } from '@/lib/content/loaders'

// ─── Section performance wrapper ──────────────────────────────────────────────
// Wraps each landing section to record render + visibility timing.
// Data is persisted to localStorage so the Admin > Analytics > Performance tab
// can display per-section metrics even across page navigations.

function SectionPerfWrapper({ name, children }: { name: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const recorded = useRef(false)

  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    recordSectionRender(name, performance.now())

    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          recordSectionVisible(name, performance.now())
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  // name is stable (constant literal at call site)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} data-section={name}>
      {children}
    </div>
  )
}

// Overlays — defer off critical path
const Preloader = dynamic(
  () => import('@/components/shared/Preloader').then(m => ({ default: m.Preloader })),
  { ssr: false }
)
const CommandPalette = dynamic(
  () => import('@/components/shared/CommandPalette').then(m => ({ default: m.CommandPalette })),
  { ssr: false }
)

// Below-fold section chunks.
// These are wrapped in <LazySection> so the dynamic import (and chunk download)
// only fires when the section approaches the viewport, not at page mount.
// This directly reduces initial JS parse cost and TBT.
const SystemsPreview   = dynamic(() => import('@/components/home/SystemsPreview').then(m => ({ default: m.SystemsPreview })),    { ssr: false })
const LabsPreview      = dynamic(() => import('@/components/home/LabsPreview').then(m => ({ default: m.LabsPreview })),          { ssr: false })
const InfraPreview     = dynamic(() => import('@/components/home/InfraPreview').then(m => ({ default: m.InfraPreview })),        { ssr: false })
const JournalPreview   = dynamic(() => import('@/components/home/JournalPreview').then(m => ({ default: m.JournalPreview })),    { ssr: false })
const CollaborationCTA = dynamic(() => import('@/components/home/CollaborationCTA').then(m => ({ default: m.CollaborationCTA })),{ ssr: false })

const PRELOADER_KEY = 'jc-preloader-done'

function hasSeenPreloader(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(PRELOADER_KEY) === '1'
}

interface HomeClientProps {
  featured: ArticleMeta | undefined
  recent: ArticleMeta[]
}

export function HomeClient({ featured, recent }: HomeClientProps) {
  const [showPreloader, setShowPreloader] = useState(false)
  const t = useTranslations('accessibility')
  const { tier, ready } = usePerfTier()
  useReaderMode() // installs Alt+R shortcut + restores sessionStorage state
  useRUM()        // Real User Monitoring — collects CWV + reports to Plausible

  useEffect(() => {
    installConsoleFilter()
    if (!hasSeenPreloader()) {
      setShowPreloader(true)
    }
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    sessionStorage.setItem(PRELOADER_KEY, '1')
    setShowPreloader(false)
  }, [])

  return (
    <>
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      {/* Skip GSAP background effects on low-performance devices to reduce TBT */}
      {(!ready || tier !== 'low') && <VisualEffectsLayer />}

      <div className="relative min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          {t('skipToContent')}
        </a>
        <Navigation />
        <main id="main-content">
          {/* Hero is above-fold — never lazy */}
          <SectionPerfWrapper name="hero">
            <SectionErrorBoundary sectionName="Hero">
              <HeroSection />
            </SectionErrorBoundary>
          </SectionPerfWrapper>

          {/* Below-fold: chunks download only when section nears viewport */}
          <LazySection minHeight="600px">
            <SectionPerfWrapper name="systems">
              <SectionErrorBoundary sectionName="Systems">
                <SystemsPreview />
              </SectionErrorBoundary>
            </SectionPerfWrapper>
          </LazySection>

          <LazySection minHeight="600px">
            <SectionPerfWrapper name="labs">
              <SectionErrorBoundary sectionName="Labs">
                <LabsPreview />
              </SectionErrorBoundary>
            </SectionPerfWrapper>
          </LazySection>

          <LazySection minHeight="600px">
            <SectionPerfWrapper name="infrastructure">
              <SectionErrorBoundary sectionName="Infrastructure">
                <InfraPreview />
              </SectionErrorBoundary>
            </SectionPerfWrapper>
          </LazySection>

          <LazySection minHeight="600px">
            <SectionPerfWrapper name="journal">
              <SectionErrorBoundary sectionName="Journal">
                <JournalPreview featured={featured} recent={recent} />
              </SectionErrorBoundary>
            </SectionPerfWrapper>
          </LazySection>

          <LazySection minHeight="300px">
            <SectionPerfWrapper name="collaborate">
              <SectionErrorBoundary sectionName="Collaborate">
                <CollaborationCTA />
              </SectionErrorBoundary>
            </SectionPerfWrapper>
          </LazySection>
        </main>
        <Footer />
        <StatusBar />
        <CommandPalette />
      </div>
    </>
  )
}
