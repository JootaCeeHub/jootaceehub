'use client'

import { useMemo } from 'react'
import { Card, AuditRow } from '../shared-components'
import { RECOMMENDATIONS, SECTION_COVERAGE } from '../constants'
import type { Dispatch } from 'react'
import type { AuditCheck } from '@/lib/analytics/scoring'
import type { DOMCheck } from '@/lib/analytics/dom-audit'
import type { AdminAction } from '@/lib/admin/types'

export interface SeoConfig {
  title:         string
  description:   string
  ogImage:       string
  twitterHandle: string
  canonicalBase: string
}

interface Props {
  configSeoChecks:  AuditCheck[]
  domSeoChecks:     DOMCheck[]
  securityChecks:   DOMCheck[]
  dispatch: Dispatch<AdminAction>
  seoConfig?: SeoConfig
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseLength(value: string): number | null {
  const m = value.match(/(\d+)\s*chars?/)
  return m ? parseInt(m[1], 10) : null
}

function LengthBar({ label, value, min, ideal, max }: { label: string; value: number | null; min: number; ideal: [number, number]; max: number }) {
  const pct = value != null ? Math.min(Math.round((value / max) * 100), 100) : 0
  const idealMinPct = Math.round((ideal[0] / max) * 100)
  const idealMaxPct = Math.round((ideal[1] / max) * 100)
  const status: 'good' | 'short' | 'long' | 'empty' =
    value == null || value === 0 ? 'empty' :
    value < min ? 'short' :
    value > ideal[1] ? 'long' : 'good'
  const color = status === 'good' ? '#34d399' : status === 'empty' ? '#ffffff18' : '#f59e0b'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8.5px] text-white/45">{label}</span>
        <span className="font-mono text-[9px] font-bold tabular-nums" style={{ color }}>
          {value ?? 0} chars
          <span className="ml-1.5 font-normal text-white/25">· ideal {ideal[0]}–{ideal[1]}</span>
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/6">
        {/* ideal zone highlight */}
        <div className="absolute top-0 h-full bg-emerald-400/10 rounded-full"
          style={{ left: `${idealMinPct}%`, width: `${idealMaxPct - idealMinPct}%` }} />
        <div className="absolute top-0 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color + 'cc' }} />
      </div>
      {status !== 'good' && status !== 'empty' && (
        <p className="font-mono text-[7.5px] text-amber-400/55">
          {status === 'short' ? `Too short — add ${ideal[0] - (value ?? 0)} more chars` : `Too long — trim by ${(value ?? 0) - ideal[1]} chars`}
        </p>
      )}
    </div>
  )
}

