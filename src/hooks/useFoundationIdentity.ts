'use client'

import { buildFoundationIdentity } from '@/lib/foundation/identity'
import type { FoundationIdentity } from '@/lib/foundation/types'
import { useMockData } from './useMockData'

interface UseFoundationIdentityResult {
  identity: FoundationIdentity
  loading: boolean
  source: 'static' | 'fallback'
}

export function useFoundationIdentity(): UseFoundationIdentityResult {
  const { data: identity, source } = useMockData<FoundationIdentity>(buildFoundationIdentity)
  return { identity, loading: false, source }
}
