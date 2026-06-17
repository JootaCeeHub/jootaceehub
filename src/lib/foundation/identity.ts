import { brand, heroSignals, navItems } from '@/lib/config/brand'
import type { FoundationIdentity } from '@/lib/foundation/types'

// Stable singleton — prevents useMockData's useEffect from triggering a
// re-render on every mount due to referential inequality from new Date().
let _cachedIdentity: FoundationIdentity | null = null

export function buildFoundationIdentity(): FoundationIdentity {
  if (_cachedIdentity) return _cachedIdentity
  _cachedIdentity = {
    brand,
    navItems,
    heroSignals,
    status: 'operational',
    revision: 'phase-1-core-identity',
    generatedAt: new Date().toISOString(),
  }
  return _cachedIdentity
}
