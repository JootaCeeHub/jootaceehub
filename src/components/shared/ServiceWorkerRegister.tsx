'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js')
      .then((r) => logger.info('SW registered:', r.scope))
      .catch((e) => logger.warn('SW registration failed:', e))
  }, [])

  return null
}
