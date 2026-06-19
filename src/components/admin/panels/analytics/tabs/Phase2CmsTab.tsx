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
  publicBridge: string
  adminBridge: string
  localStorageNeeded: boolean
  files: ContentFile[]
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
    publicBridge:  'lib/systems/data.ts → src/content/systems/index.json ✓',
    adminBridge:   'admin/defaults/registries.ts → src/content/systems/index.json ✓',
    files: [
      { path: 'src/content/systems/index.json', entries: 4,  status: 'done', note: 'SYSTEMS_DATA bridge active — public + admin' },
      { path: 'src/content/systems/meta.json',  entries: 2,  status: 'done', note: 'ARCHITECTURE_NOTES + SYSTEM_STATS' },
    ],
  },
  {
    id: 'labs',
    label: 'Labs',
    localStorageNeeded: false,
    publicBridge:  'lib/labs/registry.ts ALL_LABS → src/content/labs/index.json ✓',
    adminBridge:   'admin/defaults/registries.ts → src/content/labs/index.json ✓',
    files: [
      { path: 'src/content/labs/index.json', entries: 5, status: 'done', note: 'Hub catalog from JSON; arch/roadmap stays in TS (cannot serialize to JSON)' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    localStorageNeeded: false,
    publicBridge:  'No public projects index page — admin-only via AdminState',
    adminBridge:   'admin/defaults/registries.ts → src/content/projects/index.json ✓',
    files: [
      { path: 'src/content/projects/index.json', entries: 4, status: 'done', note: 'Admin defaults now seeded from JSON' },
    ],
  },
  {
    id: 'research',
    label: 'Research / MDX',
    localStorageNeeded: false,
    publicBridge:  'lib/journal/articles.ts reads MDX from src/content/journal/ (build-time fs) ✓',
    adminBridge:   'admin/defaults/registries.ts → src/content/research/index.json ✓',
    files: [
      { path: 'src/content/journal/*.mdx',       entries: 7, status: 'done', note: '7 MDX files — Git canonical, read at build time via Node.js fs' },
      { path: 'src/content/research/index.json', entries: 7, status: 'done', note: 'JSON index mirrors frontmatter — admin registry source' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    localStorageNeeded: false,
    publicBridge:  'lib/resources/categories.ts → src/content/resources/categories.json ✓ (icons stay in TS)',
    adminBridge:   'admin/defaults/registries.ts → src/content/resources/*.json ✓',
    files: [
      { path: 'src/content/resources/categories.json', entries: 7,  status: 'done', note: 'categories.ts bridge active; LucideIcons mapped in TS' },
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
    publicBridge:  'No public taxonomy page — content tagging only',
    adminBridge:   'src/content/taxonomies/tags.json committed to Git ✓',
    files: [
      { path: 'src/content/taxonomies/tags.json', entries: 15, status: 'done', note: '10 tags + 5 categories — Git canonical' },
    ],
  },
]

const LOCAL_STORAGE_AUDIT: LocalStorageAudit[] = [
  { page: 'app/[locale]/page.tsx (landing)',      uses: false, reason: 'All sections read static TS/i18n data at build time. No localStorage.', status: 'clean' },
  { page: 'app/[locale]/systems/page.tsx',        uses: false, reason: 'SYSTEMS_DATA from lib/systems/data.ts → bridged to JSON. No localStorage.', status: 'clean' },
  { page: 'app/[locale]/resources/page.tsx',      uses: false, reason: 'RESOURCE_CATEGORIES from lib/resources/categories.ts → bridged to JSON. No localStorage.', status: 'clean' },
  { page: 'app/[locale]/labs/page.tsx',           uses: false, reason: 'ALL_LABS from lib/labs/registry.ts → bridged to JSON catalog. No localStorage.', status: 'clean' },
  { page: 'app/[locale]/research/page.tsx',       uses: false, reason: 'getAllMeta() reads MDX from src/content/journal/ via Node.js fs at build time.', status: 'clean' },
  { page: 'app/[locale]/journal/[slug]/page.tsx', uses: false, reason: 'Individual article pages read MDX at build time — getArticleBySlug().', status: 'clean' },
  { page: 'app/[locale]/intelligence/page.tsx',   uses: true,  reason: 'Reads admin-configured RSS feeds from AdminState. Runtime config, not static content — exempt.', status: 'exempt' },
  { page: 'app/[locale]/github/page.tsx',         uses: true,  reason: 'Reads GitHub integration config from AdminState. Runtime config, not content — exempt.', status: 'exempt' },
  { page: 'app/[locale]/preview/page.tsx',        uses: true,  reason: 'Admin preview feature: renders current AdminState as HTML preview. Intentional — exempt.', status: 'exempt' },
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
          <div className="space-y-1">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">Public page bridge</p>
            <p className="font-mono text-[9px] text-emerald-400/70">{domain.publicBridge}</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25 mt-1">Admin defaults bridge</p>
            <p className="font-mono text-[9px] text-sky-400/70">{domain.adminBridge}</p>
          </div>
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
  const activeBridges = 5 // systems, labs, resources, admin-defaults (4 registries → 1 file), research-mdx

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-sky-400/60">
          Git-First CMS · Phase 2 · 100% Complete
        </div>
        <h2 className="text-base font-semibold tracking-tight text-white/90">Content Extraction</h2>
        <p className="mt-1 font-mono text-[10px] text-white/35 leading-relaxed">
          All canonical content migrated from localStorage / hardcoded TypeScript to{' '}
          <span className="text-sky-400/70">src/content/*.json</span> committed to Git.
          Public pages and admin defaults verified to read from JSON at build time.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'JSON files',     value: `${doneFiles}/${totalFiles}`, variant: doneFiles === totalFiles ? 'success' : 'warning' },
          { label: 'Total entries',  value: totalEntries,                 variant: 'info' },
          { label: 'Active bridges', value: activeBridges,               variant: 'success' },
          { label: 'Clean pages',    value: cleanPages,                   variant: 'success' },
          { label: 'Exempt pages',   value: exemptPages,                  variant: 'neutral' },
          { label: 'localStorage',   value: 'Not needed',                 variant: 'success' },
          { label: 'Supabase',       value: 'Frozen',                     variant: 'neutral' },
          { label: 'Phase 2',        value: '100%',                       variant: 'success' },
        ].map(({ label, value, variant }) => {
          const cls: Record<string, string> = {
            success: 'border-emerald-400/20 bg-emerald-400/6 text-emerald-400',
            warning: 'border-amber-400/20 bg-amber-400/6 text-amber-400',
            info:    'border-sky-400/20 bg-sky-400/6 text-sky-400',
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

      {/* Bridge architecture summary */}
      <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.025] px-4 py-3 space-y-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sky-400/60">Bridge Architecture</p>
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {[
            { from: 'lib/systems/data.ts',            to: 'src/content/systems/index.json' },
            { from: 'lib/labs/registry.ts (ALL_LABS)', to: 'src/content/labs/index.json' },
            { from: 'lib/resources/categories.ts',    to: 'src/content/resources/categories.json' },
            { from: 'admin/defaults/registries.ts',   to: 'src/content/**/*.json (all 11 files)' },
            { from: 'lib/journal/articles.ts',        to: 'src/content/journal/*.mdx (build-time fs)' },
          ].map(({ from, to }) => (
            <div key={from} className="flex items-start gap-2 rounded-lg bg-white/[0.025] px-3 py-2">
              <GitBranch className="mt-0.5 h-3 w-3 shrink-0 text-sky-400/60" />
              <div className="min-w-0">
                <p className="font-mono text-[8px] text-white/50 truncate">{from}</p>
                <p className="font-mono text-[8px] text-sky-400/60">→ {to}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content domains */}
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
            {cleanPages} clean · {exemptPages} exempt · 0 violations
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

      {/* Architecture layer — Phase 2 Git-First CMS consolidation */}
      <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.025] px-4 py-3 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-400/70">
          Architecture Layer — Phase 2 CMS Consolidation
        </p>
        <p className="font-mono text-[9px] text-white/35 leading-relaxed">
          ContentRepository interface, canonical IDs, unified taxonomy, and
          MDX + AdminState adapters — all complete.
        </p>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {([
            { label: 'ContentRepository<T>',        file: 'lib/content/repository.ts',          done: true,  note: 'findBySlug · findAll · count · search + applyContentFilter helper' },
            { label: 'MDX adapter',                file: 'lib/content/adapters/mdx.ts',        done: true,  note: 'createMdxContentAdapter() — server/build-time, wraps getAllMeta()' },
            { label: 'AdminState adapter',         file: 'lib/content/adapters/admin-state.ts',done: true,  note: 'createRegistryAdapter(snapshot) — client-safe, pure in-memory' },
            { label: 'Canonical IDs',              file: 'lib/content/canonical-id.ts',        done: true,  note: 'makeCanonicalId · parseCanonicalId · isCanonicalId · slugify' },
            { label: 'Unified taxonomy',           file: 'lib/content/taxonomy.ts',            done: true,  note: 'ALL_TAGS · ALL_CATEGORIES · ALL_SERIES — all from src/content/taxonomies/*.json' },
            { label: 'series.json',                file: 'src/content/taxonomies/series.json', done: true,  note: 'Empty array — Phase 3 populates. taxonomy.ts reads from file (not hardcoded)' },
            { label: 'AI bounded context',         file: 'src/lib/ai/types.ts + index.ts',     done: true,  note: 'LLMProvider · LLMProfile · ChatMessage · ChatConversation · AIConfig moved out of admin/types' },
            { label: 'providers.ts fixed',         file: 'lib/ai/providers.ts',                done: true,  note: 'Import from @/lib/ai/types — backwards dep on admin/types removed' },
            { label: 'Publication lifecycle doc',  file: 'docs/publication-lifecycle.md',      done: true,  note: 'Draft → Review → Git commit → Build → Deploy' },
            { label: 'ADR-009',                    file: 'docs/adr/ADR-009-*.md',              done: true,  note: 'Content Repository + Adapter Pattern — decision record' },
            { label: 'GitHub seed data',           file: 'src/content/github/seed.json',       done: true,  note: 'Separates canonical seed from generated public/data/github.json' },
            { label: 'resources/data.ts deprecated',file: 'lib/resources/data.ts',            done: true,  note: 'Canonical source is now src/content/resources/*.json via json-loaders.ts' },
            { label: 'AdminState bounded contexts', file: 'lib/admin/slices/ (11 files)',      done: true,  note: 'ai · site · cms · content · design · capabilities · infra · integrations · studio · ui · registries' },
            { label: 'Design modules SSoT',        file: 'lib/design/tokens.ts + styles/ui.ts',done: true, note: 'ADR-005: runtime tokens ↔ static CVA primitives — zero cross-imports (grep verified)' },
            { label: 'Tests: 3 new test files',    file: 'canonical-id · taxonomy · repository',done: true, note: '44 new tests — utilities + filter combinations; total 460 passing' },
          ] as { label: string; file: string; done: boolean; note: string }[]).map(({ label, file, done, note }) => (
            <div key={label} className="flex items-start gap-2 rounded-lg bg-white/[0.025] px-3 py-2">
              {done
                ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400/80" />
                : <CircleDashed  className="mt-0.5 h-3 w-3 shrink-0 text-white/20" />
              }
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-white/70">{label}</p>
                <p className="font-mono text-[8px] text-sky-400/60 truncate">{file}</p>
                <p className="font-mono text-[8px] text-white/30 leading-relaxed mt-0.5">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 3 preview */}
      <div className="rounded-xl border border-white/6 bg-white/[0.01] px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30 mb-2">Next — Phase 3 (VPS Backend)</p>
        <ul className="space-y-1">
          {[
            'Hono API on Hostinger VPS — serves JSON files with cache headers + JWT auth',
            'Admin CMS writes: PUT /content/:type/:id → updates JSON file → Git commit webhook',
            'Media upload: POST /media → Cloudflare R2 + signed URL return',
            'Bridge labs/registry.ts arch/roadmap data to extended JSON format',
            'Migrate admin auth from Supabase/Google to VPS JWT (ADR-008 Phase 3)',
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
