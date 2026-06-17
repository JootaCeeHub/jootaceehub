'use client'

import { DomainLayout } from '@/components/layout/DomainLayout'
import { SystemPageTemplate } from '@/components/architecture/SystemPageTemplate'
import { MCPMap } from '@/components/architecture/MCPMap'
import { useTranslations } from '@/lib/i18n/context'
import { useArchitectureOverview } from '@/hooks/useArchitectureOverview'

export default function McpPage() {
  const t = useTranslations('domainSystems.mcp')
  const { overview } = useArchitectureOverview()

  const config = {
    badge: t('badge') as string,
    title: t('title') as string,
    subtitle: t('subtitle') as string,
    description: t('description') as string,
    status: t('status') as string,
    notes: Array.isArray(t('notes')) ? t('notes') as unknown as string[] : [],
    integrations: ['Claude API', 'FastAPI', 'Redis', 'PostgreSQL', 'LangGraph', 'AURA Core', 'Docker', 'WebSocket'],
  }

  return (
    <DomainLayout>
      <SystemPageTemplate config={config}>
        <MCPMap nodes={overview.mcpMap.nodes} edges={overview.mcpMap.edges} />
      </SystemPageTemplate>
    </DomainLayout>
  )
}
