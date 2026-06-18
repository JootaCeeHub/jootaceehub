'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useMotionValue, useSpring, type Transition } from 'framer-motion'
import { SceneFallback } from '@/components/3d/SceneFallback'
import { Button } from '@/components/ui/button'
import { brand, heroSignals } from '@/lib/config/brand'
import { useFoundationIdentity } from '@/hooks/useFoundationIdentity'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

// Three.js/R3F is ~620KB gzipped. Deferring until after TTI (via
// requestIdleCallback) keeps the initial main-thread parse cost near zero,
// directly reducing TBT and improving LCP. SceneFallback (pure CSS gradient)
// renders immediately as the visual placeholder.
const NeuralNetworkScene = dynamic(
  () => import('@/components/3d/NeuralNetworkScene'),
  { ssr: false, loading: () => null },
)

// ease: 'power3.out' ≈ [0.215, 0.61, 0.355, 1.0]
const EASE_OUT: [number, number, number, number] = [0.215, 0.61, 0.355, 1.0]
// ease: 'back.out(1.8)' ≈ anticipation/overshoot spring
const EASE_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1.0]

// Desktop stagger delays matching the original GSAP timeline
const DELAYS = { panel: 0.25, badge: 0.6, title: 0.7, subtitle: 0.9, cta: 1.05, signals: 1.2, portals: 1.35 }

// Mobile: flat, fast — eliminates 5+ stagger animation tracks from the main thread.
// Used exclusively via `isMobile` state (never via window check during render)
// to avoid SSR/hydration mismatches that cause extra Framer Motion reconciliation work.
const MOBILE_T: Transition = { duration: 0.32, ease: 'easeOut' }

const domainPortals = [
  { key: 'systems',        label: 'Systems', desc: 'Architecture & protocols', href: '/systems',        dotColor: 'bg-sky-400',     status: 'Operational', delay: 0    },
  { key: 'labs',           label: 'Labs',    desc: 'Experimental products',    href: '/labs',           dotColor: 'bg-emerald-400', status: '4 Active',    delay: 0.3  },
  { key: 'infrastructure', label: 'Infra',   desc: 'Live ops center',          href: '/infrastructure', dotColor: 'bg-amber-400',   status: 'Live',        delay: 0.6  },
  { key: 'journal',        label: 'Journal', desc: 'Technical publication',    href: '/journal',        dotColor: 'bg-violet-400',  status: 'Publishing',  delay: 0.9  },
  { key: 'github',         label: 'GitHub',  desc: 'Code intelligence',        href: '/github',         dotColor: 'bg-primary',     status: 'Synced',      delay: 1.2  },
]