function SeoScoreRing({ score }: { score: number }) {
  const circumf = 2 * Math.PI * 32
  const dash    = (score / 100) * circumf
  const color   = score >= 80 ? '#34d399' : score >= 55 ? '#f59e0b' : '#f43f5e'
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
        <circle cx={40} cy={40} r={32} fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={`${dash} ${circumf}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="font-mono text-[22px] font-bold leading-none tabular-nums" style={{ color }}>{score}</span>
        <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: color + '99' }}>seo</span>
      </div>
    </div>
  )
}

function SocialCardPreview({ cfg }: { cfg: SeoConfig }) {
  const domain   = cfg.canonicalBase.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'yoursite.com'
  const title    = cfg.title.slice(0, 60) || 'Page title not set'
  const desc     = cfg.description.slice(0, 150) || 'Meta description not configured — add it in the SEO panel.'
  const hasOG    = cfg.ogImage.length > 0
  const hasCard  = cfg.twitterHandle.length > 0

  return (
    <Card dot="#1d9bf0" title="Social card preview · Twitter/X · OG card simulation">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Twitter/X card */}
        <div>
          <div className="mb-1.5 font-mono text-[7.5px] uppercase tracking-wider text-white/25">Twitter / X</div>
          <div className="overflow-hidden rounded-xl border border-white/12 bg-black/40">
            <div className={`flex items-center justify-center font-mono text-[8px] text-white/25 ${hasOG ? 'h-28 bg-gradient-to-br from-slate-800/60 to-slate-900/80' : 'h-12 bg-white/[0.03] border-b border-white/6'}`}>
              {hasOG
                ? <span className="rounded border border-white/10 bg-black/30 px-2 py-0.5">{cfg.ogImage}</span>
                : <span>og:image not configured</span>
              }
            </div>
            <div className="px-3 py-2.5 space-y-1">
              <div className="font-mono text-[7.5px] text-white/28 uppercase tracking-wider">{domain}</div>
              <div className="font-mono text-[10px] font-semibold text-white/75 leading-snug line-clamp-1">{title}</div>
              <div className="font-mono text-[8.5px] text-white/38 leading-relaxed line-clamp-2">{desc}</div>
              {hasCard && <div className="font-mono text-[7px] text-white/20">{cfg.twitterHandle} · summary_large_image</div>}
            </div>
          </div>
          <div className={`mt-1 font-mono text-[7.5px] ${hasOG && hasCard ? 'text-emerald-400' : 'text-amber-400/70'}`}>
            {hasOG && hasCard ? '✓ card ready' : 'incomplete — configure OG image + twitter handle'}
          </div>
        </div>
        {/* LinkedIn / general OG */}
        <div>
          <div className="mb-1.5 font-mono text-[7.5px] uppercase tracking-wider text-white/25">LinkedIn · Slack · iMessage</div>
          <div className="overflow-hidden rounded-xl border border-white/12 bg-[#1b1f23]">
            <div className={`flex items-center justify-center font-mono text-[8px] text-white/25 ${hasOG ? 'h-28 bg-gradient-to-br from-slate-700/50 to-slate-800/70' : 'h-12 bg-white/[0.03] border-b border-white/6'}`}>
              {hasOG
                ? <span className="rounded border border-white/10 bg-black/30 px-2 py-0.5">{cfg.ogImage}</span>
                : <span>og:image missing</span>
              }
            </div>
            <div className="border-t border-white/8 px-3 py-2.5 space-y-0.5">
              <div className="font-mono text-[10px] font-semibold text-white/75 leading-snug line-clamp-1">{title}</div>
              <div className="font-mono text-[8.5px] text-white/38 leading-relaxed line-clamp-2">{desc}</div>
              <div className="font-mono text-[7.5px] text-white/22 uppercase">{domain}</div>
            </div>
          </div>
          <div className={`mt-1 font-mono text-[7.5px] ${hasOG ? 'text-emerald-400' : 'text-amber-400/70'}`}>
            {hasOG ? '✓ og:image present' : 'og:image missing — required for rich previews'}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-white/6 pt-2">
        {[
          { label: 'title chars', value: cfg.title.length, good: cfg.title.length >= 10 && cfg.title.length <= 60 },
          { label: 'desc chars',  value: cfg.description.length, good: cfg.description.length >= 50 && cfg.description.length <= 160 },
          { label: 'og:image',    value: hasOG ? 'set' : 'missing', good: hasOG },
          { label: 'tw:handle',   value: hasCard ? cfg.twitterHandle : 'missing', good: hasCard },
          { label: 'canonical',   value: cfg.canonicalBase ? domain : 'missing', good: cfg.canonicalBase.length > 0 },
        ].map(({ label, value, good }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`font-mono text-[8px] ${good ? 'text-emerald-400' : 'text-amber-400'}`}>{good ? '✓' : '⚠'}</span>
            <span className="font-mono text-[7.5px] text-white/30">{label}</span>
            <span className="font-mono text-[8px] text-white/50">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SEOTab({ configSeoChecks, domSeoChecks, securityChecks, dispatch, seoConfig }: Props) {
  const configPassing = configSeoChecks.filter(c => c.pass).length
  const domPassing    = domSeoChecks.filter(c => c.pass).length
  const configScore   = configSeoChecks.length > 0 ? Math.round(configPassing / configSeoChecks.length * 100) : 0
  const domScore      = domSeoChecks.length > 0 ? Math.round(domPassing / domSeoChecks.length * 100) : null
  const composite     = domScore != null ? Math.round(configScore * 0.6 + domScore * 0.4) : configScore

  const titleLen = useMemo(() => {
    const v = domSeoChecks.find(c => c.label === 'Page title length')?.value
    return v ? parseLength(v) : null
  }, [domSeoChecks])
  const descLen = useMemo(() => {
    const v = domSeoChecks.find(c => c.label === 'Meta description')?.value
    return v ? parseLength(v) : null
  }, [domSeoChecks])

  const failingConfig = configSeoChecks.filter(c => !c.pass)
  const failingDom    = domSeoChecks.filter(c => !c.pass)

  return (
    <div className="space-y-4">

      {/* ── SEO Score header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 rounded-xl border border-sky-400/15 bg-sky-400/[0.03] px-5 py-4">
        <SeoScoreRing score={composite} />
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Config', score: configScore, n: configPassing, total: configSeoChecks.length },
              { label: 'DOM live', score: domScore ?? 0, n: domPassing, total: domSeoChecks.length },
              { label: 'Security', score: securityChecks.length > 0 ? Math.round(securityChecks.filter(c => c.pass).length / securityChecks.length * 100) : 0, n: securityChecks.filter(c => c.pass).length, total: securityChecks.length },
            ].map(({ label, score, n, total }) => (
              <div key={label} className="rounded-xl border border-white/8 bg-black/20 p-2.5 text-center">
                <div className={`font-mono text-[18px] font-bold tabular-nums leading-none ${score >= 80 ? 'text-emerald-400' : score >= 55 ? 'text-amber-400' : 'text-rose-400'}`}>{score}</div>
                <div className="font-mono text-[7px] uppercase tracking-wider text-white/30 mt-0.5">{label}</div>
                <div className="font-mono text-[7px] text-white/18 mt-0.5">{n}/{total}</div>
              </div>
            ))}
          </div>
          {(failingConfig.length > 0 || failingDom.length > 0) && (
            <div className="font-mono text-[8px] text-white/30">
              {failingConfig.length > 0 && <span className="text-amber-400/70">{failingConfig.length} config issues</span>}
              {failingConfig.length > 0 && failingDom.length > 0 && <span className="mx-1.5 text-white/15">·</span>}
              {failingDom.length > 0 && <span className="text-rose-400/70">{failingDom.length} DOM issues</span>}
              <span className="text-white/20 ml-1.5">— run Analysis to refresh DOM checks</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Social card preview ──────────────────────────────────────────── */}
      {seoConfig && <SocialCardPreview cfg={seoConfig} />}

      {/* ── Meta length validators ────────────────────────────────────────── */}
      {(titleLen !== null || descLen !== null) && (
        <Card dot="#38bdf8" title="Meta content quality · title + description length">
          <div className="space-y-3">
            <LengthBar label="Page title" value={titleLen} min={30} ideal={[50, 60]} max={80} />
            <LengthBar label="Meta description" value={descLen} min={70} ideal={[120, 160]} max={200} />
          </div>
          <div className="flex items-center justify-end pt-1">
            <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'seo' })}
              className="font-mono text-[8.5px] text-sky-400/70 hover:text-sky-400 transition-colors">
              Edit in SEO panel →
            </button>
          </div>
        </Card>
      )}

      {/* ── Quick wins: only failing checks ──────────────────────────────── */}
      {(failingConfig.length > 0 || failingDom.length > 0) && (
        <Card dot="#f43f5e" title={`Quick wins · ${failingConfig.length + failingDom.length} failing checks`}>
          <div className="divide-y divide-white/5">
            {[...failingConfig, ...failingDom].map(item => (
              <AuditRow key={item.label} item={item} />
            ))}
          </div>
        </Card>
      )}

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
