export type DeviceTier = 'low' | 'balanced' | 'high'

export interface SceneConfig {
  version: string
  tier: DeviceTier
  particleCount: number
  lineCount: number
  sphereRadius: number
  backgroundOpacity: number
  parallaxStrength: number
  postFx: {
    bloomLikeGlow: boolean
    vignette: boolean
  }
}

