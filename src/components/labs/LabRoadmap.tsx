'use client'

import type { RoadmapPhase } from '@/lib/labs/registry'

interface Props {
  phases: RoadmapPhase[]
  accent: string
}

const STATUS_ICON: Record<string, string> = {
  complete: '●',
  active: '◉',
  planned: '○',
}

export function LabRoadmap({ phases, accent }: Props) {
  return (
    <div className="space-y-5">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">Roadmap</div>

      {/* Timeline track */}
      <div className="space-y-0">
        {phases.map((phase, i) => {
          const isLast = i === phases.length - 1
          return (
            <div key={phase.phase} className="relative flex gap-4">
              {/* Connector line */}
              {!isLast && (
                <div
                  className="absolute left-[17px] top-[30px] h-[calc(100%+4px)] w-px"
                  style={{
                    background:
                      phase.status === 'complete'
                        ? `linear-gradient(90deg, ${accent}60, ${accent}20)`
                        : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}

              {/* Phase node */}
              <div
                className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors"
                style={{
                  color:
                    phase.status === 'complete'
                      ? accent
                      : phase.status === 'active'
                        ? 'rgba(255,255,255,0.7)'
                        : 'rgba(255,255,255,0.2)',
                  borderColor:
                    phase.status === 'complete'
                      ? `${accent}40`
                      : phase.status === 'active'
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(255,255,255,0.06)',
                  background:
                    phase.status === 'active' ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                <span className="absolute text-[8px]">{STATUS_ICON[phase.status]}</span>
                <span className="sr-only">{phase.phase}</span>
              </div>

              {/* Phase label */}
              <div className="flex-1 pb-6 pt-1">
                <span
                  className="block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
                  style={{
                    color:
                      phase.status === 'complete'
                        ? accent
                        : phase.status === 'active'
                          ? 'rgba(255,255,255,0.75)'
                          : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {phase.label}
                </span>
                <div className="space-y-1">
                  {phase.items.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{
                          background:
                            phase.status === 'complete'
                              ? accent
                              : phase.status === 'active'
                                ? 'rgba(255,255,255,0.4)'
                                : 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <span
                        className="text-[11px] leading-relaxed"
                        style={{
                          color:
                            phase.status === 'complete'
                              ? 'rgba(255,255,255,0.45)'
                              : phase.status === 'active'
                                ? 'rgba(255,255,255,0.5)'
                                : 'rgba(255,255,255,0.18)',
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
