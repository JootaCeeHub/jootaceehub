'use client'

import React, { useState } from 'react'
import {
  CheckCircle2, CircleDashed, ChevronDown, ChevronRight,
  GitBranch, Database, FileJson, ShieldCheck, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type MigrationStatus = 'done' | 'bridge' | 'pending' | 'exempt'

interface ContentFile {
  path: string
  entries: number
  status: MigrationStatus
  note?: string
}

interface ContentDomain {
  id: string
  label: string
  files: ContentFile[]
  localStorageNeeded: boolean
  localStorageNote: string
}

interface LocalStorageAudit {
  page: string
  uses: boolean
  reason: string
  status: 'clean' | 'exempt' | 'todo'
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CONTENT_DOMAINS: ContentDomain[] = [
  {
    id: 'systems',
    label: 'Systems',
    localStorageNeeded: false,
    localStorageNote: 'Public systems page reads SYSTEMS_DATA from systems/data.ts → bridged to JSON',
    files: [
      { path: 'src/content/systems/index.json', entries: 4,  status: 'done',   note: 'systems/data.ts bridge active' },
      { path: 'src/content/systems/meta.json',  entries: 2,  status: 'done',   note: 'ARCHITECTURE_NOTES + SYSTEM_STATS' },
    ],
  },
  {
    id: 'labs',
    label: 'Labs',
    localStorageNeeded: false,
    localStorageNote: 'labs/page.tsx reads ALL_LABS from lib/labs/registry.ts (static TS); no localStorage',
    files: [
      { path: 'src/content/labs/index.json', entries: 5, status: 'done', note: 'Canonical JSON written; bridge pending (labs/registry.ts is rich — Phase 3)' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    localStorageNeeded: false,
    localStorageNote: 'No public projects index page yet; admin reads from AdminState',
    files: [
      { path: 'src/content/projects/index.json', entries: 4, status: 'done', note: 'Canonical JSON. Admin bridge in Phase 3.' },
    ],
  },
  {
    id: 'research',
    label: 'Research',
    localStorageNeeded: false,
    localStorageNote: 'Research page reads from MDX files via journal/articles.ts (build-time fs). No localStorage.',
    files: [
      { path: 'src/content/research/index.json', entries: 7, status: 'done', note: 'JSON index mirrors MDX frontmatter. Used for admin registry.' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    localStorageNeeded: false,
    localStorageNote: 'resources/page.tsx reads RESOURCE_CATEGORIES from lib/resources/categories.ts (static TS with LucideIcon refs)',
    files: [
      { path: 'src/content/resources/categories.json', entries: 7,  status: 'done', note: 'Data portion (no icons). categories.ts retains LucideIcon refs.' },
      { path: 'src/content/resources/tools.json',      entries: 52, status: 'done' },
      { path: 'src/content/resources/repos.json',       entries: 28, status: 'done' },
      { path: 'src/content/resources/workflows.json',   entries: 14, status: 'done' },
      { path: 'src/content/resources/prompts.json',     entries: 16, status: 'done' },
      { path: 'src/content/resources/mcp.json',         entries: 25, status: 'done' },
      { path: 'src/content/resources/agents.json',      entries: 12, status: 'done' },
      { path: 'src/content/resources/skills.json',      entries: 10, status: 'done' },
    ],
  },
  {
    id: 'taxonomies',
    label: 'Taxonomies',
    localStorageNeeded: false,
    localStorageNote: 'Tags and categories are Git-canonical only — no public page uses localStorage for this.',
    files: [
      { path: 'src/content/taxonomies/tags.json', entries: 15, status: 'done', note: '10 tags + 5 categories' },
    ],
  },
]

const LOCAL_STORAGE_AUDIT: LocalStorageAudit[] = [
  { page: 'app/[locale]/page.tsx (landing)',          uses: false, reason: 'Pure static sections. No localStorage.', status: 'clean' },
  { page: 'app/[locale]/systems/page.tsx',            uses: false, reason: 'Reads SYSTEMS_DATA from systems/data.ts → JSON bridge.', status: 'clean' },
  { page: 'app/[locale]/resources/page.tsx',          uses: false, reason: 'Reads RESOURCE_CATEGORIES from resources/categories.ts (static TS).', status: 'clean' },
  { page: 'app/[locale]/labs/page.tsx',               uses: false, reason: 'Reads ALL_LABS from labs/registry.ts (static TS).', status: 'clean' },
  { page: 'app/[locale]/intelligence/page.tsx',       uses: true,  reason: 'Reads admin-configured RSS feeds from AdminState. This is runtime config, not static content — exempt.', status: 'exempt' },
  { page: 'app/[locale]/github/page.tsx',             uses: true,  reason: 'Reads GitHub integration config from AdminState. Runtime config, not content — exempt.', status: 'exempt' },
  { page: 'app/[locale]/preview/page.tsx',            uses: true,  reason: 'Admin preview feature: shows current AdminState. Intentional — exempt.', status: 'exempt' },
  { page: 'app/[locale]/journal/**/page.tsx',         uses: false, reason: 'Reads from MDX files via journal/articles.ts (build-time Node.js fs).', status: 'clean' },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: MigrationStatus }) {
  if (status === 'done')    return <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400/80" />
  if (status === 'bridge')  return <GitBranch    className="h-3 w-3 shrink-0 text-sky-400/80" />
  if (status === 'exempt')  return <ShieldCheck  className="h-3 w-3 shrink-0 text-amber-400/70" />
  return                           <CircleDashed  className="h-3 w-3 shrink-0 text-white/25" />
}

function StatusBadge({ status }: { status: MigrationStatus | 'clean' | 'todo' }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    done:    { label: 'Done',    cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/80' },
    bridge:  { label: 'Bridge', cls: 'border-sky-400/25 bg-sky-400/8 text-sky-400/80' },
    exempt:  { label: 'Exempt', cls: 'border-amber-400/25 bg-amber-400/8 text-amber-400/80' },
    clean:   { label: 'Clean',  cls: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' },
    todo:    { label: 'Todo',   cls: 'border-white/12 bg-white/4 text-white/35' },
    pending: { label: 'Pending', cls: 'border-white/12 bg-white/4 text-white/35' },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span className={cn('rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-wider', c.cls)}>
      {c.label}
    </span>
  )
}

function DomainCard({ domain }: { domain: ContentDomain }) {
  const [open, setOpen] = useState(false)
  const totalEntries = domain.files.reduce((s, f) => s + f.entries, 0)
  const doneCount    = domain.files.filter(f => f.status === 'done').length

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.018]">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]"
      >
        <Database className="h-3.5 w-3.5 shrink-0 text-sky-400/60" />
        <span className="flex-1 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {domain.label}
        </span>
        <span className="font-mono text-[9px] text-white/35">
          {doneCount}/{domain.files.length} files · {totalEntries} entries
        </span>
        {domain.localStorageNeeded
          ? <AlertCircle className="h-3 w-3 text-rose-400/70" />
          : <CheckCircle2 className="h-3 w-3 text-emerald-400/60" />
        }
        {open
          ? <ChevronDown  className="h-3.5 w-3.5 text-white/30" />
          : <ChevronRight className="h-3.5 w-3.5 text-white/30" />
        }
      </button>

      {open && (
        <div className="border-t border-white/6 px-4 pb-3 pt-2 space-y-2">
          <p className="font-mono text-[9px] text-white/40 leading-relaxed">{domain.localStorageNote}</p>
          <div className="space-y-1 mt-2">
            {domain.files.map((f) => (
              <div key={f.path} className="flex items-start gap-2.5 rounded-lg px-3 py-2 bg-white/[0.02]">
                <StatusIcon status={f.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] text-white/65 break-all">{f.path}</span>
                    <span className="shrink-0 font-mono text-[8px] text-white/30">{f.entries} entries</span>
                    <StatusBadge status={f.status} />
                  </div>
                  {f.note && (
                    <p className="mt-0.5 font-mono text-[8px] text-white/30">{f.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function Phase2CmsTab() {
  const [lsOpen, setLsOpen] = useState(false)

  const totalFiles   = CONTENT_DOMAINS.reduce((s, d) => s + d.files.length, 0)
  const totalEntries = CONTENT_DOMAINS.reduce((s, d) => s + d.files.reduce((ss, f) => ss + f.entries, 0), 0)
  const doneFiles    = CONTENT_DOMAINS.reduce((s, d) => s + d.files.filter(f => f.status === 'done').length, 0)
  const cleanPages   = LOCAL_STORAGE_AUDIT.filter(a => a.status === 'clean').length
  const exemptPages  = LOCAL_STORAGE_AUDIT.filter(a => a.status === 'exempt').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-sky-400/60">
          Git-First CMS · Phase 2
        </div>
        <h2 className="text-base font-semibold tracking-tight text-white/90">Content Extraction</h2>
        <p className="mt-1 font-mono text-[10px] text-white/35 leading-relaxed">
          Migrating canonical content from localStorage / hardcoded TypeScript to{' '}
          <span className="text-sky-400/70">src/content/*.json</span> committed to Git.
          Public pages verified to render without localStorage.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'JSON files',     value: `${doneFiles}/${totalFiles}`, variant: doneFiles === totalFiles ? 'success' : 'warning' },
          { label: 'Entries',        value: totalEntries,                 variant: 'info' },
          { label: 'Clean pages',    value: cleanPages,                   variant: 'success' },
          { label: 'Exempt pages',   value: exemptPages,                  variant: 'neutral' },
          { label: 'localStorage',   value: 'Not needed',                 variant: 'success' },
          { label: 'Supabase',       value: 'Frozen',                     variant: 'neutral' },
        ].map(({ label, value, variant }) => {
          const cls: Record<string, string> = {
            success: 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400',
            warning: 'border-amber-400/20 bg-amber-400/6 text-amber-400',
            info:    'border-sky-400/20 bg-sky-400/6 text-sky-400',
            error:   'border-red-400/20 bg-red-400/6 text-red-400',
            neutral: 'border-white/10 bg-white/4 text-white/50',
          }
          return (
            <div key={label} className={cn('flex flex-col items-center rounded-xl border px-4 py-2', cls[variant])}>
              <div className="font-mono text-[14px] font-bold tabular-nums leading-none">{value}</div>
              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] opacity-70">{label}</div>
            </div>
          )
        })}
      </div>

      {/* Content migration status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <FileJson className="h-3.5 w-3.5 text-sky-400/60" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">Content Domains</span>
        </div>
        {CONTENT_DOMAINS.map((d) => (
          <DomainCard key={d.id} domain={d} />
        ))}
      </div>

      {/* localStorage audit */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.018]">
        <button
          onClick={() => setLsOpen(o => !o)}
          className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
          <span className="flex-1 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
            localStorage Audit — Public Pages
          </span>
          <span className="font-mono text-[9px] text-emerald-400/70">
            {cleanPages} clean · {exemptPages} exempt
          </span>
          {lsOpen
            ? <ChevronDown  className="h-3.5 w-3.5 text-white/30" />
            : <ChevronRight className="h-3.5 w-3.5 text-white/30" />
          }
        </button>

        {lsOpen && (
          <div className="border-t border-white/6 pb-3">
            <div className="divide-y divide-white/5">
              {LOCAL_STORAGE_AUDIT.map((a) => (
                <div key={a.page} className="flex items-start gap-3 px-4 py-2.5">
                  {a.status === 'clean'
                    ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/70" />
                    : a.status === 'exempt'
                    ? <ShieldCheck  className="mt-0.5 h-3 w-3 shrink-0 text-amber-400/70" />
                    : <AlertCircle  className="mt-0.5 h-3 w-3 shrink-0 text-rose-400/70" />
                  }
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] text-white/65">{a.page}</span>
                      <StatusBadge status={a.status as MigrationStatus} />
                    </div>
                    <p className="font-mono text-[8px] text-white/35 leading-relaxed">{a.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase 3 preview */}
      <div className="rounded-xl border border-white/6 bg-white/[0.01] px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30 mb-1">Next — Phase 3</p>
        <ul className="space-y-0.5">
          {[
            'Bridge labs/registry.ts → src/content/labs/index.json (rich registry migration)',
            'Bridge admin defaults/registries.ts → JSON (reduces TS bundle for admin)',
            'VPS Content API (Hono) serves JSON files with cache headers',
            'Admin CMS writes edits back to JSON via API → Git commit webhook',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CircleDashed className="mt-0.5 h-3 w-3 shrink-0 text-white/20" />
              <span className="font-mono text-[9px] text-white/35">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
