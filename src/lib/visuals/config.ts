import type { DeviceTier, SceneConfig } from '@/lib/visuals/types'

function withEnvTuning(config: SceneConfig): SceneConfig {
  const factorRaw = process.env.NEXT_PUBLIC_SCENE_COMPLEXITY_FACTOR
  const factor = factorRaw ? Number(factorRaw) : 1
  const safeFactor = Number.isFinite(factor) ? Math.min(1.4, Math.max(0.5, factor)) : 1

  return {
    ...config,
    particleCount: Math.max(380, Math.floor(config.particleCount * safeFactor)),
    lineCount: Math.max(12, Math.floor(config.lineCount * safeFactor)),
  }
}

export function buildSceneConfig(tier: DeviceTier = 'balanced'): SceneConfig {
  if (tier === 'low') {
    return withEnvTuning({
      version: 'phase-2-cinematic',
      tier,
      particleCount: 900,
      lineCount: 24,
      sphereRadius: 1.6,
      backgroundOpacity: 0.2,
      parallaxStrength: 0.18,
      postFx: { bloomLikeGlow: false, vignette: true },
    })
  }

  if (tier === 'high') {
    return withEnvTuning({
      version: 'phase-2-cinematic',
      tier,
      particleCount: 2200,
      lineCount: 56,
      sphereRadius: 2.2,
      backgroundOpacity: 0.34,
      parallaxStrength: 0.3,
      postFx: { bloomLikeGlow: true, vignette: true },
    })
  }

  return withEnvTuning({
    version: 'phase-2-cinematic',
    tier,
    particleCount: 1500,
    lineCount: 38,
    sphereRadius: 1.9,
    backgroundOpacity: 0.27,
    parallaxStrength: 0.24,
    postFx: { bloomLikeGlow: true, vignette: true },
  })
}
