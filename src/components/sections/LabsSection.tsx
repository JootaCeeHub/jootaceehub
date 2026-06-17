'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Box, Building2, TrendingUp, Workflow } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useLabsOverview } from '@/hooks/useLabsOverview'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/context'
import type { LabModule } from '@/lib/labs/types'
import { TradingLab } from '@/components/labs/TradingLab'
import { STLLab } from '@/components/labs/STLLab'
import { ERPLab } from '@/components/labs/ERPLab'
import { CRMLab } from '@/components/labs/CRMLab'
import { SectionExploreCta } from '@/components/shared/SectionExploreCta'

const iconMap = {
  'trading-ai': TrendingUp,
  'stl-ai': Box,
  erp: Building2,
  crm: Workflow,
} as const

function renderModule(moduleId: LabModule['id']) {
  if (moduleId === 'trading-ai') return <TradingLab />
  if (moduleId === 'stl-ai') return <STLLab />
  if (moduleId === 'erp') return <ERPLab />
  return <CRMLab />
}

export function LabsSection() {
  const { overview, source } = useLabsOverview()
  const [activeModuleId, setActiveModuleId] = useState<LabModule['id']>('trading-ai')
  const t = useTranslations('labs')

  const activeModule = useMemo(
    () => overview.modules.find((module) => module.id === activeModuleId) ?? overview.modules[0],
    [activeModuleId, overview.modules]
  )

  const moduleStatusBadgeClass = (status: 'live' | 'r-and-d' | 'production') => {
    const map = {
      live: 'text-emerald-200 border-emerald-400/40 bg-emerald-500/15',
      'r-and-d': 'text-amber-200 border-amber-400/40 bg-amber-500/15',
      production: 'text-sky-200 border-sky-300/40 bg-sky-500/15',
    } as const
    return `rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${map[status]}`
  }

  return (
    <section id="labs" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('badge') as string}
          title={t('labsTitle') as string}
          description={t('labsDescription') as string}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <ScrollReveal direction="left">
            <div className="glass rounded-2xl p-4">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">{t('moduleRegistry') as string}</p>
              <div className="space-y-3">
                {overview.modules.map((module, index) => {
                  const Icon = iconMap[module.id]
                  const selected = module.id === activeModuleId

                  return (
                    <motion.button
                      key={module.id}
                      type="button"
                      onClick={() => setActiveModuleId(module.id)}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'w-full rounded-xl border p-3 text-left transition',
                        selected ? 'border-primary/50 bg-primary/10' : 'border-border bg-card/55 hover:border-primary/35'
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-primary/35 bg-primary/10 p-1.5">
                            <Icon className="h-4 w-4 text-primary" />
                          </span>
                          <span className="text-sm font-semibold text-foreground">{module.name}</span>
                        </div>
                        <span className={moduleStatusBadgeClass(module.status)}>
                          {module.status}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">{module.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {module.stack.map((tech) => (
                          <span key={tech} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                source: {source} · revision: {overview.revision}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div>
              {activeModule ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">{activeModule.name}</h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t('liveModule') as string}</span>
                  </div>
                  <HoverCard3D intensity={4}>
                    <div className="glass rounded-2xl p-1">
                      {renderModule(activeModule.id)}
                    </div>
                  </HoverCard3D>
                </>
              ) : null}
            </div>
          </ScrollReveal>
        </div>
        <SectionExploreCta domainHref="/projects" label="Projects" statusLabel="5 projects deployed" />
      </div>
    </section>
  )
}
