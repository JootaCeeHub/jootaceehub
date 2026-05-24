'use client'

import { mockInfrastructureOverview } from '@/lib/infrastructure/mock'
import type { InfrastructureOverview } from '@/lib/infrastructure/types'
import { useMockData } from './useMockData'

export function useInfrastructureOverview() {
  const { data, source } = useMockData<InfrastructureOverview>(() => mockInfrastructureOverview)
  return { data, source }
}
