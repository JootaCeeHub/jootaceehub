import type { DeviceTier } from '@/lib/visuals/types'

export interface VisualTelemetryEvent {
  timestamp: number
  sessionId: string
  tier: DeviceTier
  fps: number
  quality: number
  reducedMotion: boolean
  source: 'local' | 'fallback'
  particles: number
  lines: number
}

export interface VisualTelemetryAggregate {
  sampleCount: number
  averageFps: number
  averageQuality: number
  byTier: Record<DeviceTier, { samples: number; averageFps: number; averageQuality: number }>
  reducedMotionRatio: number
  lastUpdated: number | null
}
