'use client'

interface OperationalGridProps {
  scanLine?: boolean
}

export function OperationalGrid({ scanLine = true }: OperationalGridProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-operational-grid opacity-[0.35]" />
      {scanLine && <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-grid-scan" />}
    </div>
  )
}
