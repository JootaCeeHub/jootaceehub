'use client'

import React from 'react'
import { CheckCircle2, Loader2, Circle, MinusCircle, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StepStatus = 'idle' | 'running' | 'done' | 'error' | 'skipped'

export interface RunStep {
  id:      string
  label:   string
  status:  StepStatus
  ms?:     number
  detail?: string
}

export const INITIAL_STEPS: RunStep[] = [
  { id: 'nav',          label: 'Navigation timing',              status: 'idle' },
  { id: 'dom-seo',      label: 'DOM SEO audit',                  status: 'idle' },
  { id: 'dom-a11y',     label: 'DOM A11y audit',                 status: 'idle' },
  { id: 'perf-hints',   label: 'Performance hints',              status: 'idle' },
  { id: 'security-dom', label: 'Security surface',               status: 'idle' },
  { id: 'project',      label: 'Project audits (HTML/PWA/DX)',   status: 'idle' },
  { id: 'resources',    label: 'Resource timing',                status: 'idle' },
  { id: 'bundle',       label: 'Bundle inspection',              status: 'idle' },
  { id: 'psi',          label: 'PageSpeed Insights (Lighthouse)', status: 'idle' },
  { id: 'errors',       label: 'Error collection',               status: 'idle' },
  { id: 'alerts',       label: 'Alerts evaluation',              status: 'idle' },
  { id: 'cms-health',   label: 'CMS registry health',            status: 'idle' },
  { id: 'content-arch', label: 'Content architecture audit',     status: 'idle' },
  { id: 'sw-check',     label: 'Service Worker health',          status: 'idle' },
  { id: 'tech-stack',   label: 'Tech stack detection',           status: 'idle' },
  { id: 'snapshot',     label: 'Snapshot save',                  status: 'idle' },
]

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'running') return <Loader2  className="h-3 w-3 animate-spin text-rose-400" />
  if (status === 'done')    return <CheckCircle2 className="h-3 w-3 text-emerald-400/75" />
  if (status === 'error')   return <XCircle  className="h-3 w-3 text-rose-400" />
  if (status === 'skipped') return <MinusCircle className="h-3 w-3 text-white/18" />
  return <Circle className="h-3 w-3 text-white/10" />
}

function msLabel(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

interface Props {
  steps:   RunStep[]
  elapsed: number
  running: boolean
  onDismiss?: () => void
}

export function AnalysisProgress({ steps, elapsed, running, onDismiss }: Props) {
  const doneCount    = steps.filter((s) => s.status === 'done' || s.status === 'skipped').length
  const errorCount   = steps.filter((s) => s.status === 'error').length
  const currentStep  = steps.find((s) => s.status === 'running')
  const progressPct  = Math.round((doneCount / steps.length) * 100)
  const elapsedLabel = msLabel(elapsed)

  const headerText = running
    ? currentStep?.id === 'psi'
      ? 'Fetching live Lighthouse scores…'
      : `Analyzing · ${currentStep?.label ?? '…'}`
    : errorCount > 0
      ? `Analysis complete — ${errorCount} step${errorCount > 1 ? 's' : ''} failed`
      : 'Analysis complete ✓'

  const headerColor = running ? 'text-rose-400/70' : errorCount > 0 ? 'text-amber-400/70' : 'text-emerald-400/70'

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-2.5">
        {running
          ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-rose-400" />
          : errorCount > 0
            ? <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            : <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        }
        <span className={cn('flex-1 font-mono text-[9px] uppercase tracking-[0.18em]', headerColor)}>
          {headerText}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className={cn('font-mono text-[9px] tabular-nums', running ? 'text-rose-400/60' : 'text-white/25')}>
            {elapsedLabel}
          </span>
          <span className="font-mono text-[8.5px] text-white/25">{doneCount}/{steps.length}</span>
          {!running && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-1 rounded px-1.5 py-0.5 font-mono text-[7.5px] text-white/20 transition-colors hover:text-white/40"
            >
              dismiss
            </button>
          )}
        </div>
      </div>

      {/* Thin progress bar */}
      <div className="h-0.5 bg-white/4">
        <div
          className={cn(
            'h-full transition-all duration-300',
            running ? 'bg-rose-400/50' : errorCount > 0 ? 'bg-amber-400/50' : 'bg-emerald-400/50',
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps grid — 3 cols on wider layouts, 2 on narrow */}
      <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.04] xl:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 transition-colors',
              step.status === 'running' && 'bg-rose-400/[0.04]',
              step.status === 'done'    && 'bg-emerald-400/[0.015]',
              step.status === 'error'   && 'bg-rose-400/[0.04]',
            )}
          >
            <StepIcon status={step.status} />
            <div className="min-w-0 flex-1">
              <span className={cn(
                'block truncate font-mono text-[8.5px] leading-tight',
                step.status === 'running' ? 'text-white/80' :
                step.status === 'done'    ? 'text-white/42' :
                step.status === 'error'   ? 'text-rose-400/80' :
                step.status === 'skipped' ? 'text-white/18' :
                'text-white/18',
              )}>
                {step.label}
              </span>
              {step.detail && (
                <span className={cn(
                  'mt-0.5 block truncate font-mono text-[7.5px] leading-tight',
                  step.status === 'error' ? 'text-rose-400/55' : 'text-white/25',
                )}>
                  {step.detail}
                </span>
              )}
            </div>
            <div className="ml-1 shrink-0">
              {step.ms != null && (
                <span className={cn(
                  'font-mono text-[7.5px] tabular-nums',
                  step.ms > 5000 ? 'text-amber-400/60' : 'text-white/20',
                )}>
                  {msLabel(step.ms)}
                </span>
              )}
              {step.status === 'running' && step.ms == null && (
                <span className="font-mono text-[7.5px] tabular-nums text-rose-400/45">{elapsedLabel}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
