'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck, Code2, TestTube2, Layers, Package,
  AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  TrendingUp, TrendingDown, Minus, BarChart2, Server, BookOpen,
  Terminal, ChevronDown, ChevronRight,
  CircleDot, Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LawCheck { id: number; name: string; pass: boolean; detail: string }
interface BundleChunk { name: string; sizeKB: number; path: string }
interface LargeFile   { file: string; lines: number }
interface ConsoleViol { file: string; line: number; code: string }
interface HistoryEntry {
  ts: string; commit: string; score: number; grade: string
  tsErrors: number; tests: number; testsPassed: number
  lintErrors: number; pages: number; bundleMB: number
  laws: number; anyCount: number; consoleViolations: number
}

interface Snapshot {
  ts: string
  git: {
    branch: string; commit: string; author: string; message: string
    dirty: boolean; ahead: number; tags: string[]
  }
  score: number
  grade: string
  ts_code: {
    errors: number; anyCount: number; srcFileCount: number
    testFileCount: number; totalLines: number
    layerLOC: Record<string, number>
    largeFiles: LargeFile[]
    untestedModules: string[]
  }
  tests: { total: number; passed: number; failed: number; skipped: number; files: number; duration: number }
  lint:  { errors: number; warnings: number; filesWithIssues: number }
  bundle: {
    jsRawBytes: number; cssRawBytes: number; htmlRawBytes: number
    chunkCount: number; pageCount: number; totalMB: number
    topChunks: BundleChunk[]
  }
  content: {
    mdxCount: number; jsonCount: number; schemaCount: number
    byType: Record<string, number>
  }
  deps: { depCount: number; devCount: number; totalCount: number; audit: Record<string, number> }
  api:  { routeFiles: number; testFiles: number; middlewareFiles: number; totalLOC: number; routes: string[] }
  laws: LawCheck[]
  lawsPassing: number
  consoleViolations: ConsoleViol[]
  consoleViolationCount: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-emerald-400', A: 'text-emerald-400', B: 'text-sky-400',
  C:    'text-amber-400',   D: 'text-orange-400',  F: 'text-rose-400',
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 36, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 90 ? '#34d399' : score >= 80 ? '#38bdf8' : score >= 70 ? '#fbbf24' : '#f87171'
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-mono text-2xl font-bold', GRADE_COLOR[grade] ?? 'text-white/60')}>{score}</span>
        <span className={cn('font-mono text-[9px] font-bold', GRADE_COLOR[grade] ?? 'text-white/40')}>{grade}</span>
      </div>
    </div>
  )
}

function Trend({ curr, prev, invert = false }: { curr: number; prev?: number; invert?: boolean }) {
  if (prev === undefined) return null
  const delta = curr - prev
  if (delta === 0) return <Minus size={10} className="text-white/20" />
  const good = invert ? delta < 0 : delta > 0
  return good
    ? <span className="flex items-center gap-0.5 text-emerald-400 font-mono text-[8px]"><TrendingUp size={9} />{delta > 0 ? '+' : ''}{delta}</span>
    : <span className="flex items-center gap-0.5 text-rose-400 font-mono text-[8px]"><TrendingDown size={9} />{delta > 0 ? '+' : ''}{delta}</span>
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.FC<React.SVGProps<SVGSVGElement> & { className?: string }>
  children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.015] overflow-hidden">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <Icon className="h-3.5 w-3.5 text-white/30" />
        <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{title}</span>
        {open ? <ChevronDown size={11} className="text-white/20" /> : <ChevronRight size={11} className="text-white/20" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  )
}

