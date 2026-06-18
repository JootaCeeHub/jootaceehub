'use client'

import { CheckCircle2, Clock, Circle, GitCommit } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { useTranslations } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface Phase {
  phase: string
  date: string
  status: string
  title: string
  summary: string
  highlights: string[]
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'complete')    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  if (status === 'in-progress') return <Clock className="h-4 w-4 text-sky-500" />
  return <Circle className="h-4 w-4 text-muted-foreground/40" />
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  const label = labels[status] ?? status
  const cls = {
    complete:      'border-emerald-500/25 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400',
    'in-progress': 'border-sky-500/25 bg-sky-500/8 text-sky-600 dark:text-sky-400',
    planned:       'border-border/50 bg-muted/30 text-muted-foreground',
  }[status] ?? 'border-border/50 bg-muted/30 text-muted-foreground'

  return (
    <span className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider', cls)}>
      {label}
    </span>
  )
}

export default function ChangelogPage() {
  const t = useTranslations('changelog')

  const phases = (t('phases') as unknown as Phase[]) ?? []
  const statusBadge = (t('statusBadge') as unknown as Record<string, string>) ?? {}

  return (
    <DomainLayout>
      <header className="mb-16">
        <DomainBreadcrumb />
        <span className="mt-6 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t('badge') as string}
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">{t('title') as string}</span>
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-muted-foreground leading-relaxed">
          {t('description') as string}
        </p>
      </header>

      <div className="relative">
        {/* Timeline spine */}
        <div className="absolute left-[19px] top-0 h-full w-px bg-border/40 md:left-[23px]" />

        <StaggerReveal className="space-y-10">
          {phases.map((phase, i) => (
            <ScrollReveal key={phase.phase} delay={i * 0.06}>
              <article className="relative flex gap-6 md:gap-8">
                {/* Timeline node */}
                <div className="relative z-10 mt-4 shrink-0">
                  <div className={cn(
                    'flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border-2 bg-background',
                    phase.status === 'complete'      ? 'border-emerald-500/40' :
                    phase.status === 'in-progress'   ? 'border-sky-500/40 animate-pulse' :
                    'border-border/40'
                  )}>
                    <StatusIcon status={phase.status} />
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 rounded-2xl border border-border/60 bg-card/40 p-6 pb-7">
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                      {phase.phase}
                    </span>
                    <StatusBadge status={phase.status} labels={statusBadge} />
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">{phase.date}</span>
                  </div>

                  <h2 className="text-lg font-semibold text-foreground mb-2">{phase.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{phase.summary}</p>

                  <ul className="space-y-2">
                    {phase.highlights.map((h, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <GitCommit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </div>
    </DomainLayout>
  )
}
