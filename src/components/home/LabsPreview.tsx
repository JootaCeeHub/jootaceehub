'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { BorderBeam } from '@/components/shared/BorderBeam'

function trackMouse(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
  e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
}

const LABS = [
  {
    id: 'trading-ai',
    name: 'Trading AI',
    tagline: 'Autonomous signal generation and portfolio orchestration',
    status: 'live' as const,
    tech: 'Python · LSTM · FastAPI',
    accent: 'bg-emerald-500',
  },
  {
    id: 'stl-generator',
    name: 'STL Generator',
    tagline: 'Natural language to parametric 3D geometry via AI',
    status: 'beta' as const,
    tech: 'Next.js · OpenAI · Three.js',
    accent: 'bg-violet-500',
  },
  {
    id: 'crm',
    name: 'CRM Platform',
    tagline: 'Intelligent relationship intelligence with AI scoring',
    status: 'rd' as const,
    tech: 'React · PostgreSQL · LangGraph',
    accent: 'bg-sky-500',
  },
  {
    id: 'aura',
    name: 'AURA',
    tagline: 'Multi-model AI orchestration and routing engine',
    status: 'rd' as const,
    tech: 'Python · Claude · MCP · FastAPI',
    accent: 'bg-primary',
  },
]

const STATUS_CLASS = {
  live: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  beta: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  rd: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
}

export function LabsPreview() {
  const t = useTranslations('home.labs')
  const locale = useLocale()

  const statusLabel = {
    live: t('liveLabel') as string,
    beta: t('betaLabel') as string,
    rd: t('rdLabel') as string,
  }

  return (
    <section id="labs" className="relative py-32 border-t border-border/20">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-16 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t('badge') as string}
            </span>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
              <span className="gradient-text">{t('title') as string}</span>
            </h2>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed">{t('description') as string}</p>
          </div>
          <Link prefetch={false} href={`/${locale}/projects`} className="group inline-flex shrink-0 items-center gap-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground xl:self-end">
            <span className="h-px w-8 bg-border transition-all duration-300 group-hover:w-16 group-hover:bg-primary" />
            <span>{t('cta') as string}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LABS.map((lab, i) => (
            <Link prefetch={false} key={lab.id} href={`/${locale}/labs/${lab.id}`}>
              <div className="spotlight-card group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/40 bg-card/20 p-6 transition-all duration-300 hover:border-primary/20 hover:bg-card/40 hover:shadow-[0_0_30px_-8px_var(--glow)] cursor-default" onMouseMove={trackMouse}>
                <BorderBeam duration={4 + i} delay={i * 0.8} />
                <div className={`absolute right-0 top-0 h-24 w-24 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 ${lab.accent}`} />
                <div className="flex items-start justify-between">
                  <span className="gradient-text font-mono text-[10px] tracking-wider font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${STATUS_CLASS[lab.status]}`}>
                    {lab.status === 'live' && (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-beacon mr-1.5" />
                    )}
                    {statusLabel[lab.status]}
                  </span>
                </div>
                <p className="text-base font-semibold text-foreground">{lab.name}</p>
                <p className="text-sm text-muted-foreground leading-snug">{lab.tagline}</p>
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  {lab.tech.split(' · ').map((techItem) => (
                    <span key={techItem} className="inline-flex items-center rounded-full border border-border/50 bg-card/60 px-2 py-0.5 font-mono text-[9px] text-muted-foreground/70">{techItem}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