function Metric({ label, value, pass, hint, accent }: {
  label: string; value: string | number; pass?: boolean; hint?: string; accent?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {pass !== undefined && (
          pass
            ? <CheckCircle2 size={11} className="shrink-0 text-emerald-400/70" />
            : <XCircle      size={11} className="shrink-0 text-rose-400/70" />
        )}
        <span className="font-mono text-[9px] text-white/40 truncate">{label}</span>
      </div>
      <span className={cn('font-mono text-[10px] font-medium shrink-0', accent ?? (pass === true ? 'text-emerald-300/80' : pass === false ? 'text-rose-300/80' : 'text-white/60'))}>
        {value}
      </span>
      {hint && <span className="hidden md:block font-mono text-[8px] text-white/15 truncate max-w-[200px]">{hint}</span>}
    </div>
  )
}

function Row({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 px-1 py-0.5 border-b border-white/[0.03]">
      <span className="font-mono text-[9px] text-white/35 truncate">{label}</span>
      <div className="text-right shrink-0">
        <span className="font-mono text-[10px] text-white/60">{value}</span>
        {sub && <span className="font-mono text-[8px] text-white/20 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

// ─── History sparkline ────────────────────────────────────────────────────────

function HistorySparkline({ history, field }: { history: HistoryEntry[]; field: keyof HistoryEntry }) {
  if (history.length < 2) return <span className="font-mono text-[8px] text-white/15">not enough data</span>
  const vals = history.map(h => Number(h[field]))
  const min  = Math.min(...vals)
  const max  = Math.max(...vals)
  const range = max - min || 1
  return (
    <div className="flex items-end gap-0.5 h-5">
      {vals.map((v, i) => (
        <div
          key={i}
          title={`${new Date(history[i].ts).toLocaleDateString()}: ${v}`}
          className="flex-1 bg-sky-400/40 rounded-sm min-w-[3px]"
          style={{ height: `${Math.max(20, ((v - min) / range) * 100)}%` }}
        />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AuditTab() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [history,  setHistory]  = useState<HistoryEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [showAllLarge,    setShowAllLarge]    = useState(false)
  const [showAllUntested, setShowAllUntested] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [snapRes, histRes] = await Promise.all([
        fetch('/data/project-snapshot.json',    { cache: 'no-store' }),
        fetch('/data/project-audit-history.json', { cache: 'no-store' }),
      ])
      if (!snapRes.ok) throw new Error('project-snapshot.json not found')
      setSnapshot(await snapRes.json() as Snapshot)
      if (histRes.ok) setHistory(await histRes.json() as HistoryEntry[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load error')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const id = setTimeout(() => { void load() }, 0)
    return () => clearTimeout(id)
  }, [load])

  // ── loading / error states ────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center gap-3 py-12 justify-center text-white/20">
      <RefreshCw size={14} className="animate-spin" />
      <span className="font-mono text-[10px]">Loading project snapshot…</span>
    </div>
  )

  if (error || !snapshot) return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-6 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-400/60" />
        <span className="font-mono text-[10px] text-amber-400/80">Snapshot not found</span>
      </div>
      <p className="font-mono text-[9px] text-white/30">
        Generate the audit snapshot by running:
      </p>
      <code className="block rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[10px] text-cyan-300/70">
        npm run audit:project
      </code>
      <p className="font-mono text-[8px] text-white/20">
        This script collects TypeScript, tests, lint, bundle, content, deps, and laws compliance
        and writes <span className="text-white/40">public/data/project-snapshot.json</span>.
        It runs automatically at build time in CI.
      </p>
    </div>
  )

  const prev = history.length >= 2 ? history[history.length - 2] : undefined
  const s = snapshot

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 py-2">

      {/* Header: score + git */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-5">
          <ScoreRing score={s.score} grade={s.grade} />
          <div className="space-y-1">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/25">Overall Health</p>
            <div className="flex items-baseline gap-2">
              <span className={cn('font-mono text-3xl font-bold', GRADE_COLOR[s.grade] ?? 'text-white/60')}>{s.score}</span>
              <span className="font-mono text-sm text-white/30">/ 100</span>
              <Trend curr={s.score} prev={prev?.score} />
            </div>
            <p className="font-mono text-[9px] text-white/25">
              {new Date(s.ts).toLocaleString()} · {s.git.branch}@{s.git.commit}
              {s.git.dirty && <span className="ml-1 text-amber-400/60">(dirty)</span>}
            </p>
            {s.git.message && (
              <p className="font-mono text-[8px] text-white/20 max-w-xs truncate" title={s.git.message}>
                {s.git.message}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
        >
          <RefreshCw size={11} />
          Reload
        </button>
      </div>

      {/* Quick KPI row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {[
          { label: 'TS Errors',    value: s.ts_code.errors,          accent: s.ts_code.errors === 0 ? 'text-emerald-400' : 'text-rose-400',   prev: prev?.tsErrors,          invert: true  },
          { label: 'Tests',        value: `${s.tests.passed}/${s.tests.total}`, accent: s.tests.failed === 0 ? 'text-emerald-400' : 'text-rose-400', prev: prev?.testsPassed, invert: false },
          { label: 'Lint Errors',  value: s.lint.errors,             accent: s.lint.errors === 0 ? 'text-emerald-400' : 'text-rose-400',       prev: prev?.lintErrors,        invert: true  },
          { label: 'Laws',         value: `${s.lawsPassing}/10`,     accent: s.lawsPassing === 10 ? 'text-emerald-400' : 'text-amber-400',     prev: undefined,               invert: false },
          { label: 'Pages',        value: s.bundle.pageCount,        accent: 'text-sky-400',                                                   prev: prev?.pages,             invert: false },
          { label: 'Bundle JS',    value: fmtBytes(s.bundle.jsRawBytes), accent: s.bundle.jsRawBytes < 8e6 ? 'text-emerald-400' : 'text-amber-400', prev: undefined,          invert: true  },
        ].map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5 text-center">
            <p className={cn('font-mono text-base font-bold', accent)}>{value}</p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">{label}</p>
          </div>
        ))}
      </div>

      {/* Score history sparkline */}
      {history.length > 1 && (
        <div className="rounded-xl border border-white/6 bg-white/[0.025] px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={12} className="text-sky-400/60" />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Score History — Last {history.length} Runs</span>
            </div>
            <span className="font-mono text-[8px] text-white/15">
              {history[0] ? new Date(history[0].ts).toLocaleDateString() : ''} → now
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              { label: 'Health Score',  field: 'score'  as keyof HistoryEntry },
              { label: 'Tests Passing', field: 'testsPassed' as keyof HistoryEntry },
              { label: 'Laws',          field: 'laws'   as keyof HistoryEntry },
              { label: 'Pages',         field: 'pages'  as keyof HistoryEntry },
            ]).map(({ label, field }) => (
              <div key={field} className="space-y-1">
                <p className="font-mono text-[8px] text-white/20">{label}</p>
                <HistorySparkline history={history} field={field} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Laws compliance */}
      <Section title="CLAUDE.md Laws Compliance (1–10)" icon={Scale} defaultOpen>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {s.laws.map(law => (
            <div
              key={law.id}
              className={cn('flex items-start gap-2 rounded-lg border px-3 py-2',
                law.pass ? 'border-emerald-400/10 bg-emerald-400/4' : 'border-rose-400/15 bg-rose-400/5',
              )}
            >
              {law.pass
                ? <CheckCircle2 size={12} className="shrink-0 text-emerald-400/70 mt-0.5" />
                : <XCircle      size={12} className="shrink-0 text-rose-400/70 mt-0.5" />
              }
              <div className="min-w-0">
                <p className={cn('font-mono text-[9px] font-semibold', law.pass ? 'text-white/60' : 'text-rose-300/70')}>
                  Law {law.id} — {law.name}
                </p>
                <p className="font-mono text-[8px] text-white/25 leading-relaxed">{law.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TypeScript health */}
      <Section title="TypeScript Health" icon={Code2} defaultOpen>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <Metric label="TS Errors"    value={s.ts_code.errors}          pass={s.ts_code.errors === 0} />
          <Metric label="`any` usages" value={s.ts_code.anyCount}        pass={s.ts_code.anyCount === 0} hint="Each any weakens strict mode" />
          <Metric label="Src files"    value={s.ts_code.srcFileCount}    accent="text-sky-400/80" />
          <Metric label="Test files"   value={s.ts_code.testFileCount}   accent="text-sky-400/80" />
          <Metric label="Total LOC"    value={s.ts_code.totalLines.toLocaleString()} accent="text-white/50" />
          <Metric label="Test ratio"   value={`${Math.round(s.ts_code.testFileCount / (s.ts_code.srcFileCount || 1) * 100)}%`}
            pass={s.ts_code.testFileCount / (s.ts_code.srcFileCount || 1) > 0.07} hint=">7% test:src ratio" />
          <Metric label="Untested lib" value={s.ts_code.untestedModules.length} pass={s.ts_code.untestedModules.length < 20} hint="lib + hooks files without test" />
          <Metric label="Large files"  value={`${s.ts_code.largeFiles.length} >300 lines`} pass={s.ts_code.largeFiles.filter(f => f.lines > 600).length === 0} />
        </div>

        {/* LOC by layer */}
        <div className="space-y-1 mt-2">
          <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">LOC by Layer</p>
          {Object.entries(s.ts_code.layerLOC).sort(([,a],[,b]) => b - a).map(([layer, loc]) => {
            const total = Object.values(s.ts_code.layerLOC).reduce((a, b) => a + b, 0)
            const pct   = Math.round(loc / total * 100)
            return (
              <div key={layer} className="flex items-center gap-2">
                <span className="w-28 font-mono text-[8px] text-white/30 shrink-0">{layer}/</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04]">
                  <div className="h-full rounded-full bg-sky-400/30" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-16 font-mono text-[8px] text-white/35 text-right shrink-0">{loc.toLocaleString()} LOC</span>
                <span className="w-8 font-mono text-[7px] text-white/20 text-right shrink-0">{pct}%</span>
              </div>
            )
          })}
        </div>

        {/* Large files table */}
        {s.ts_code.largeFiles.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">Largest Files</p>
            {(showAllLarge ? s.ts_code.largeFiles : s.ts_code.largeFiles.slice(0, 8)).map(f => (
              <div key={f.file} className="flex items-center gap-2 rounded border border-white/[0.03] bg-white/[0.015] px-3 py-1">
                <span className="flex-1 font-mono text-[8px] text-white/30 truncate">{f.file}</span>
                <span className={cn('font-mono text-[9px] shrink-0', f.lines > 1000 ? 'text-rose-400/70' : f.lines > 500 ? 'text-amber-400/70' : 'text-white/40')}>
                  {f.lines.toLocaleString()} lines
                </span>
              </div>
            ))}
            {s.ts_code.largeFiles.length > 8 && (
              <button onClick={() => setShowAllLarge(v => !v)} className="font-mono text-[8px] text-white/20 hover:text-white/40 px-1">
                {showAllLarge ? 'Show less' : `Show all ${s.ts_code.largeFiles.length}…`}
              </button>
            )}
          </div>
        )}
      </Section>

      {/* Tests */}
      <Section title="Test Suite" icon={TestTube2} defaultOpen>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <Metric label="Total tests"   value={s.tests.total}    pass={s.tests.total > 400} hint=">400 target" />
          <Metric label="Passing"       value={s.tests.passed}   pass={s.tests.passed === s.tests.total} />
          <Metric label="Failed"        value={s.tests.failed}   pass={s.tests.failed === 0} />
          <Metric label="Test files"    value={s.tests.files}    accent="text-sky-400/80" />
          {s.tests.duration > 0 && (
            <Metric label="Duration" value={`${s.tests.duration}s`} accent="text-white/40" />
          )}
          <Metric label="Untested lib/hooks" value={s.ts_code.untestedModules.length}
            pass={s.ts_code.untestedModules.length < 15} hint="Modules in lib/ or hooks/ with no test file" />
        </div>

        {s.ts_code.untestedModules.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">
              Modules without tests ({s.ts_code.untestedModules.length})
            </p>
            {(showAllUntested ? s.ts_code.untestedModules : s.ts_code.untestedModules.slice(0, 10)).map(m => (
              <div key={m} className="flex items-center gap-2 rounded border border-amber-400/8 bg-amber-400/3 px-3 py-0.5">
                <CircleDot size={8} className="text-amber-400/30 shrink-0" />
                <span className="font-mono text-[8px] text-white/30 truncate">{m}</span>
              </div>
            ))}
            {s.ts_code.untestedModules.length > 10 && (
              <button onClick={() => setShowAllUntested(v => !v)} className="font-mono text-[8px] text-white/20 hover:text-white/40 px-1">
                {showAllUntested ? 'Show less' : `+${s.ts_code.untestedModules.length - 10} more…`}
              </button>
            )}
          </div>
        )}
      </Section>

      {/* Bundle */}
      <Section title="Bundle Analysis" icon={Layers} defaultOpen>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <Metric label="JS (raw)"  value={fmtBytes(s.bundle.jsRawBytes)}  pass={s.bundle.jsRawBytes < 10e6} hint="<10 MB raw" accent="text-sky-400/80" />
          <Metric label="CSS"       value={fmtBytes(s.bundle.cssRawBytes)} accent="text-sky-400/80" />
          <Metric label="Chunks"    value={s.bundle.chunkCount}            accent="text-white/50" />
          <Metric label="Pages"     value={s.bundle.pageCount}             accent="text-emerald-400/80" />
          <Metric label="JS est. gzip" value={`~${Math.round(s.bundle.jsRawBytes / 3 / 1024)} KB`}
            pass={s.bundle.jsRawBytes / 3 < 2.5e6} hint="÷3 estimate; real: run npm run analyze" />
          <Metric label="HTML (total)" value={fmtBytes(s.bundle.htmlRawBytes)} accent="text-white/40" />
        </div>

        {s.bundle.topChunks.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">Top 10 Largest Chunks</p>
            {s.bundle.topChunks.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 rounded border border-white/[0.03] bg-white/[0.015] px-3 py-1">
                <span className="w-4 font-mono text-[7px] text-white/20 shrink-0">{i + 1}</span>
                <span className="flex-1 font-mono text-[8px] text-white/30 truncate">{c.name}</span>
                <div className="w-16 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full bg-amber-400/30 rounded-full"
                    style={{ width: `${Math.min(100, (c.sizeKB / (s.bundle.topChunks[0]?.sizeKB || 1)) * 100)}%` }} />
                </div>
                <span className={cn('w-16 font-mono text-[9px] text-right shrink-0', c.sizeKB > 500 ? 'text-rose-400/70' : c.sizeKB > 200 ? 'text-amber-400/70' : 'text-white/40')}>
                  {c.sizeKB} KB
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Content */}
      <Section title="Content Audit" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          <Metric label="MDX files"    value={s.content.mdxCount}    accent="text-purple-400/80" />
          <Metric label="JSON files"   value={s.content.jsonCount}   accent="text-purple-400/80" />
          <Metric label="Schema files" value={s.content.schemaCount} accent="text-white/40" />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {Object.entries(s.content.byType).filter(([, v]) => v > 0).map(([type, count]) => (
            <Row key={type} label={`content/${type}/`} value={count} sub="files" />
          ))}
        </div>
      </Section>

      {/* API */}
      <Section title="API (Hono VPS)" icon={Server}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <Metric label="Route files"   value={s.api.routeFiles}     accent="text-sky-400/80" />
          <Metric label="Test files"    value={s.api.testFiles}      pass={s.api.testFiles > 0} />
          <Metric label="Middleware"    value={s.api.middlewareFiles} accent="text-white/50" />
          <Metric label="API LOC"       value={s.api.totalLOC.toLocaleString()} accent="text-white/40" />
        </div>
        {s.api.routes.length > 0 && (
          <div className="space-y-0.5 mt-2">
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">Routes</p>
            {s.api.routes.map(r => (
              <div key={r} className="flex items-center gap-2 rounded border border-white/[0.03] bg-white/[0.015] px-3 py-1">
                <span className="font-mono text-[9px] text-cyan-300/50">/{r}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Dependencies */}
      <Section title="Dependencies" icon={Package}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <Metric label="Production" value={s.deps.depCount}   accent="text-white/60" />
          <Metric label="Dev"        value={s.deps.devCount}   accent="text-white/40" />
          <Metric label="Total"      value={s.deps.totalCount} accent="text-white/50" />
        </div>
        <div className="grid grid-cols-2 gap-1 mt-1 sm:grid-cols-4">
          {(['critical', 'high', 'moderate', 'low'] as const).map(sev => {
            const count = s.deps.audit[sev] ?? 0
            return (
              <Metric key={sev} label={`${sev} vuln`} value={count}
                pass={sev === 'critical' || sev === 'high' ? count === 0 : undefined}
                accent={count > 0 ? (sev === 'critical' ? 'text-rose-400' : sev === 'high' ? 'text-orange-400' : 'text-amber-400') : 'text-emerald-400/60'}
              />
            )
          })}
        </div>
      </Section>

      {/* Lint */}
      <Section title="Lint / Code Quality" icon={ShieldCheck}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          <Metric label="Errors"       value={s.lint.errors}          pass={s.lint.errors === 0} />
          <Metric label="Warnings"     value={s.lint.warnings}        pass={s.lint.warnings === 0} />
          <Metric label="Files w/ issues" value={s.lint.filesWithIssues} pass={s.lint.filesWithIssues === 0} />
        </div>
        <div className="mt-2 space-y-1">
          <p className="font-mono text-[8px] uppercase tracking-wider text-white/20 px-1">
            console.* in production code ({s.consoleViolationCount} total)
          </p>
          {s.consoleViolations.slice(0, 8).map((v, i) => (
            <div key={i} className="flex items-start gap-2 rounded border border-amber-400/8 bg-amber-400/3 px-3 py-1">
              <AlertTriangle size={9} className="text-amber-400/40 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-mono text-[8px] text-white/30 truncate">{v.file}:{v.line}</p>
                <p className="font-mono text-[7px] text-amber-400/40 truncate">{v.code}</p>
              </div>
            </div>
          ))}
          {s.consoleViolationCount > 8 && (
            <p className="font-mono text-[8px] text-white/15 px-1">+{s.consoleViolationCount - 8} more — replace with reportError() or logger.*</p>
          )}
        </div>
      </Section>

      {/* Audit run instructions */}
      <div className="rounded-xl border border-white/6 bg-white/[0.015] px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-white/25" />
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">How to regenerate this report</span>
        </div>
        <div className="space-y-1">
          {[
            ['Full audit (with tests)',     'npm run audit:project'],
            ['Fast audit (skip tests)',     'npm run audit:project -- --no-tests'],
            ['Keep 50 history entries',     'npm run audit:project -- --history 50'],
            ['CI integration',             'runs automatically after build in .github/workflows/ci.yml'],
          ].map(([label, cmd]) => (
            <div key={label} className="flex items-center gap-3 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-1.5">
              <span className="w-44 shrink-0 font-mono text-[8px] text-white/25">{label}</span>
              <code className="font-mono text-[9px] text-cyan-300/60">{cmd}</code>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8px] text-white/15">
          Output: <code className="text-white/30">public/data/project-snapshot.json</code>
          {' '}+ <code className="text-white/30">public/data/project-audit-history.json</code> (rolling {HISTORY_N} entries)
        </p>
      </div>

    </div>
  )
}

const HISTORY_N = 30
