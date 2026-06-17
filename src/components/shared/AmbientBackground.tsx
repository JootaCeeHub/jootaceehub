'use client'

const domainOrbs: Record<string, { color: string; pos: string; delay?: string }[]> = {
  systems: [
    { color: 'bg-[var(--systems-accent)]/6', pos: '-top-32 -left-32 h-[400px] w-[400px]' },
    { color: 'bg-[var(--labs-accent)]/4', pos: 'bottom-0 right-0 h-[320px] w-[320px]' },
  ],
  labs: [
    { color: 'bg-[var(--labs-accent)]/6', pos: '-top-32 right-0 h-[400px] w-[400px]' },
    { color: 'bg-[var(--systems-accent)]/4', pos: 'bottom-0 -left-32 h-[320px] w-[320px]' },
  ],
  infrastructure: [
    { color: 'bg-[var(--infrastructure-accent)]/5', pos: '-top-32 -left-32 h-[400px] w-[400px]' },
    { color: 'bg-primary/4', pos: 'bottom-0 right-0 h-[320px] w-[320px]' },
  ],
  journal: [
    { color: 'bg-[var(--journal-accent)]/5', pos: '-top-32 -right-32 h-[400px] w-[400px]' },
    { color: 'bg-primary/4', pos: 'bottom-0 left-0 h-[320px] w-[320px]' },
  ],
  default: [
    { color: 'bg-primary/5', pos: '-top-32 -left-32 h-[400px] w-[400px]' },
    { color: 'bg-accent/3', pos: 'bottom-0 right-0 h-[320px] w-[320px]' },
  ],
}

interface AmbientBackgroundProps {
  domain?: 'systems' | 'labs' | 'infrastructure' | 'journal' | 'default'
  aurora?: boolean
}

export function AmbientBackground({ domain = 'default', aurora = false }: AmbientBackgroundProps) {
  const orbs = domainOrbs[domain] ?? domainOrbs.default

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {aurora && <div className="absolute inset-0 animate-aurora opacity-40" />}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[80px] ${orb.color} ${orb.pos}`}
          style={{ animationDelay: orb.delay ?? '0s' }}
        />
      ))}
    </div>
  )
}
