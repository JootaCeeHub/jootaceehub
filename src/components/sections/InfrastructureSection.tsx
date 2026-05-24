'use client'

import { useState } from 'react'
import { Activity, Boxes, FileTerminal, Network, Rocket, Server } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useInfrastructureOverview } from '@/hooks/useInfrastructureOverview'
import { useTranslations } from '@/lib/i18n/context'

type InfraView = 'runtime' | 'containers' | 'mcp' | 'logs' | 'deployments'

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  deployments: Rocket,
  containers: Boxes,
  mcp_nodes: Network,
  orchestrations: Activity,
  logs_ingested: FileTerminal,
  runtime_alerts: Server,
}

const statusBadge = {
  operational: 'text-emerald-200 border-emerald-400/40 bg-emerald-500/15',
  stable: 'text-sky-200 border-sky-300/40 bg-sky-500/15',
  warning: 'text-amber-200 border-amber-400/40 bg-amber-500/15',
  critical: 'text-rose-200 border-rose-400/40 bg-rose-500/15',
} as const

export function InfrastructureSection() {
  const { data, source } = useInfrastructureOverview()
  const [view, setView] = useState<InfraView>('runtime')
  const t = useTranslations('infrastructure')

  const tabLabels: Record<InfraView, string> = {
    runtime: t('tabs.runtime') as string,
    containers: t('tabs.containers') as string,
    mcp: t('tabs.mcp') as string,
    logs: t('tabs.logs') as string,
    deployments: t('tabs.deployments') as string,
  }

  return (
    <section id="infrastructure" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('badge') as string}
          title={t('commandCenterTitle') as string}
          description={t('commandCenterDescription') as string}
        />

        <StaggerReveal className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('labels.uptime') as string}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{data.uptimePct.toFixed(2)}%</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('labels.region') as string}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-foreground">{data.runtime.region}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('labels.orchestrator') as string}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-foreground">{data.runtime.orchestrator}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('labels.source') as string}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-primary">{source}</p>
          </div>
        </StaggerReveal>

        <StaggerReveal className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.metrics.map((metric) => {
            const Icon = metricIcons[metric.key] ?? Activity
            return (
              <HoverCard3D key={metric.key} intensity={5}>
                <Card variant="glass" className="h-full">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${statusBadge[metric.status]}`}>
                        {metric.status}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">
                      {metric.value} {metric.unit ? <span className="text-sm text-muted-foreground">{metric.unit}</span> : null}
                    </CardTitle>
                    <CardDescription>{metric.label}</CardDescription>
                  </CardHeader>
                </Card>
              </HoverCard3D>
            )
          })}
        </StaggerReveal>

        <ScrollReveal className="mb-4 flex flex-wrap gap-2">
          {(['runtime', 'containers', 'mcp', 'logs', 'deployments'] as InfraView[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setView(tab)}
              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                view === tab
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </ScrollReveal>

        <ScrollReveal>
          <div className="glass rounded-2xl p-5">
            {view === 'runtime' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card/55 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{t('tabLabels.runtime') as string}</p>
                  <p className="text-lg font-semibold text-foreground">{data.runtime.runtime}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/55 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{t('tabLabels.mcpNodesOnline') as string}</p>
                  <p className="text-lg font-semibold text-foreground">{data.mcpNodes.filter((n) => n.state === 'online').length}</p>
                </div>
                <div className="rounded-lg border border-border bg-card/55 p-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{t('tabLabels.containerRuntime') as string}</p>
                  <p className="text-lg font-semibold text-foreground">{data.containers.filter((c) => c.status === 'running').length} running</p>
                </div>
              </div>
            ) : null}

            {view === 'containers' ? (
              <div className="space-y-3">
                {data.containers.map((container) => (
                  <div key={container.name} className="rounded-lg border border-border bg-card/55 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{container.name}</p>
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{container.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{container.image}</p>
                    <p className="mt-1 text-xs text-muted-foreground">CPU {container.cpu} · MEM {container.memory} · Uptime {container.uptime}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {view === 'mcp' ? (
              <div className="space-y-3">
                {data.mcpNodes.map((node) => (
                  <div key={node.id} className="rounded-lg border border-border bg-card/55 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{node.id}</p>
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{node.state}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Role: {node.role}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Latency {node.latencyMs}ms · Load {node.loadPct}%</p>
                  </div>
                ))}
              </div>
            ) : null}

            {view === 'logs' ? (
              <div className="terminal-scan space-y-2 rounded-lg border border-border bg-card/55 p-3">
                {data.logs.map((log) => (
                  <p key={`${log.ts}-${log.service}-${log.message}`} className="font-mono text-xs text-muted-foreground">
                    [{log.ts.slice(11, 19)}] {log.level.toUpperCase()} · {log.service} · {log.message}
                  </p>
                ))}
              </div>
            ) : null}

            {view === 'deployments' ? (
              <div className="space-y-3">
                {data.deployments.map((deployment) => (
                  <div key={`${deployment.service}-${deployment.version}-${deployment.timestamp}`} className="rounded-lg border border-border bg-card/55 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{deployment.service}</p>
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{deployment.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{deployment.environment} · {deployment.version}</p>
                    <p className="text-xs text-muted-foreground">{deployment.timestamp.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </ScrollReveal>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          revision: {data.revision} · generated: {data.generatedAt.slice(0, 19).replace('T', ' ')}
        </p>
      </div>
    </section>
  )
}
