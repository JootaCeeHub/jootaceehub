'use client'

// Server Component (page.tsx) → this Client Component wrapper → HomeClient.
// HomeClient is imported directly (SSR enabled) so the server pre-renders
// Navigation + HeroSection into static HTML, giving near-instant FCP/LCP.
// Framer Motion 12 renders the `initial` state on SSR (opacity:0 for animated
// elements), so there is no visible flash — elements animate in correctly on mount.
// Dark Reader hydration warnings are suppressed at the body/html level.
// Below-fold sections inside HomeClient keep their own `ssr: false` + LazySection.
import { HomeClient } from './HomeClient'
import type { ArticleMeta } from '@/lib/journal/types'

interface HomeWrapperProps {
  featured: ArticleMeta | undefined
  recent: ArticleMeta[]
}

export function HomeWrapper({ featured, recent }: HomeWrapperProps) {
  return <HomeClient featured={featured} recent={recent} />
}
