'use client'

import { CheckCircle2 } from 'lucide-react'
import { Card, AuditRow } from '../shared-components'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { DOMCheck } from '@/lib/analytics/dom-audit'

interface Props {
  domA11yChecks: DOMCheck[]
  a11yChecks: AuditCheck[]
  activeA11yChecks: AuditCheck[]
}

export function AccessibilityTab({ domA11yChecks, a11yChecks, activeA11yChecks }: Props) {
  return (
    <div className="space-y-4">
      {domA11yChecks.length > 0 && (
        <Card dot="#34d399" title={`A11y audit · ${domA11yChecks.filter(c => c.pass).length}/${domA11yChecks.length} passing · live DOM inspection`}>
          <div className="flex items-center gap-2 border-b border-white/6 pb-2 mb-1">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-emerald-400">live</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">Results from real DOM — run analysis to refresh</span>
          </div>
          <div className="divide-y divide-white/5">
            {domA11yChecks.map((item) => <AuditRow key={item.label} item={item} />)}
          </div>
        </Card>
      )}

      <Card dot="#818cf8" title={`Accessibility audit · ${a11yChecks.filter(c => c.pass).length}/${a11yChecks.length} passing · config-based`}>
        <div className="divide-y divide-white/5">
          {a11yChecks.map((item) => <AuditRow key={item.label} item={item} />)}
        </div>
      </Card>

      <Card dot="#f43f5e" title="Open issues · must fix">
        <div className="space-y-2">
          {activeA11yChecks.filter((c) => !c.pass).map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-lg border border-red-400/15 bg-red-400/4 px-3.5 py-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
              <div>
                <div className="text-[11px] font-medium text-white/70">{item.label}</div>
                <div className="mt-0.5 font-mono text-[9px] text-white/30 leading-relaxed">{item.hint}</div>
              </div>
              <span className="ml-auto shrink-0 font-mono text-[8px] uppercase tracking-wider text-red-400/80">fix</span>
            </div>
          ))}
          {activeA11yChecks.filter((c) => !c.pass).length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/6 px-4 py-3 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              All accessibility checks pass
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
