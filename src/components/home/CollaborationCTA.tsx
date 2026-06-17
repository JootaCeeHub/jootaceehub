'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const STATS = [
  { value: '48h', label: 'Avg response' },
  { value: '100%', label: 'Project rate' },
  { value: '5+', label: 'Years exp' },
]

export function CollaborationCTA() {
  const t = useTranslations('home.collab')
  const locale = useLocale()

  return (
    <section id="collaborate" className="relative py-40 border-t border-border/20 overflow-hidden border-glow">
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/6 blur-[80px] pointer-events-none animate-breathe" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-500/4 blur-[60px] pointer-events-none animate-breathe" />

      <div className="container relative z-10 mx-auto px-6">
        <ScrollReveal className="flex flex-col items-center gap-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-beacon" />
            {t('badge') as string}
          </span>

          <h2 className="max-w-3xl text-4xl font-semibold leading-[1.1] md:text-5xl lg:text-6xl">
            <span className="gradient-text">{t('title') as string}</span>
            <span className="inline-block ml-1 animate-cursor text-primary/70">_</span>
          </h2>

          <p className="max-w-lg text-base text-muted-foreground md:text-lg leading-relaxed">{t('description') as string}</p>

          <div className="mt-2 flex gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="gradient-text text-2xl font-bold">{stat.value}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">{stat.label}</span>
              </div>
            ))}
          </div>

          <a href={`mailto:${t('email') as string}`} className="font-mono text-sm text-primary/70 tracking-wider transition-colors hover:text-primary">
            {t('email') as string}
          </a>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link prefetch={false} href={`/${locale}/contact`} className="group inline-flex items-center gap-3 rounded-full border border-primary/40 bg-primary/15 px-8 py-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/70 hover:bg-primary/25 hover:shadow-[0_0_24px_rgba(var(--primary-rgb),0.15)]">
              {t('cta') as string}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link prefetch={false} href={`/${locale}/projects`} className="group inline-flex items-center gap-3 rounded-full border border-border/40 px-8 py-4 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-border/70 hover:text-foreground">
              {t('ctaSecondary') as string}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">Qualified projects only · Response within 24h</p>
        </ScrollReveal>
      </div>
    </section>
  )
}
