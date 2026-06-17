'use client'

import { DomainLayout } from '@/components/layout/DomainLayout'
import { SystemPageTemplate } from '@/components/architecture/SystemPageTemplate'
import { AuraSignalPanel } from '@/components/architecture/AuraSignalPanel'
import { useTranslations } from '@/lib/i18n/context'
import { useArchitectureOverview } from '@/hooks/useArchitectureOverview'

export default function AgentsPage() {
  const t = useTranslations('domainSystems.agents')
  const { overview } = useArchitectureOverview()

  const config = {
    badge: t('badge') as string,
    title: t('title') as string,
    subtitle: t('subtitle') as string,
    description: t('description') as string,
    status: t('status') as string,
    notes: Array.isArray(t('notes')) ? t('notes') as unknown as string[] : [],
    integrations: ['AURA Core', 'MCP Gateway', 'GraphRAG', 'Claude API', 'LangGraph', 'Redis', 'FastAPI', 'WebSocket'],
  }

  return (
    <DomainLayout>
      <SystemPageTemplate config={config}>
        <AuraSignalPanel signals={overview.auraSignals} />
      </SystemPageTemplate>
    </DomainLayout>
  )
}
