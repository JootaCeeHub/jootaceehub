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
    title: 'API Client Layer',
    desc: 'Type-safe HTTP client for every VPS endpoint with token management',
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
    detail: 'ApiError class, request<T>() wrapper, Bearer token via sessionStorage. Each module exposes typed functions matching VPS routes. NEXT_PUBLIC_CONTENT_API_URL gates all features — missing env → admin works offline.',
  },
  {
    id: 'useApiAuth',
    title: 'useApiAuth Hook',
    desc: 'Authentication state machine: unconfigured → unauthenticated → authenticating → authenticated | error',
    status: 'done',
    files: ['src/hooks/useApiAuth.ts'],
    detail: 'Runs health check + token validation on mount. login(password) calls POST /auth/login and sets JWT in sessionStorage. logout() clears token. Auto-refresh when token is expired.',
  },
  {
    id: 'useContentSync',
    title: 'useContentSync Hook',
    desc: 'Full save-to-deploy pipeline with 6 sync states',
    status: 'done',
    files: ['src/hooks/useContentSync.ts'],
    detail: 'saveContent(): idle → saving → saved | failed. syncAndDeploy(): saving → saved → validating → building → deployed | failed. 400ms pause at "validating" so the UI registers the state. reset() returns to idle.',
  },
  {
    id: 'useBuildStatus',
    title: 'useBuildStatus Hook',
    desc: 'Polls /build/status/:jobId until terminal state or timeout',
    status: 'done',
    files: ['src/hooks/useBuildStatus.ts'],
    detail: 'Configurable intervalMs (default 3s) and maxPolls (default 120 = 6min). Stops polling at done | failed. Returns { job: BuildJob | null, polling: boolean }.',
  },
  {
    id: 'vps-status-in-store',
    title: 'VPS Status in AdminState',
    desc: 'vpsStatus field propagated through the Redux-style store',
    status: 'done',
    files: [
      'src/lib/admin/types.ts',
      'src/lib/admin/state.ts',
      'src/lib/admin/schema.ts',
      'src/lib/admin/slices/ui.ts',
    ],
    detail: 'VpsSyncState, VpsSyncStatus, VPS_SYNC_IDLE added to types. SET_VPS_STATUS and CLEAR_VPS_ERROR actions in uiHandler. Zod schema marks field optional (ephemeral — reset on load).',
  },
  {
    id: 'vps-sync-bar',
    title: 'VPSSyncBar',
    desc: 'Header indicator showing real-time sync state with dot animation',
    status: 'done',
    files: ['src/components/admin/VPSSyncBar.tsx'],
    detail: 'Reads vpsStatus from AdminState. Clicking navigates to VPS panel (or dismisses error). Colors: idle=white/20, saving=amber (pulse), saved=cyan, validating=violet (pulse), building=blue (pulse), deployed=emerald, failed=red.',
  },
  {
    id: 'vps-panel',
    title: 'VPSPanel',
    desc: 'Full VPS management panel: auth, git status, build history, audit log',
    status: 'done',
    files: ['src/components/admin/panels/VPSPanel.tsx'],
    detail: 'Auth form with rate-limited login. Health check badge. Git status (branch, dirty files). Commit log (last 10). Build history (last 5). Audit log (last 10). Media limits summary. VPS panel wired in PANEL_GROUPS operations group.',
  },
  {
    id: 'context-separation',
    title: 'State Separation Contract',
    desc: 'React Context = UI state only. localStorage = preferences. sessionStorage = VPS JWT',
    status: 'done',
    files: [
      'src/lib/admin/store.tsx',
      'src/lib/api/client.ts',
    ],
    detail: 'AdminState (React Context + localStorage jootacee-command-v2) holds only UI/preference data. VPS JWT lives in sessionStorage jootacee-vps-token — expires on tab close, matching the 8h server JWT expiry. IndexedDB drafts unchanged from Phase 2.',
  },
]

// ─── Architecture diagram ─────────────────────────────────────────────────────

const FLOW = [
  { label: 'Panel dispatches', color: '#22d3ee' },
  { label: 'useContentSync', color: '#818cf8' },
  { label: 'apiClient.put()', color: '#38bdf8' },
  { label: 'VPS /content', color: '#34d399' },
  { label: 'VPS /git/commit', color: '#34d399' },
  { label: 'VPS /build/trigger', color: '#f59e0b' },
  { label: 'Nginx symlink', color: '#f43f5e' },
]

