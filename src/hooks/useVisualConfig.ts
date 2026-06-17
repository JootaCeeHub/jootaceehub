'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import type { VisualEffectsConfig, HeroSceneConfig, PageEffectsMap } from '@/lib/admin/types'
import { defaultVisualEffects, defaultHeroSceneConfig, defaultPageEffectsMap } from '@/lib/admin/defaults/effects'

const ADMIN_KEY = 'jootacee-command-v2'

interface VisualConfig {
  visualEffects: VisualEffectsConfig
  heroScene: HeroSceneConfig
  pageEffectsMap: PageEffectsMap
}

function readConfig(): VisualConfig {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return { visualEffects: defaultVisualEffects, heroScene: defaultHeroSceneConfig, pageEffectsMap: defaultPageEffectsMap }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      visualEffects: (parsed.visualEffects as VisualEffectsConfig | undefined) ?? defaultVisualEffects,
      heroScene:     (parsed.heroSceneConfig as HeroSceneConfig | undefined)  ?? defaultHeroSceneConfig,
      pageEffectsMap:(parsed.pageEffectsMap as PageEffectsMap | undefined)    ?? defaultPageEffectsMap,
    }
  } catch {
    return { visualEffects: defaultVisualEffects, heroScene: defaultHeroSceneConfig, pageEffectsMap: defaultPageEffectsMap }
  }
}

export function useVisualConfig(): VisualConfig {
  const [config, setConfig] = useState<VisualConfig>(() => {
    if (typeof window === 'undefined') {
      return { visualEffects: defaultVisualEffects, heroScene: defaultHeroSceneConfig, pageEffectsMap: defaultPageEffectsMap }
    }
    return readConfig()
  })

  useEffect(() => {
    setConfig(readConfig())

    const onStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_KEY) setConfig(readConfig())
    }
    // Also listen for custom events fired within the same tab (admin → website)
    const onAdminSave = () => setConfig(readConfig())

    window.addEventListener('storage', onStorage)
    window.addEventListener('admin-state-saved', onAdminSave)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin-state-saved', onAdminSave)
    }
  }, [])

  return config
}
