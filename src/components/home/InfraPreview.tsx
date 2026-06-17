'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from '@/lib/i18n/context'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { BorderBeam } from '@/components/shared/BorderBeam'
import { useCountUp } from '@/hooks/useCountUp'

const trackMouse = (e: React.MouseEvent<HTMLDivElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`)
  e.currentTarget.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`)
  e.currentTarget.style.setProperty('--spotlight-color', 'rgba(251,191,36,0.06)')
}

const LOG_ENTRIES = [
  { time: '09:14:22', icon: '✓', text: 'health-check passed (42ms)' },
  { time: '09:14:25', icon: '✓', text: 'pod/api-7d9f scaled to 3 replicas' },
  { time: '09:14:31', icon: '✓', text: 'memory: 2.1GB / 8GB' },
  { time: '09:14:37', icon: '⚡', text: 'latency P99: 23ms' },
  { time: '09:14:43', icon: '✓', text: 'cert-manager: renewal successful' },
  { time: '09:14:51', icon: '✓', text: 'ingress/nginx: 200 OK (12ms)' },
  { time: '09:14:58', icon: '⚡', text: 'autoscaler: target CPU 34%' },
]

function SystemHealthMetric() {
  const [count, ref] = useCountUp(100)
  return (
    <div className="spotlight-card flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-card/30 px-5 py-4 min-w-[120px] transition-all duration-300 hover:border-amber-400/20" ref={ref} onMouseMove={trackMouse}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-beacon" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
          Online
        </span>
      </div>
      <p className="text-xl font-semibold text-foreground tabular-nums">{count}%</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">System Health</p>
    </div>
  )
}

function ContainersMetric({ value, label }: { value: string; label: string }) {
  const numeric = parseInt(value)
  const [count, ref] = useCountUp(isNaN(numeric) ? 0 : numeric)
  return (
    <div className="spotlight-card flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-card/30 px-5 py-4 min-w-[120px] transition-all duration-300 hover:border-amber-400/20" ref={ref} onMouseMove={trackMouse}>
      <div className="flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-border" />
      </div>
      <p className="text-xl font-semibold text-foreground tabular-nums">{isNaN(numeric) ? value : String(count)}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    </div>
  )
}

function TerminalFeed() {
  const [lines, setLines] = useState(LOG_ENTRIES.slice(0, 3))
  const [, setCursor] = useState(3)

  useEffect(() => {
    const id = setInterval(() => {
      setCursor((prev) => {
        const next = (prev + 1) % LOG_ENTRIES.length
        setLines((currentLines) => {
          const updated = [...currentLines, LOG_ENTRIES[next]]
          return updated.slice(-5)
        })
        return next
      })
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="terminal-scan rounded-2xl border border-border/40 bg-card/30 p-4 font-mono text-[11px] leading-relaxed" style={{ position: 'relative', overflow: 'hidden' }}>
      <BorderBeam colorFrom="rgba(251,191,36,0.7)" duration={6} delay={2} />
      <div className="mb-3 flex items-center gap-2 border-b border-border/30 pb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-beacon" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Live log stream</span>
      </div>
      {lines.map((line, i) => (
        <div key={`${line.time}-${i}`} className="text-muted-foreground/70 transition-all duration-300">
          <span className="text-amber-400/60 mr-2">[{line.time}]</span>
          <span className={`${line.icon === '⚡' ? 'text-amber-400/80' : 'text-emerald-400/80'} mr-1`}>
            {line.icon}
          </span>
          {line.text}
        </div>
      ))}
    </div>
  )
}

const METRICS = [
  { valueKey: '99.9%', labelKey: 'uptimeLabel' },
  { valueKey: 'EU-WEST', labelKey: 'regionLabel' },
  { valueKey: 'Kubernetes', labelKey: 'orchestratorLabel' },
]

export function InfraPreview() {
  const t = useTranslations('home.infra')
  const locale = useLocale()

  return (
    <section id="infrastructure" className="relative py-24 border-t border-border/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 via-transparent to-orange-500/3 pointer-events-none" />
      <div className="container mx-auto px-6">
        <ScrollReveal className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-beacon" />
              {t('badge') as string}
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">
              <span className="gradient-text">{t('title') as string}</span>
            </h2>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{t('description') as string}</p>
            <Link prefetch={false} href={`/${locale}/projects`} className="group inline-flex items-center gap-3 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:text-foreground w-fit">
              <span className="h-px w-8 bg-border transition-all duration-300 group-hover:w-16 group-hover:bg-amber-400" />
              <span>{t('cta') as string}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex flex-col gap-4 xl:min-w-[360px]">
            <div className="flex flex-wrap gap-3 xl:flex-nowrap xl:gap-4">
              {/* Online status with count-up */}
              <SystemHealthMetric />

              {METRICS.map((m) => {
                const numeric = parseInt(m.valueKey)
                if (!isNaN(numeric)) {
                  return (
                    <ContainersMetric
                      key={m.labelKey}
                      value={m.valueKey}
                      label={t(m.labelKey) as string}
                    />
                  )
                }
                return (
                  <div key={m.labelKey} className="spotlight-card flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-card/30 px-5 py-4 min-w-[120px] transition-all duration-300 hover:border-amber-400/20" onMouseMove={trackMouse}>
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-border" />
                    </div>
                    <p className="text-xl font-semibold text-foreground tabular-nums">{m.valueKey}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t(m.labelKey) as string}</p>
                  </div>
                )
              })}

              {/* Containers with count-up */}
              <ContainersMetric value="12" label={t('containersLabel') as string} />
            </div>

            <TerminalFeed />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
