'use client'

import { buildLabsOverview } from '@/lib/labs/overview'
import type { LabsOverview } from '@/lib/labs/types'
import { useMockData } from './useMockData'

export function useLabsOverview() {
  const { data: overview, source } = useMockData<LabsOverview>(buildLabsOverview)
  return { overview, source }
}
