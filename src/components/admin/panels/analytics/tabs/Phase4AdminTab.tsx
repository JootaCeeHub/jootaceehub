'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Phase 4 goals ───────────────────────────────────────────────────────────

interface Goal {
  id: string
  title: string
  desc: string
  status: 'done'
  files: string[]
  detail: string
}

const PHASE4_GOALS: Goal[] = [
  {
    id: 'api-client',
    title: 'API Client Layer (8 modules)',
    desc: 'Type-safe HTTP client for every VPS endpoint with JWT token management',
    status: 'done',
    files: [
      'src/lib/api/types.ts',
      'src/lib/api/client.ts',
      'src/lib/api/auth.ts',
      'src/lib/api/content.ts',
      'src/lib/api/git.ts',
      'src/lib/api/build.ts',
      'src/lib/api/media.ts',
      'src/lib/api/audit.ts',
    ],
    detail: 'ApiError class, request<T>() wrapper with Bearer token. JWT stored in sessionStorage (expires on tab close = matches 8h server expiry). NEXT_PUBLIC_CONTENT_API_URL gates ALL features — absent env → admin works fully offline with no degradation.',
  },
  {
    id: 'useApiAuth',
    title: 'useApiAuth — Auth State Machine',
    desc: '5-state machine: unconfigured → unauthenticated → authenticating → authenticated | error',
    status: 'done',
    files: ['src/hooks/useApiAuth.ts'],
    detail: 'Health check + token validation on mount. login(password) calls POST /auth/login → sets JWT. logout() clears token. refresh() checks health + re-validates token. Auth state drives VPSPanel UI (login form vs. authenticated view).',
  },
  {
    id: 'useContentSync',
    title: 'useContentSync — 6-State Pipeline',
    desc: 'Full save-to-deploy with: saving → saved → validating → building → deployed | failed',
    status: 'done',
    files: ['src/hooks/useContentSync.ts'],
    detail: 'saveContent(): idle→saving→saved|failed. syncAndDeploy(): writing→saved→validating→building→deployed|failed. 400ms pause at "validating" so UI renders the state. reset() returns to idle. All 6 Phase 4 sync states implemented.',
  },
  {
    id: 'useBuildStatus',
    title: 'useBuildStatus — Job Poller',
    desc: 'Polls /build/status/:jobId until terminal state or maxPolls timeout',
    status: 'done',
    files: ['src/hooks/useBuildStatus.ts'],
    detail: 'Configurable intervalMs (default 3s) and maxPolls (default 120 = 6min cap). Stops at done|failed. Returns { job: BuildJob | null, polling: boolean }. Designed for embedding in panels that trigger builds.',
  },
  {
    id: 'useVPSWrite',
    title: 'useVPSWrite — Dual-Write Bridge',
    desc: 'Pushes AdminState registry arrays to VPS as Git content files. The actual API call path.',
    status: 'done',
    files: ['src/hooks/useVPSWrite.ts'],
    detail: 'push(type, items[], commitAfter?) iterates each item, calling PUT /content/:type/:slug. Per-type sync state: { syncing, lastSync, error, pushed }. pushOne() for single-item saves (panel Save button integration). Non-blocking: if API unavailable, local state always wins.',
  },
  {
    id: 'vps-status-in-store',
    title: 'VPS Status in AdminState',
    desc: 'vpsStatus field propagated through the full Redux-style store pipeline',
    status: 'done',
    files: [
      'src/lib/admin/types.ts',
      'src/lib/admin/state.ts',
      'src/lib/admin/schema.ts',
      'src/lib/admin/slices/ui.ts',
    ],
    detail: 'VpsSyncState union, VpsSyncStatus interface, VPS_SYNC_IDLE constant in types.ts. SET_VPS_STATUS and CLEAR_VPS_ERROR actions in uiHandler. Zod schema marks vpsStatus optional (ephemeral — reset to idle on page reload).',
  },
  {
    id: 'vps-sync-bar',
    title: 'VPSSyncBar — Header Indicator',
    desc: 'Real-time sync state dot in admin header with color coding and click actions',
    status: 'done',
    files: ['src/components/admin/VPSSyncBar.tsx'],
    detail: 'Reads vpsStatus from AdminState. idle=white, saving=amber pulse, saved=cyan, validating=violet pulse, building=blue pulse, deployed=emerald, failed=red. Click = navigate to VPS panel; click on failed = CLEAR_VPS_ERROR dismiss.',
  },
  {
    id: 'vps-panel',
    title: 'VPSPanel — Full Backend Management',
    desc: 'Complete VPS panel: auth, git status, build history, audit log, content sync, media',
    status: 'done',
    files: ['src/components/admin/panels/VPSPanel.tsx'],
    detail: 'Auth form with password + health check badge. Git status (branch, staged/unstaged/untracked). Commit log (last 10). Build history (last 5). Audit log (last 10). Content Sync section (push per-type buttons + Git commit + Build trigger). Media spec summary.',
  },
  {
    id: 'content-sync-section',
    title: 'Content Sync — Registry → VPS',
    desc: 'Per-type push buttons in VPSPanel that write AdminState registries to Git files via API',
    status: 'done',
    files: [
      'src/components/admin/panels/VPSPanel.tsx',
      'src/hooks/useVPSWrite.ts',
    ],
    detail: 'VPSPanel Content Sync section shows 4 types: projects, labs, systems, research. Each row: item count badge, last-sync time, error display, Push button. After pushing types: Git commit button + Build+deploy button. This closes the "substitute store with API calls" gap — panels edit local state, VPS panel publishes to Git.',
  },
  {
    id: 'state-separation',
    title: 'State Separation Contract',
    desc: 'Context = UI only. localStorage = prefs. sessionStorage = JWT. IDB = state backup.',
    status: 'done',
    files: [
      'src/lib/admin/store.tsx',
      'src/lib/admin/idb.ts',
      'src/lib/api/client.ts',
    ],
    detail: 'AdminState (React Context + localStorage jootacee-command-v2) holds UI/preference data only — it is a staging area, not canonical. IDB (jootacee-command key) is a parallel durability write in store.tsx via saveToIDB(). VPS JWT is sessionStorage jootacee-vps-token. Content canonical = src/content/ JSON files committed to Git.',
  },
]

