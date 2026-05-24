import type { DeviceTier } from '@/lib/visuals/types'

const tierBackground: Record<DeviceTier, string> = {
  low: 'bg-[radial-gradient(circle_at_30%_35%,rgba(73,183,255,0.16),transparent_40%),radial-gradient(circle_at_75%_30%,rgba(110,247,255,0.08),transparent_32%)]',
  balanced:
    'bg-[radial-gradient(circle_at_30%_35%,rgba(73,183,255,0.22),transparent_40%),radial-gradient(circle_at_75%_30%,rgba(110,247,255,0.12),transparent_32%)]',
  high: 'bg-[radial-gradient(circle_at_30%_35%,rgba(73,183,255,0.28),transparent_40%),radial-gradient(circle_at_75%_30%,rgba(110,247,255,0.15),transparent_32%)]',
}

export function SceneFallback({ tier = 'balanced' }: { tier?: DeviceTier }) {
  return (
    <div className="absolute inset-0 -z-10">
      <div className={`absolute inset-0 ${tierBackground[tier]}`} />
      <div className="tech-grid" />
    </div>
  )
}
