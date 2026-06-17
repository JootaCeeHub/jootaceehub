import { staticInfrastructureOverview } from '@/lib/infrastructure/static'
import type { InfrastructureOverview } from '@/lib/infrastructure/types'

export async function getInfrastructureOverview(): Promise<InfrastructureOverview> {
  return {
    ...staticInfrastructureOverview,
    generatedAt: new Date().toISOString(),
    source: 'mock',
  }
}
