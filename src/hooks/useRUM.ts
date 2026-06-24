'use client'

import { useEffect } from 'react'
import { installRUM } from '@/lib/performance/rum'

/**
 * Mounts Real User Monitoring once per page session.
 * Call inside HomeClient or any root client layout.
 */
export function useRUM(): void {
  useEffect(() => {
    installRUM()
  }, [])
}
