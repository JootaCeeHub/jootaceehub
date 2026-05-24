'use client'

import { useState, Suspense, lazy, useEffect } from 'react'
import { Navigation, Footer } from '@/components/layout'
import {
  Preloader,
  CustomCursor,
  StatusBar,
  CommandPalette,
  SectionErrorBoundary,
} from '@/components/shared'
import { HeroSection } from '@/components/sections/HeroSection'
import { useTranslations } from '@/lib/i18n'
import { installConsoleFilter } from '@/lib/logger'

const SystemsSection = lazy(() => import('@/components/sections/SystemsSection').then((m) => ({ default: m.SystemsSection })))
const LabsSection = lazy(() => import('@/components/sections/LabsSection').then((m) => ({ default: m.LabsSection })))
const InfrastructureSection = lazy(() => import('@/components/sections/InfrastructureSection').then((m) => ({ default: m.InfrastructureSection })))
const GitHubSection = lazy(() => import('@/components/sections/GitHubSection').then((m) => ({ default: m.GitHubSection })))
const AboutSection = lazy(() => import('@/components/sections/AboutSection').then((m) => ({ default: m.AboutSection })))
const ContactSection = lazy(() => import('@/components/sections/ContactSection').then((m) => ({ default: m.ContactSection })))

function SectionFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  )
}

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const t = useTranslations('accessibility')

  useEffect(() => {
    installConsoleFilter()
  }, [])

  return (
    <>
      <Preloader onComplete={() => setLoaded(true)} />
      <CustomCursor />
      <div className="noise-overlay" />
      <div className="scanlines" />

      <div className={`min-h-screen bg-background transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
        >
          {t('skipToContent')}
        </a>
        <Navigation />
        <main id="main-content">
          <SectionErrorBoundary sectionName="Hero">
            <HeroSection />
          </SectionErrorBoundary>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="Systems">
              <SystemsSection />
            </SectionErrorBoundary>
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="Labs">
              <LabsSection />
            </SectionErrorBoundary>
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="Infrastructure">
              <InfrastructureSection />
            </SectionErrorBoundary>
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="GitHub">
              <GitHubSection />
            </SectionErrorBoundary>
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="About">
              <AboutSection />
            </SectionErrorBoundary>
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <SectionErrorBoundary sectionName="Contact">
              <ContactSection />
            </SectionErrorBoundary>
          </Suspense>
        </main>
        <Footer />
        <StatusBar />
        <CommandPalette />
      </div>
    </>
  )
}
