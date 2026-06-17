'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useCountUp } from '@/hooks/useCountUp'

const NODES = [
  { id: 'mcp', label: 'Protocol', name: 'MCP Orchestrator', top: '6%', left: '4%' },
  { id: 'aura', label: 'Intelligence', name: 'AURA Platform', top: '6%', right: '4%' },
  { id: 'agents', label: 'Coordination', name: 'Agent Network', bottom: '30%', left: '18%' },
  { id: 'graph', label: 'Memory', name: 'GraphRAG Store', bottom: '30%', right: '18%' },
]

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const numeric = parseInt(value)
  const suffix = value.replace(/[0-9]/g, '')
  const [count, ref] = useCountUp(isNaN(numeric) ? 0 : numeric)
  return (
    <div
      className="spotlight-card rounded-2xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-card/50"
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
        e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
      }}
    >
      <p className="text-2xl font-semibold text-foreground tabular-nums">{isNaN(numeric) ? value : `${count}${suffix}`}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  )
}

function NodeGraph() {
  return (
    <div className="relative w-full">
      {/* SVG connector lines — decorative background layer */}
      <svg className="absolute inset-0 pointer-events-none opacity-40" viewBox="0 0 2 2" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {/* Cross connections: top-left→bottom-right, top-right→bottom-left */}
        <line x1="0" y1="0" x2="2" y2="2" stroke="url(#lineGrad)" strokeWidth="0.02" />
        <line x1="2" y1="0" x2="0" y2="2" stroke="url(#lineGrad)" strokeWidth="0.02" />
        {/* Horizontal and vertical midpoints */}
        <line x1="1" y1="0" x2="1" y2="2" stroke="url(#lineGrad)" strokeWidth="0.015" />
        <line x1="0" y1="1" x2="2" y2="1" stroke="url(#lineGrad)" strokeWidth="0.015" />
      </svg>

      {/* 2×2 grid of node cards */}
      <div className="grid grid-cols-2 gap-3">
        {NODES.map((node, i) => (
          <motion.div
            key={node.id}
            className="spotlight-card glass flex flex-col gap-2 rounded-2xl border border-border/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_-6px_var(--glow)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
              e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{node.label}</span>
            <span className="text-sm font-semibold text-foreground">{node.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-beacon" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Operational</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function SystemsPreview() {
  const t = useTranslations('home.systems')
  const locale = useLocale()

  const stats = [
    { value: t('stat1Value') as string, label: t('stat1Label') as string },
    { value: t('stat2Value') as string, label: t('stat2Label') as string },
    { value: t('stat3Value') as string, label: t('stat3Label') as string },
    { value: t('stat4Value') as string, label: t('stat4Label') as string },
  ]

  return (
    <section id="systems" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <div className="mb-16 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/70">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-beacon" />
            {t('statusAll') as string}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-16 xl:grid-cols-2 xl:gap-24 items-center">
          <ScrollReveal direction="left" className="flex flex-col gap-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-beacon" />
              {t('badge') as string}
            </span>

            <h2 className="text-4xl font-semibold leading-[1.1] md:text-5xl lg:text-6xl">
              <span className="gradient-text">{t('title') as string}</span>
            </h2>

            <p className="max-w-lg text-base text-muted-foreground md:text-lg leading-relaxed">{t('description') as string}</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>

            <Link prefetch={false} href={`/${locale}/projects`} className="group inline-flex items-center gap-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground">
              <span className="h-px w-8 bg-border transition-all duration-300 group-hover:w-16 group-hover:bg-primary" />
              <span>{t('cta') as string}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1} className="relative hidden xl:block">
            <NodeGraph />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
