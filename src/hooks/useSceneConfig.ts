'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import { buildSceneConfig } from '@/lib/visuals/config'
import type { DeviceTier, SceneConfig } from '@/lib/visuals/types'

const ADMIN_STORAGE_KEY = 'jootacee-command-v2'

function detectTier(): DeviceTier {
  if (typeof window === 'undefined') return 'balanced'
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4

  if (cores <= 4 || memory <= 4) return 'low'
  if (cores >= 10 && memory >= 8) return 'high'
  return 'balanced'
}

interface SceneAdminConfig {
  enabled: boolean
  override: Partial<SceneConfig> | null
  colorA: string
  colorB: string
  animated: boolean
}

function readAdminSceneConfig(): SceneAdminConfig {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    const defaults: SceneAdminConfig = {
      enabled: true, override: null, colorA: '#49b7ff', colorB: '#6ef7ff', animated: true,
    }
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const hero = parsed?.heroSceneConfig as Record<string, unknown> | undefined
    if (!hero) return defaults

    if (hero.enabled === false) {
      return { ...defaults, enabled: false, override: null }
    }

    const tierStr = hero.tierOverride as string | undefined
    const resolved: DeviceTier = (tierStr && tierStr !== 'auto') ? (tierStr as DeviceTier) : detectTier()

    return {
      enabled: true,
      colorA:   typeof hero.colorA === 'string' ? hero.colorA : '#49b7ff',
      colorB:   typeof hero.colorB === 'string' ? hero.colorB : '#6ef7ff',
      animated: hero.animated !== false,
      override: {
        tier: resolved,
        particleCount: typeof hero.particleCount === 'number' ? hero.particleCount : undefined,
        lineCount: typeof hero.lineCount === 'number' ? hero.lineCount : undefined,
        sphereRadius: typeof hero.sphereRadius === 'number' ? hero.sphereRadius : undefined,
        backgroundOpacity: typeof hero.backgroundOpacity === 'number' ? hero.backgroundOpacity : undefined,
        parallaxStrength: typeof hero.parallaxStrength === 'number' ? hero.parallaxStrength : undefined,
        postFx: {
          bloomLikeGlow: hero.postFxBloom !== false,
          vignette: hero.postFxVignette !== false,
        },
      },
    }
  } catch {
    return { enabled: true, override: null, colorA: '#49b7ff', colorB: '#6ef7ff', animated: true }
  }
}

export function useSceneConfig(initialTier: DeviceTier = 'balanced') {
  const fallback = useMemo(() => buildSceneConfig(initialTier), [initialTier])
  const [config, setConfig] = useState<SceneConfig>(fallback)
  const [source, setSource] = useState<'local' | 'fallback'>('local')
  const [adminConfig, setAdminConfig] = useState<SceneAdminConfig>({ enabled: true, override: null, colorA: '#49b7ff', colorB: '#6ef7ff', animated: true })

  function reload() {
    const ac = readAdminSceneConfig()
    setAdminConfig(ac)
    if (ac.override) {
      const base = buildSceneConfig(ac.override.tier ?? detectTier())
      setConfig({ ...base, ...ac.override })
    } else {
      setConfig(buildSceneConfig(detectTier()))
    }
    setSource('local')
  }

  useEffect(() => {
    reload()
    const onStorage = (e: StorageEvent) => { if (e.key === ADMIN_STORAGE_KEY) reload() }
    const onSave = () => reload()
    window.addEventListener('storage', onStorage)
    window.addEventListener('admin-state-saved', onSave)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin-state-saved', onSave)
    }
  }, [])

  return {
    config,
    source,
    sceneEnabled: adminConfig.enabled,
    colorA: adminConfig.colorA,
    colorB: adminConfig.colorB,
    animated: adminConfig.animated,
  }
}
