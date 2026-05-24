'use client'

import { buildArchitectureOverview } from '@/lib/architecture/overview'
import type { ArchitectureOverview } from '@/lib/architecture/types'
import { useMockData } from './useMockData'

export function useArchitectureOverview() {
  const { data: overview, source } = useMockData<ArchitectureOverview>(buildArchitectureOverview)
  return { overview, source }
}
