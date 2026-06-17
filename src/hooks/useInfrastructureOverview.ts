'use client'

import { staticInfrastructureOverview } from '@/lib/infrastructure/static'
import type { InfrastructureOverview } from '@/lib/infrastructure/types'
import { useMockData } from './useMockData'

export function useInfrastructureOverview() {
  const { data, source } = useMockData<InfrastructureOverview>(() => staticInfrastructureOverview)
  return { data, source }
}
