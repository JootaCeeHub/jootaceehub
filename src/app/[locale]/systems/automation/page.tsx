'use client'

import { DomainLayout } from '@/components/layout/DomainLayout'
import { SystemPageTemplate } from '@/components/architecture/SystemPageTemplate'
import { FlowTimeline } from '@/components/architecture/FlowTimeline'
import { useTranslations } from '@/lib/i18n/context'
import { useArchitectureOverview } from '@/hooks/useArchitectureOverview'

export default function AutomationPage() {
  const t = useTranslations('domainSystems.automation')
  const { overview } = useArchitectureOverview()

  const config = {
    badge: t('badge') as string,
    title: t('title') as string,
    subtitle: t('subtitle') as string,
    description: t('description') as string,
    status: t('status') as string,
    notes: Array.isArray(t('notes')) ? t('notes') as unknown as string[] : [],
    integrations: ['n8n', 'Redis', 'PostgreSQL', 'FastAPI', 'Claude API', 'Docker', 'Webhooks', 'AURA Core'],
  }

  return (
    <DomainLayout>
      <SystemPageTemplate config={config}>
        <FlowTimeline steps={overview.aiFlow} />
      </SystemPageTemplate>
    </DomainLayout>
  )
}
