'use client'

import { DomainLayout } from '@/components/layout/DomainLayout'
import { SystemPageTemplate } from '@/components/architecture/SystemPageTemplate'
import { GraphMetricsPanel } from '@/components/architecture/GraphMetricsPanel'
import { useTranslations } from '@/lib/i18n/context'
import { useArchitectureOverview } from '@/hooks/useArchitectureOverview'

export default function GraphragPage() {
  const t = useTranslations('domainSystems.graphrag')
  const { overview } = useArchitectureOverview()

  const config = {
    badge: t('badge') as string,
    title: t('title') as string,
    subtitle: t('subtitle') as string,
    description: t('description') as string,
    status: t('status') as string,
    notes: Array.isArray(t('notes')) ? t('notes') as unknown as string[] : [],
    integrations: ['Neo4j', 'LangGraph', 'Anthropic API', 'FastAPI', 'PostgreSQL', 'Redis', 'Python', 'NetworkX'],
  }

  return (
    <DomainLayout>
      <SystemPageTemplate config={config}>
        <GraphMetricsPanel metrics={overview.graphMetrics} />
      </SystemPageTemplate>
    </DomainLayout>
  )
}
