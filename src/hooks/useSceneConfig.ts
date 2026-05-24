'use client'

import { useEffect, useMemo, useState } from 'react'
import { buildSceneConfig } from '@/lib/visuals/config'
import type { DeviceTier, SceneConfig } from '@/lib/visuals/types'

function detectTier(): DeviceTier {
  if (typeof window === 'undefined') return 'balanced'
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4

  if (cores <= 4 || memory <= 4) return 'low'
  if (cores >= 10 && memory >= 8) return 'high'
  return 'balanced'
}

export function useSceneConfig(initialTier: DeviceTier = 'balanced') {
  const fallback = useMemo(() => buildSceneConfig(initialTier), [initialTier])
  const [config, setConfig] = useState<SceneConfig>(fallback)
  const [source, setSource] = useState<'local' | 'fallback'>('local')

  useEffect(() => {
    const tier = detectTier()
    setConfig(buildSceneConfig(tier))
    setSource('local')
  }, [])

  return { config, source }
}
