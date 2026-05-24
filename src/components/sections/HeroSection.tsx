'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ArrowRight } from 'lucide-react'
import { SceneFallback } from '@/components/3d/SceneFallback'
import { Button } from '@/components/ui/button'
import { brand, heroSignals } from '@/lib/config/brand'
import { useFoundationIdentity } from '@/hooks/useFoundationIdentity'
import { useTranslations } from '@/lib/i18n/context'
import { fadeUp, staggerContainer } from '@/lib/motion/variants'

const NeuralNetworkScene = dynamic(() => import('@/components/3d/NeuralNetworkScene'), { ssr: false })

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { identity, source } = useFoundationIdentity()
  const runtimeBrand = identity.brand ?? brand
  const runtimeSignals = identity.heroSignals.length ? identity.heroSignals : heroSignals
  const t = useTranslations('hero')

  const headline = (t('headline') as string) || runtimeBrand.headline
  const subheadline = (t('subheadline') as string) || runtimeBrand.subheadline
  const ctaPrimary = (t('ctaPrimary') as string) || runtimeBrand.ctaPrimary
  const ctaSecondary = (t('ctaSecondary') as string) || runtimeBrand.ctaSecondary

  useEffect(() => {
    if (!heroRef.current) return
    const q = gsap.utils.selector(heroRef)
    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(q('.hero-panel'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' })
      .fromTo(q('.hero-badge'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.8')
      .fromTo(q('.hero-title'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo(q('.hero-subtitle'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .fromTo(q('.hero-cta'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .fromTo(q('.hero-signals'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')

    return () => {
      tl.kill()
    }
  }, [])

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="hero" ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden pt-28">
      <NeuralNetworkScene initialTier="balanced" />
      <SceneFallback tier="balanced" />
      <div className="tech-grid" />
      <div className="hero-radial" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="hero-panel glass-strong max-w-5xl rounded-3xl p-8 md:p-12">
          <span className="hero-badge inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            {runtimeBrand.role}
          </span>

          <h1 className="hero-title mt-6 text-balance text-4xl font-semibold leading-tight md:text-6xl lg:text-7xl">
            <span className="gradient-text">{headline}</span>
          </h1>

          <p className="hero-subtitle mt-6 max-w-3xl text-lg text-muted-foreground md:text-2xl">
            {subheadline}
          </p>

          <div className="hero-cta mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" onClick={() => scrollTo('#systems')}>
              {ctaPrimary}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => scrollTo('#labs')}>
              {ctaSecondary}
            </Button>
          </div>

          <div className="hero-signals mt-10 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            {runtimeSignals.map((signal) => (
              <p key={signal} className="data-line pl-4">
                {signal}
              </p>
            ))}
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Foundation source: {source}
          </p>
        </div>
      </div>
    </section>
  )
}
