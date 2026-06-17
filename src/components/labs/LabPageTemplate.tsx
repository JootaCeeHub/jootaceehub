'use client'

import type { ReactNode } from 'react'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { useTranslations } from '@/lib/i18n/context'

export interface RoadmapItem {
  label: string
  description?: string
  done?: boolean
}

export interface LabPageConfig {
  badge: string
  title: string
  subtitle: string
  description: string
  status: string
  stack: string[]
  roadmap: RoadmapItem[]
}

interface LabPageTemplateProps {
  config: LabPageConfig
  children?: ReactNode
  sideExtra?: ReactNode
}

export function LabPageTemplate({ config, children, sideExtra }: LabPageTemplateProps) {
  const { badge, title, subtitle, description, status, stack, roadmap } = config
  const tShared = useTranslations('domainLabs.shared')

  return (
    <div>
      <header className="mb-16">
        <div className="mb-6">
          <DomainBreadcrumb />
        </div>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {badge}
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground font-medium">{subtitle}</p>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {children && <div className="glass rounded-2xl p-6">{children}</div>}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{tShared('sidebarStack')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {stack.map((tech) => (
                <span key={tech} className="rounded-lg border border-border/60 bg-secondary/60 px-3 py-2 font-mono text-xs text-center text-muted-foreground">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">{tShared('sidebarRoadmap')}</p>
            <div className="space-y-3">
              {roadmap.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${Boolean(item.done) ? 'bg-primary' : 'bg-border'}`} />
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sideExtra}
        </div>
      </div>
    </div>
  )
}