const STATE_FLOW = [
  { state: 'idle',       color: 'bg-white/20',    text: 'text-white/40' },
  { state: 'saving',     color: 'bg-amber-400',   text: 'text-amber-400' },
  { state: 'saved',      color: 'bg-cyan-400',    text: 'text-cyan-400' },
  { state: 'validating', color: 'bg-violet-400',  text: 'text-violet-400' },
  { state: 'building',   color: 'bg-blue-400',    text: 'text-blue-400' },
  { state: 'deployed',   color: 'bg-emerald-400', text: 'text-emerald-400' },
  { state: 'failed',     color: 'bg-red-400',     text: 'text-red-400' },
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
      {/* Header */}
      <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Phase 4 — Admin Adaptation</h3>
            <p className="mt-0.5 text-[10px] text-white/45">
              8 / 8 goals complete · API client, 3 hooks, VPS panel, sync bar, state separation
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-emerald-400">100%</div>
            <div className="text-[9px] uppercase tracking-widest text-white/30">Complete</div>
          </div>
        </div>
      </div>

      {/* Sync state flow */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">6-State Sync Pipeline</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATE_FLOW.map((s, i) => (
            <div key={s.state} className="flex items-center gap-1.5">
              <div className={cn('flex items-center gap-1.5 rounded-full border border-white/6 bg-white/[0.02] px-2.5 py-1')}>
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
          failed/deployed can be dismissed via VPSSyncBar click or reset(). Failed branches out from any step.
        </p>
      </div>

      {/* Architecture flow */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Deploy Pipeline Architecture</h3>
        <div className="rounded-xl border border-white/6 bg-white/[0.015] p-4">
          <div className="flex flex-wrap gap-2">
            {FLOW.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5">
                  <span className="font-mono text-[9.5px]" style={{ color: step.color }}>{step.label}</span>
                </div>
                {i < FLOW.length - 1 && <span className="text-white/20 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* State separation */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">State Separation Contract</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { store: 'React Context', key: 'AdminState', purpose: 'UI state, panel, registries', color: '#22d3ee', ephemeral: false },
            { store: 'localStorage', key: 'jootacee-command-v2', purpose: 'Persisted preferences', color: '#a78bfa', ephemeral: false },
            { store: 'sessionStorage', key: 'jootacee-vps-token', purpose: 'JWT — expires on tab close', color: '#f59e0b', ephemeral: true },
          ].map(s => (
            <div key={s.store} className="rounded-xl border border-white/6 bg-white/[0.018] p-3">
              <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: s.color }}>{s.store}</div>
              <code className="mt-1 block font-mono text-[9px] text-white/45">{s.key}</code>
              <p className="mt-1.5 text-[9px] text-white/35">{s.purpose}</p>
              {s.ephemeral && (
                <span className="mt-2 inline-block rounded-full border border-amber-400/20 bg-amber-400/8 px-1.5 py-0.5 text-[7.5px] uppercase tracking-widest text-amber-400/80">
                  Ephemeral
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goal cards */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Goals ({PHASE4_GOALS.length} / {PHASE4_GOALS.length})</h3>
        <div className="space-y-2">
          {PHASE4_GOALS.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      </div>

      {/* Files created summary */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">New files</h3>
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

      {/* Modified files */}
      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Modified files</h3>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {[
            'src/lib/admin/types.ts — VpsSyncState, VpsSyncStatus, VPS_SYNC_IDLE',
            'src/lib/admin/state.ts — vpsStatus: VPS_SYNC_IDLE in createInitialState',
            'src/lib/admin/schema.ts — vpsStatus optional Zod field',
            'src/lib/admin/slices/ui.ts — SET_VPS_STATUS, CLEAR_VPS_ERROR handlers',
            'src/components/admin/AdminShell.tsx — vps panel + VPSSyncBar in header',
            'src/components/admin/PanelRouter.tsx — case vps: return <VPSPanel />',
            'src/components/admin/panels/index.ts — export VPSPanel',
            'src/components/admin/panels/analytics/types.ts — phase4admin tab',
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
