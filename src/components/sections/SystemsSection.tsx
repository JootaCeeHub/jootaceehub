'use client'

import { useState } from 'react'
import { Cpu, Network, Bot, Database, Container, Activity, Factory, Layers } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useArchitectureOverview } from '@/hooks/useArchitectureOverview'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/context'
import { MCPMap } from '@/components/architecture/MCPMap'
import { AuraSignalPanel } from '@/components/architecture/AuraSignalPanel'
import { GraphMetricsPanel } from '@/components/architecture/GraphMetricsPanel'
import { FlowTimeline } from '@/components/architecture/FlowTimeline'
import { SectionExploreCta } from '@/components/shared/SectionExploreCta'

const iconMap = {
  aura: Cpu,
  mcp: Network,
  agents: Bot,
  memory: Database,
  automation: Activity,
  docker: Container,
  ops: Factory,
  industrial: Layers,
} as const

const views = [
  { id: 'mcp', label: 'MCP Map' },
  { id: 'aura', label: 'AURA Visual' },
  { id: 'flow', label: 'AI Flows' },
  { id: 'graph', label: 'Graph Metrics' },
] as const

type ViewId = (typeof views)[number]['id']

export function SystemsSection() {
  const { overview, source } = useArchitectureOverview()
  const [activeView, setActiveView] = useState<ViewId>('mcp')
  const t = useTranslations('systems')

  const notes = (t('notes') as unknown as string[]) || []
  const viewLabels: Record<ViewId, string> = {
    mcp: t('views.mcp') as string,
    aura: t('views.aura') as string,
    flow: t('views.flow') as string,
    graph: t('views.graph') as string,
  }

  const statusBadgeClass = (status: 'active' | 'stable' | 'running') => {
    const map = {
      active: 'text-cyan-200 border-cyan-300/40 bg-cyan-400/10',
      stable: 'text-sky-200 border-sky-300/40 bg-sky-400/10',
      running: 'text-indigo-200 border-indigo-300/40 bg-indigo-400/10',
    } as const
    return `rounded-full border px-2 py-1 text-xs uppercase tracking-[0.14em] ${map[status]}`
  }

  return (
    <section id="systems" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('badge') as string}
          title={t('showcaseTitle') as string}
          description={t('showcaseDescription') as string}
        />

        <StaggerReveal className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {overview.systems.map((system) => {
            const Icon = iconMap[system.id as keyof typeof iconMap] ?? Cpu
            return (
              <HoverCard3D key={system.id} intensity={6}>
                <Card variant="glass" className="h-full group">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className={statusBadgeClass(system.status)}>
                        {system.status}
                      </span>
                    </div>
                    <CardTitle>{system.name}</CardTitle>
                    <CardDescription className="mt-1 uppercase tracking-[0.18em] text-primary/80">{system.focus}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground transition-opacity duration-300 group-hover:opacity-100 opacity-70">
                      {system.description}
                    </p>
                  </CardContent>
                </Card>
              </HoverCard3D>
            )
          })}
        </StaggerReveal>

        <ScrollReveal className="mb-4 flex flex-wrap gap-2">
          {views.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition',
                activeView === view.id
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              {viewLabels[view.id]}
            </button>
          ))}
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScrollReveal>
            {activeView === 'mcp' ? <MCPMap nodes={overview.mcpMap.nodes} edges={overview.mcpMap.edges} /> : null}
            {activeView === 'aura' ? <AuraSignalPanel signals={overview.auraSignals} /> : null}
            {activeView === 'flow' ? <FlowTimeline steps={overview.aiFlow} /> : null}
            {activeView === 'graph' ? <GraphMetricsPanel metrics={overview.graphMetrics} /> : null}
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('architectureNotes') as string}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {notes.map((note, i) => (
                  <li key={i} className="data-line pl-4">{note}</li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                source: {source} · revision: {overview.version}
              </p>
            </div>
          </ScrollReveal>
        </div>
        <SectionExploreCta domainHref="/projects" label="Projects" statusLabel="5 projects deployed" />
      </div>
    </section>
  )
}
