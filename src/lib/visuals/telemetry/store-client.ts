import type { VisualTelemetryEvent, VisualTelemetryAggregate } from '@/lib/visuals/telemetry/types'
import type { DeviceTier } from '@/lib/visuals/types'

const events: VisualTelemetryEvent[] = []
const MAX_EVENTS = 500

export function addTelemetryEvent(event: VisualTelemetryEvent): void {
  events.push(event)
  if (events.length > MAX_EVENTS) {
    events.shift()
  }
}

export function getTelemetryAggregate(): VisualTelemetryAggregate {
  const total = events.length
  if (total === 0) {
    return {
      sampleCount: 0,
      averageFps: 60,
      averageQuality: 1,
      byTier: {
        low: { samples: 0, averageFps: 0, averageQuality: 0 },
        balanced: { samples: 0, averageFps: 0, averageQuality: 0 },
        high: { samples: 0, averageFps: 0, averageQuality: 0 },
      },
      reducedMotionRatio: 0,
      lastUpdated: null,
    }
  }

  const avg = (key: keyof VisualTelemetryEvent) =>
    events.reduce((sum, e) => sum + (e[key] as number), 0) / total

  const byTier: Record<DeviceTier, { samples: number; averageFps: number; averageQuality: number }> = {
    low: { samples: 0, averageFps: 0, averageQuality: 0 },
    balanced: { samples: 0, averageFps: 0, averageQuality: 0 },
    high: { samples: 0, averageFps: 0, averageQuality: 0 },
  }

  for (const tier of ['low', 'balanced', 'high'] as DeviceTier[]) {
    const tierEvents = events.filter((e) => e.tier === tier)
    if (tierEvents.length > 0) {
      byTier[tier] = {
        samples: tierEvents.length,
        averageFps: tierEvents.reduce((s, e) => s + e.fps, 0) / tierEvents.length,
        averageQuality: tierEvents.reduce((s, e) => s + e.quality, 0) / tierEvents.length,
      }
    }
  }

  const reducedCount = events.filter((e) => e.reducedMotion).length

  return {
    sampleCount: total,
    averageFps: Math.round(avg('fps')),
    averageQuality: Number(avg('quality').toFixed(3)),
    byTier,
    reducedMotionRatio: Number((reducedCount / total).toFixed(2)),
    lastUpdated: Date.now(),
  }
}
