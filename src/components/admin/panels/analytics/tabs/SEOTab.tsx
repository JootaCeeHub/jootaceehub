'use client'

import { Card, AuditRow } from '../shared-components'
import { RECOMMENDATIONS, SECTION_COVERAGE } from '../constants'
import type { Dispatch } from 'react'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { DOMCheck } from '@/lib/analytics/dom-audit'
import type { AdminAction } from '@/lib/admin/types'

interface Props {
  configSeoChecks:  AuditCheck[]
  domSeoChecks:     DOMCheck[]
  securityChecks:   DOMCheck[]
  dispatch: Dispatch<AdminAction>
}

const recItemCls = (priority: string) => {
  const m: Record<string, string> = { high: 'border-red-400/15 bg-red-400/4', medium: 'border-amber-400/15 bg-amber-400/4', low: 'border-emerald-400/10 bg-emerald-400/3' }
  return `flex items-start gap-3 rounded-lg border px-3.5 py-3 ${m[priority] ?? ''}`
}
const recDotCls = (priority: string) => {
  const m: Record<string, string> = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-emerald-400' }
  return `mt-1.5 h-2 w-2 shrink-0 rounded-full ${m[priority] ?? 'bg-white/20'}`
}
const recPriorityCls = (priority: string) => {
  const m: Record<string, string> = { high: 'text-red-400/80', medium: 'text-amber-400/80', low: 'text-emerald-400/80' }
  return `ml-auto shrink-0 font-mono text-[8px] uppercase tracking-wider ${m[priority] ?? 'text-white/30'}`
}
const coverageTickCls = (pass: boolean) => `font-mono text-[11px] ${pass ? 'text-emerald-400' : 'text-white/15'}`

export function SEOTab({ configSeoChecks, domSeoChecks, securityChecks, dispatch }: Props) {
  return (
    <div className="space-y-4">
      <Card dot="#60a5fa" title={`SEO audit · ${configSeoChecks.filter(c => c.pass).length}/${configSeoChecks.length} passing · public pages`}>
        <div className="flex items-center gap-3 border-b border-white/6 px-4 py-2.5">
          <span className="shrink-0 rounded border border-sky-400/25 bg-sky-400/8 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-sky-400">Public pages</span>
          <span className="flex-1 font-mono text-[8.5px] text-white/28">
            Reflects what /en and /es will render — powered by Admin → SEO config
          </span>
          <button
            onClick={() => dispatch({ type: 'SET_PANEL', payload: 'seo' })}
            className="shrink-0 font-mono text-[8.5px] text-sky-400/70 hover:text-sky-400 transition-colors"
          >
            Edit SEO →
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {configSeoChecks.map((item) => <AuditRow key={item.label} item={item} />)}
        </div>
      </Card>

      {domSeoChecks.length > 0 && (
        <Card dot="#f59e0b" title={`DOM snapshot · ${domSeoChecks.filter(c => c.pass).length}/${domSeoChecks.length} passing · current page`}>
          <div className="flex items-center gap-2 border-b border-white/6 pb-2 mb-1">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-emerald-400">DOM</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">
              Live inspection of current page DOM — admin page lacks public OG/meta by design
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {domSeoChecks.map((item) => <AuditRow key={item.label} item={item} />)}
          </div>
        </Card>
      )}

      <Card dot="#f59e0b" title="Recommendations · SEO">
        <div className="space-y-2">
          {RECOMMENDATIONS.filter((r) => r.category === 'seo').map((r) => (
            <div key={r.title} className={recItemCls(r.priority)}>
              <div className={recDotCls(r.priority)} />
              <div>
                <div className="text-[11px] font-medium text-white/70">{r.title}</div>
                <div className="mt-0.5 font-mono text-[9px] text-white/30 leading-relaxed">{r.desc}</div>
              </div>
              <span className={recPriorityCls(r.priority)}>{r.priority}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card dot="#34d399" title="Content coverage matrix · sections × SEO signals">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/8">
              <th className="px-4 py-2 font-mono text-[8px] uppercase tracking-wider text-white/25 text-left">Section</th>
              <th className="py-2 px-3 font-mono text-[8px] uppercase tracking-wider text-white/25 text-center">Title</th>
              <th className="py-2 px-3 font-mono text-[8px] uppercase tracking-wider text-white/25 text-center">Desc</th>
              <th className="py-2 px-3 font-mono text-[8px] uppercase tracking-wider text-white/25 text-center">i18n</th>
              <th className="py-2 px-3 font-mono text-[8px] uppercase tracking-wider text-white/25 text-center">Schema</th>
              <th className="py-2 px-3 font-mono text-[8px] uppercase tracking-wider text-white/25 text-center">OG</th>
            </tr>
          </thead>
          <tbody>
            {SECTION_COVERAGE.map((row) => (
              <tr key={row.section} className="border-b border-white/5 last:border-0 hover:bg-white/[0.012] transition-colors">
                <td className="px-4 py-2.5 font-mono text-[10px] text-white/55">{row.section}</td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-center"><span className={coverageTickCls(row.hasTitle)}>{row.hasTitle ? '✓' : '–'}</span></td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-center"><span className={coverageTickCls(row.hasDesc)}>{row.hasDesc ? '✓' : '–'}</span></td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-center"><span className={coverageTickCls(row.hasI18n)}>{row.hasI18n ? '✓' : '–'}</span></td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-center"><span className={coverageTickCls(row.hasSchema)}>{row.hasSchema ? '✓' : '–'}</span></td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-center"><span className={coverageTickCls(row.hasOG)}>{row.hasOG ? '✓' : '–'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2 border-t border-white/8 px-4 py-2.5">
          <span className="flex-1 font-mono text-[9px] text-white/28">Global WebSite + Person JSON-LD schema · og:image configured at /og-image.png</span>
          <span className="font-mono text-[9px] text-emerald-400 font-semibold">
            {SECTION_COVERAGE.filter(r => r.hasTitle).length}/{SECTION_COVERAGE.length} titles ·{' '}
            {SECTION_COVERAGE.filter(r => r.hasI18n).length}/{SECTION_COVERAGE.length} i18n
          </span>
        </div>
      </Card>

      {securityChecks.length > 0 && (
        <Card dot="#f472b6" title={`Security Audit · ${securityChecks.filter(c => c.pass).length}/${securityChecks.length} passing · CSP, headers, HTTPS`}>
          <div className="divide-y divide-white/5">
            {securityChecks.map((check) => (
              <AuditRow key={check.label} item={check} />
            ))}
          </div>
        </Card>
      )}

      <div className="rounded-xl border border-white/6 bg-white/[0.015] px-4 py-3 font-mono text-[9.5px] text-white/30">
        Values are configured in the{' '}
        <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'seo' })} className="shrink-0 font-mono text-[8.5px] text-sky-400/70 hover:text-sky-400 transition-colors">
          SEO &amp; Meta panel
        </button>
        . Run Analysis to refresh live DOM checks.
      </div>
    </div>
  )
}