export function HeroSection() {
  const [sceneReady, setSceneReady] = useState(false)
  // On mobile/reduced-motion we never load Three.js — SceneFallback is sufficient.
  // Default true = SSR safe. useEffect corrects to false on desktop AFTER hydration.
  // ALL animation decisions below use this state — never window.innerWidth during render,
  // which would create SSR/hydration mismatches and force extra FM reconciliation.
  const [isMobile, setIsMobile] = useState(true)

  const { identity, source } = useFoundationIdentity()
  const runtimeBrand   = identity.brand ?? brand
  const runtimeSignals = identity.heroSignals.length ? identity.heroSignals : heroSignals
  const t      = useTranslations('hero')
  const locale = useLocale()
  const lp = (path: string) => `/${locale}${path}`

  const headline     = (t('headline')     as string) || runtimeBrand.headline
  const subheadline  = (t('subheadline')  as string) || runtimeBrand.subheadline
  const ctaPrimary   = (t('ctaPrimary')   as string) || runtimeBrand.ctaPrimary
  const ctaSecondary = (t('ctaSecondary') as string) || runtimeBrand.ctaSecondary

  /* ── Defer 3D scene until AFTER page load event + 800ms grace ──────────── */
  // Skip Three.js on mobile (<768px) and reduced-motion: on mobile the canvas
  // becomes a full-viewport LCP candidate at 5-9s, overriding the H1 which
  // would otherwise be LCP at ~0.4s. Desktop still gets the neural network.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mobile =
      window.innerWidth < 768 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setIsMobile(mobile) // eslint-disable-line react-hooks/set-state-in-effect
    if (mobile) return

    let tid: ReturnType<typeof setTimeout> | null = null
    const mount = () => { tid = setTimeout(() => setSceneReady(true), 800) }

    if (document.readyState === 'complete') {
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(mount, { timeout: 3000 })
        return () => { cancelIdleCallback(id); if (tid) clearTimeout(tid) }
      }
      mount()
    } else {
      window.addEventListener('load', mount, { once: true })
    }

    return () => {
      window.removeEventListener('load', mount)
      if (tid) clearTimeout(tid)
    }
  }, [])

  /* ── Derive animation config from isMobile state (stable across SSR/hydration) */
  const panelT  = isMobile ? MOBILE_T : { delay: DELAYS.panel,    duration: 1.1,  ease: EASE_OUT }
  const badgeT  = isMobile ? MOBILE_T : { delay: DELAYS.badge,    duration: 0.55, ease: EASE_BACK }
  const titleT  = isMobile ? MOBILE_T : { delay: DELAYS.title,    duration: 0.75, ease: EASE_OUT }
  const subT    = isMobile ? MOBILE_T : { delay: DELAYS.subtitle, duration: 0.7,  ease: EASE_OUT }
  const ctaT    = isMobile ? MOBILE_T : { delay: DELAYS.cta,      duration: 0.7,  ease: EASE_OUT }
  const sigT    = isMobile ? MOBILE_T : { delay: DELAYS.signals,  duration: 0.7,  ease: EASE_OUT }
  const portT   = isMobile ? MOBILE_T : { delay: DELAYS.portals,  duration: 0.7,  ease: EASE_OUT }
  const panelY  = isMobile ? 12 : 40
  const titleY  = isMobile ? 10 : 28
  const slideY  = isMobile ? 8  : 22

  /* ── Mouse parallax — useMotionValue + useSpring (replaces GSAP to()) ───── */
  // Springs are always created (hooks rules), but only applied to style on
  // desktop. On mobile: no mouse → no parallax → skipping the style binding
  // removes 4 continuously-updating MotionValues from the Style & Layout budget.
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rawX       = useMotionValue(0)
  const rawY       = useMotionValue(0)

  const springCfg = { stiffness: 80, damping: 18, mass: 1 }
  const sRotateX  = useSpring(rawRotateX, springCfg)
  const sRotateY  = useSpring(rawRotateY, springCfg)
  const sPanelX   = useSpring(rawX,       springCfg)
  const sPanelY   = useSpring(rawY,       springCfg)

  // Desktop only: bind spring values to panel style for mouse parallax.
  // Mobile: empty object → zero per-frame style updates from spring subscriptions.
  const panelSpring = isMobile
    ? {}
    : { rotateX: sRotateX, rotateY: sRotateY, x: sPanelX, y: sPanelY, transformPerspective: 1200 }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width  - 0.5
    const cy = (e.clientY - rect.top)  / rect.height - 0.5
    rawRotateY.set(cx *  2.5)
    rawRotateX.set(cy * -1.5)
    rawX.set(cx * 8)
    rawY.set(cy * 5)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    rawRotateX.set(0)
    rawRotateY.set(0)
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden pt-28"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static CSS fallback — paints at t=0, zero JS cost */}
      <SceneFallback tier="balanced" />

      {/* Three.js scene — desktop only, mounted after load event + 800ms */}
      {sceneReady && !isMobile && <NeuralNetworkScene initialTier="balanced" />}

      {/* Tech grid */}
      <div className="tech-grid" />

      {/* Ambient radial glow */}
      <div className="hero-radial" />

      <div className="container relative z-10 mx-auto px-6">
        {/*
          Outer div: y-slide only (no opacity). Content is LCP-eligible from
          first frame regardless of animation progress.
          Mobile: 12px slide, fast. Desktop: 40px slide, staggered.
        */}
        <motion.div
          initial={isMobile ? false : { y: panelY }}
          animate={{ y: 0 }}
          transition={panelT}
        >
          <motion.div
            className="hero-panel glass-strong max-w-5xl rounded-3xl p-8 md:p-12"
            style={panelSpring}
          >
            {/* Badge — opacity-0 class pre-hides element before JS hydration,
                matching Framer Motion's initial={{ opacity: 0 }} to prevent flash */}
            <motion.span
              className={cn("hero-badge inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary", !isMobile && "opacity-0")}
              initial={isMobile ? false : { scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={badgeT}
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-beacon" />
              {runtimeBrand.role}
            </motion.span>

            {/*
              LCP element — y-slide only (no opacity: 0), visible at first paint.
              elementtiming="lcp-hero" marks this as the explicitly tracked
              LCP candidate for Lighthouse and PerformanceObserver.
            */}
            <motion.h1
              className="hero-title mt-6 text-balance text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl"
              // @ts-expect-error — elementtiming is a valid HTML perf attribute
              elementtiming="lcp-hero"
              initial={isMobile ? false : { y: titleY }}
              animate={{ y: 0 }}
              transition={titleT}
            >
              <span className="gradient-text animate-gradient-shift">{headline}</span>
            </motion.h1>

            <motion.p
              className={cn("hero-subtitle mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl", !isMobile && "opacity-0")}
              initial={isMobile ? false : { opacity: 0, y: slideY }}
              animate={{ opacity: 1, y: 0 }}
              transition={subT}
            >
              {subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className={cn("hero-cta mt-10 flex flex-col gap-4 sm:flex-row", !isMobile && "opacity-0")}
              initial={isMobile ? false : { opacity: 0, y: slideY }}
              animate={{ opacity: 1, y: 0 }}
              transition={ctaT}
            >
              <Link prefetch={false} href={lp('/projects')}>
                <Button size="lg">
                  {ctaPrimary}
                  <ArrowRight className="ml-2 h-4 w-4" suppressHydrationWarning />
                </Button>
              </Link>
              <Link prefetch={false} href={lp('/research')}>
                <Button variant="outline" size="lg">
                  {ctaSecondary}
                </Button>
              </Link>
            </motion.div>

            {/* Signals */}
            <motion.div
              className={cn("hero-signals mt-10 grid gap-3 text-sm text-muted-foreground md:grid-cols-3", !isMobile && "opacity-0")}
              initial={isMobile ? false : { opacity: 0, y: slideY }}
              animate={{ opacity: 1, y: 0 }}
              transition={sigT}
            >
              {runtimeSignals.map((signal) => (
                <p key={signal} className="data-line pl-4">
                  {signal}
                </p>
              ))}
            </motion.div>

            {/* Domain Portals */}
            <motion.div
              className={cn("hero-portals mt-10 border-t border-border/40 pt-8", !isMobile && "opacity-0")}
              initial={isMobile ? false : { opacity: 0, y: slideY }}
              animate={{ opacity: 1, y: 0 }}
              transition={portT}
            >
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">{(t('enterDomain') as string) || 'Enter a domain'}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {domainPortals.map((portal) => (
                  <Link prefetch={false} key={portal.key} href={lp(portal.href)}>
                    <div className="group flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 transition-all duration-300 hover:shadow-[0_0_18px_-4px_var(--glow)] cursor-pointer">
                      <span className="text-[12px] font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-200">{portal.label}</span>
                      <span className="text-[10px] text-muted-foreground/60 leading-snug">{portal.desc}</span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${portal.dotColor} animate-status`}
                          style={{ animationDelay: `${portal.delay}s` }}
                        />
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">{portal.status}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Foundation source: {source}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