// ─── Sync state flow ──────────────────────────────────────────────────────────

const STATE_FLOW = [
  { state: 'idle',       color: 'bg-white/20',    text: 'text-white/40' },
  { state: 'saving',     color: 'bg-amber-400',   text: 'text-amber-400' },
  { state: 'saved',      color: 'bg-cyan-400',    text: 'text-cyan-400' },
  { state: 'validating', color: 'bg-violet-400',  text: 'text-violet-400' },
  { state: 'building',   color: 'bg-blue-400',    text: 'text-blue-400' },
  { state: 'deployed',   color: 'bg-emerald-400', text: 'text-emerald-400' },
  { state: 'failed',     color: 'bg-red-400',     text: 'text-red-400' },
]

// ─── Architecture flow ────────────────────────────────────────────────────────

const FLOW = [
  { label: 'Panel edits', color: '#22d3ee', detail: 'dispatch() → AdminState (draft)' },
  { label: 'VPS Panel push', color: '#818cf8', detail: 'useVPSWrite.push()' },
  { label: 'PUT /content', color: '#38bdf8', detail: 'apiWriteContent()' },
  { label: 'Git commit', color: '#34d399', detail: 'POST /git/commit' },
  { label: 'Build trigger', color: '#f59e0b', detail: 'POST /build/trigger' },
  { label: 'atomic deploy', color: '#f43f5e', detail: 'ln -sfn (POSIX rename)' },
]

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.018] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-white/80">{goal.title}</p>
            <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2 py-0.5 text-[8px] uppercase tracking-widest text-emerald-400">
              done
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-white/40">{goal.desc}</p>
        </div>
        {open ? <ChevronUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" /> : <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />}
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 py-3 space-y-3">
          <p className="text-[10px] text-white/50">{goal.detail}</p>
          <div className="flex flex-wrap gap-1.5">
            {goal.files.map(f => (
              <code key={f} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[8.5px] text-cyan-400/80">{f}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export function Phase4AdminTab() {
  return (
    <div className="space-y-8">

      {/* ── Summary ── */}
      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Phase 4 — Admin Adaptation</h3>
            <p className="mt-0.5 text-[10px] text-white/45">
              {PHASE4_GOALS.length} / {PHASE4_GOALS.length} goals complete · API client layer, 4 hooks, VPS panel + content sync, sync bar, state separation
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-emerald-400">100%</div>
            <div className="text-[9px] uppercase tracking-widest text-white/30">Complete</div>
          </div>
        </div>
      </div>

      {/* ── Phase 4 objectives vs implementation ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Phase 4 Objectives Mapping</h3>
        <div className="space-y-2">
          {[
            {
              objective: 'Sustituir store canónico por API calls',
              implementation: 'useVPSWrite.push() sends AdminState registries to VPS PUT /content/:type/:slug. VPSPanel Content Sync section provides per-type push UI + Git commit + build trigger.',
              status: 'done',
            },
            {
              objective: 'Mantener React Context solo para estado UI',
              implementation: 'AdminState = staging area / working draft. Canonical source = src/content/ JSON files in Git. VPS API is the write path to canonical.',
              status: 'done',
            },
            {
              objective: 'Mantener localStorage para preferencias',
              implementation: 'localStorage key jootacee-command-v2 unchanged. Persists all admin preferences, panel state, registries as draft. IDB parallel write as backup.',
              status: 'done',
            },
            {
              objective: 'Mantener IndexedDB para drafts offline opcionales',
              implementation: 'idb.ts: saveToIDB() / loadFromIDB() in store.tsx. Every state change writes to both localStorage AND IDB. IDB consulted as fallback if localStorage is corrupted.',
              status: 'done',
            },
            {
              objective: 'Añadir estados: saving, saved, validating, building, deployed, failed',
              implementation: 'SyncState = idle | saving | saved | validating | building | deployed | failed. Implemented in useContentSync + VpsSyncState in AdminState. VPSSyncBar shows state in header.',
              status: 'done',
            },
          ].map(item => (
            <div key={item.objective} className="rounded-xl border border-white/6 bg-white/[0.018] p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-white/75">{item.objective}</p>
                  <p className="mt-1 text-[9.5px] text-white/40">{item.implementation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6-state sync flow ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">6-State Sync Pipeline</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATE_FLOW.map((s, i) => (
            <div key={s.state} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-full border border-white/6 bg-white/[0.02] px-2.5 py-1">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', s.color)} />
                <span className={cn('font-mono text-[9px] uppercase tracking-[0.12em]', s.text)}>{s.state}</span>
              </div>
              {i < STATE_FLOW.length - 1 && (
                <span className="text-white/15 text-[10px]">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[9px] text-white/25">
          failed branches out from any step. deployed | failed can be dismissed (reset → idle).
          validating = 400ms UI pass (server already validated on write).
        </p>
      </div>

      {/* ── Full pipeline flow ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Content Publish Pipeline</h3>
        <div className="rounded-xl border border-white/6 bg-white/[0.015] p-4">
          <div className="flex flex-wrap gap-2">
            {FLOW.map((step, i) => (
              <div key={step.label} className="flex items-start gap-2">
                <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
                  <div className="font-mono text-[9.5px]" style={{ color: step.color }}>{step.label}</div>
                  <div className="mt-0.5 font-mono text-[7.5px] text-white/25">{step.detail}</div>
                </div>
                {i < FLOW.length - 1 && <span className="mt-3 text-white/20 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── State separation ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">State Separation Contract</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { store: 'React Context', key: 'AdminState', purpose: 'UI state, panel routing, staging area for edits', color: '#22d3ee', ephemeral: false },
            { store: 'localStorage', key: 'jootacee-command-v2', purpose: 'Persistent preferences + draft content', color: '#a78bfa', ephemeral: false },
            { store: 'IndexedDB', key: 'jootacee-command', purpose: 'Parallel durable write — backup if localStorage cleared', color: '#34d399', ephemeral: false },
            { store: 'sessionStorage', key: 'jootacee-vps-token', purpose: 'JWT — expires on tab close (8h max)', color: '#f59e0b', ephemeral: true },
          ].map(s => (
            <div key={s.store} className="rounded-xl border border-white/6 bg-white/[0.018] p-3">
              <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: s.color }}>{s.store}</div>
              <code className="mt-1 block font-mono text-[8.5px] text-white/40">{s.key}</code>
              <p className="mt-1.5 text-[9px] text-white/30">{s.purpose}</p>
              {s.ephemeral && (
                <span className="mt-2 inline-block rounded-full border border-amber-400/20 bg-amber-400/8 px-1.5 py-0.5 text-[7.5px] uppercase tracking-widest text-amber-400/80">
                  Ephemeral
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Goal cards ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Goals ({PHASE4_GOALS.length} / {PHASE4_GOALS.length})
        </h3>
        <div className="space-y-2">
          {PHASE4_GOALS.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      </div>

      {/* ── New files ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">New files ({[
          'src/lib/api/types.ts', 'src/lib/api/client.ts', 'src/lib/api/auth.ts',
          'src/lib/api/content.ts', 'src/lib/api/git.ts', 'src/lib/api/build.ts',
          'src/lib/api/media.ts', 'src/lib/api/audit.ts',
          'src/hooks/useApiAuth.ts', 'src/hooks/useContentSync.ts',
          'src/hooks/useBuildStatus.ts', 'src/hooks/useVPSWrite.ts',
          'src/components/admin/VPSSyncBar.tsx', 'src/components/admin/panels/VPSPanel.tsx',
        ].length})</h3>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {[
            'src/lib/api/types.ts',
            'src/lib/api/client.ts',
            'src/lib/api/auth.ts',
            'src/lib/api/content.ts',
            'src/lib/api/git.ts',
            'src/lib/api/build.ts',
            'src/lib/api/media.ts',
            'src/lib/api/audit.ts',
            'src/hooks/useApiAuth.ts',
            'src/hooks/useContentSync.ts',
            'src/hooks/useBuildStatus.ts',
            'src/hooks/useVPSWrite.ts',
            'src/components/admin/VPSSyncBar.tsx',
            'src/components/admin/panels/VPSPanel.tsx',
          ].map(f => (
            <code key={f} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.015] px-3 py-1.5 font-mono text-[8.5px] text-cyan-400/70">
              <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-400/60" />
              {f}
            </code>
          ))}
        </div>
      </div>

      {/* ── Modified files ── */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Key modifications</h3>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {[
            'src/lib/admin/types.ts — VpsSyncState, VpsSyncStatus, VPS_SYNC_IDLE, AdminPanel += vps',
            'src/lib/admin/state.ts — vpsStatus: VPS_SYNC_IDLE in createInitialState',
            'src/lib/admin/schema.ts — vpsStatus optional Zod field (ephemeral)',
            'src/lib/admin/slices/ui.ts — SET_VPS_STATUS, CLEAR_VPS_ERROR handlers',
            'src/components/admin/AdminShell.tsx — vps panel + VPSSyncBar in header',
            'src/components/admin/PanelRouter.tsx — case vps: → VPSPanel (lazy)',
            'src/components/admin/panels/index.ts — export VPSPanel',
            'analytics/types.ts + AnalyticsPanel.tsx — phase4admin tab wired',
          ].map(f => (
            <div key={f} className="flex items-start gap-1.5 rounded-lg border border-white/5 bg-white/[0.015] px-3 py-1.5">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
              <span className="font-mono text-[8.5px] text-white/45">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
