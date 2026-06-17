'use client'

import React from 'react'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { DOMCheck } from '@/lib/analytics/dom-audit'

export function Card({
  dot,
  title,
  action,
  children,
}: {
  dot: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="flex-1 text-[10px] uppercase tracking-[0.2em] text-white/50">{title}</span>
        {action}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

export function ScoreRing({ label, score }: { label: string; score: number }) {
  const circumference = 2 * Math.PI * 24
  const fill  = (score / 100) * circumference
  const color = score >= 90 ? '#34d399' : score >= 50 ? '#f59e0b' : '#f87171'
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-14 w-14">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="24" strokeWidth="4" className="fill-none stroke-white/8" />
          <circle cx="28" cy="28" r="24" strokeWidth="4" stroke={color}
            strokeDasharray={`${fill} ${circumference}`} strokeLinecap="round" fill="none" />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-mono text-[13px] font-bold ${score >= 90 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}</div>
      </div>
      <div className="font-mono text-[8.5px] uppercase tracking-wider text-white/35 text-center leading-tight">{label}</div>
    </div>
  )
}

export function AuditRow({ item }: { item: AuditCheck | DOMCheck }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className={`w-3 shrink-0 font-mono text-[9px] ${item.pass ? 'text-emerald-400' : 'text-red-400/70'}`}>{item.pass ? '✓' : '✗'}</span>
      <span className="flex-1 min-w-0 font-mono text-[9.5px] text-white/55 truncate">{item.label}</span>
      <span className="hidden font-mono text-[8px] text-white/22 lg:block">{item.hint}</span>
      <span className="font-mono text-[9px] text-white/40 shrink-0">{item.value}</span>
      <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${item.pass ? 'border-emerald-400/20 text-emerald-400' : 'border-red-400/20 text-red-400/70'}`}>{item.pass ? 'pass' : 'fail'}</span>
    </div>
  )
}
