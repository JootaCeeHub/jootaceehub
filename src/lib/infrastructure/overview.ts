import { mockInfrastructureOverview } from '@/lib/infrastructure/mock'
import type { InfrastructureOverview } from '@/lib/infrastructure/types'

export async function getInfrastructureOverview(): Promise<InfrastructureOverview> {
  const mode = process.env.INFRASTRUCTURE_SOURCE_MODE

  if (mode === 'mock' || !mode) {
    return {
      ...mockInfrastructureOverview,
      generatedAt: new Date().toISOString(),
      source: 'mock',
    }
  }

  return {
    ...mockInfrastructureOverview,
    generatedAt: new Date().toISOString(),
    source: 'live',
  }
}
