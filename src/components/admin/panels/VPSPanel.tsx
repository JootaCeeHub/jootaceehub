'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import {
  Server, LogIn, LogOut, RefreshCw, GitBranch, Hammer, Clock, CheckCircle2,
  XCircle, AlertTriangle, Upload, Package, Trash2, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useApiAuth } from '@/hooks/useApiAuth'
import { useContentSync } from '@/hooks/useContentSync'
import { apiGitLog, apiGitStatus } from '@/lib/api/git'
import { apiBuildHistory } from '@/lib/api/build'
import { apiReadAudit } from '@/lib/api/audit'
import { isApiConfigured } from '@/lib/api/client'
import type { GitLogEntry, GitStatus, BuildJob, AuditEntry } from '@/lib/api/types'

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.018] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-cyan-400/70" />
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Sync state badge ─────────────────────────────────────────────────────────

const SYNC_COLORS: Record<string, string> = {
  idle:       'text-white/30 border-white/8 bg-white/[0.02]',
  saving:     'text-amber-400 border-amber-400/20 bg-amber-400/8 animate-pulse',
  saved:      'text-cyan-400 border-cyan-400/20 bg-cyan-400/8',
  validating: 'text-violet-400 border-violet-400/20 bg-violet-400/8 animate-pulse',
  building:   'text-blue-400 border-blue-400/20 bg-blue-400/8 animate-pulse',
  deployed:   'text-emerald-400 border-emerald-400/20 bg-emerald-400/8',
  failed:     'text-red-400 border-red-400/20 bg-red-400/8',
}

function SyncBadge({ state, message }: { state: string; message: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[8.5px] uppercase tracking-[0.12em] font-mono', SYNC_COLORS[state] ?? SYNC_COLORS.idle)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', state === 'idle' ? 'bg-white/20' : state === 'deployed' ? 'bg-emerald-400' : state === 'failed' ? 'bg-red-400' : state === 'saved' ? 'bg-cyan-400' : 'bg-current')} />
      {message || state}
    </span>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function VPSPanel() {
  const { dispatch } = useAdmin()
  const { state: authState, me, health, error: authError, login, logout, refresh } = useApiAuth()
  const { status: syncStatus, reset: resetSync } = useContentSync()

  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [gitLog, setGitLog] = useState<GitLogEntry[]>([])
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [buildHistory, setBuildHistory] = useState<BuildJob[]>([])
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)

  const configured = isApiConfigured()

  const loadData = async () => {
    if (authState !== 'authenticated') return
    setLoading(true)
    try {
      const [log, status, builds, audit] = await Promise.allSettled([
        apiGitLog(10),
        apiGitStatus(),
        apiBuildHistory(5),
        apiReadAudit({ limit: 10 }),
      ])
      if (log.status === 'fulfilled' && log.value.success && log.value.data) setGitLog(log.value.data)
      if (status.status === 'fulfilled' && status.value.success && status.value.data) setGitStatus(status.value.data)
      if (builds.status === 'fulfilled' && builds.value.success && builds.value.data) setBuildHistory(builds.value.data)
      if (audit.status === 'fulfilled' && audit.value.success && audit.value.data) setAuditLog(audit.value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState])

  // Propagate sync state to AdminState for VPSSyncBar
  useEffect(() => {
    dispatch({ type: 'SET_VPS_STATUS', payload: syncStatus })
  }, [syncStatus, dispatch])

  const handleLogin = async () => {
    setLoginError(null)
    const ok = await login(password)
    if (!ok) setLoginError(authError ?? 'Login failed')
    else setPassword('')
  }

  // ── Not configured ──────────────────────────────────────────────────────────

  if (!configured) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white/85">VPS Content API</h2>
          <p className="mt-1 text-[11px] text-white/35">Connect to the Hostinger VPS backend for Git-first content management.</p>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold text-amber-400">API not configured</p>
              <p className="mt-1 text-[10px] text-white/45">
                Set <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-cyan-400">NEXT_PUBLIC_CONTENT_API_URL</code> in your environment to enable VPS features.
              </p>
              <p className="mt-2 text-[10px] text-white/30">
                Example: <code className="font-mono text-white/45">https://api.jootacee.com</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white/85">VPS Content API</h2>
          <p className="mt-0.5 text-[11px] text-white/35">Git-first content management via Hostinger VPS backend.</p>
        </div>
        <button onClick={refresh} title="Refresh connection"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03] text-white/35 transition-colors hover:bg-white/6 hover:text-white/65">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Sync status */}
      {syncStatus.state !== 'idle' && (
        <div className="flex items-center justify-between rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
          <SyncBadge state={syncStatus.state} message={syncStatus.message} />
          {(syncStatus.state === 'deployed' || syncStatus.state === 'failed') && (
            <button onClick={resetSync} className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white/55">Dismiss</button>
          )}
        </div>
      )}

      {/* ── Auth section ── */}
      <Section title="Connection" icon={Server}>
        {/* Health */}
        <div className="mb-3 flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full', health ? 'bg-emerald-400' : 'bg-red-400/60')} />
          <span className="text-[10px] text-white/45">
            {health ? `Online · ${health.version ?? 'v?'}` : 'Unreachable'}
          </span>
          {health && (
            <span className="ml-auto font-mono text-[9px] text-white/25">{health.uptime ? `${Math.floor(health.uptime / 60)}m uptime` : ''}</span>
          )}
        </div>

        {authState === 'authenticated' ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Authenticated as <strong>{me?.sub}</strong></span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-red-400/15 bg-red-400/5 px-3 py-1 text-[9.5px] text-red-400/70 transition-colors hover:bg-red-400/10 hover:text-red-400">
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        ) : authState === 'unauthenticated' || authState === 'error' ? (
          <div className="space-y-2">
            {loginError && (
              <p className="flex items-center gap-1.5 text-[9.5px] text-red-400">
                <XCircle className="h-3 w-3 shrink-0" />
                {loginError}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void handleLogin()}
                placeholder="Admin password"
                className="flex-1 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-white/70 placeholder:text-white/20 focus:border-cyan-400/30 focus:outline-none"
              />
              <button onClick={() => void handleLogin()} disabled={!password}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-3 py-1.5 text-[9.5px] text-cyan-400 transition-colors hover:bg-cyan-400/15 disabled:opacity-40">
                <LogIn className="h-3 w-3" />
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] text-white/35">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Checking connection…
          </div>
        )}
      </Section>

      {authState === 'authenticated' && (
        <>
          {/* ── Git status ── */}
          <Section title="Git Status" icon={GitBranch}>
            {gitStatus ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-white/40">Branch:</span>
                  <code className="font-mono text-cyan-400">{gitStatus.branch}</code>
                  {gitStatus.ahead > 0 && <span className="text-amber-400">↑{gitStatus.ahead} ahead</span>}
                  {gitStatus.behind > 0 && <span className="text-red-400/80">↓{gitStatus.behind} behind</span>}
                </div>
                {(() => {
                  const allFiles = [
                    ...gitStatus.staged.map(p => ({ p, kind: 'S' })),
                    ...gitStatus.unstaged.map(p => ({ p, kind: 'M' })),
                    ...gitStatus.untracked.map(p => ({ p, kind: '?' })),
                  ]
                  return allFiles.length > 0 ? (
                    <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.015]">
                      {allFiles.slice(0, 8).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 border-b border-white/4 px-3 py-1 last:border-0">
                          <span className={cn('font-mono text-[8.5px] w-4 shrink-0', f.kind === 'S' ? 'text-emerald-400' : f.kind === 'M' ? 'text-amber-400' : 'text-white/40')}>
                            {f.kind}
                          </span>
                          <span className="truncate font-mono text-[9px] text-white/45">{f.p}</span>
                        </div>
                      ))}
                      {allFiles.length > 8 && (
                        <div className="px-3 py-1 text-[9px] text-white/25">+{allFiles.length - 8} more</div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-400/70">Working tree clean</p>
                  )
                })()}
              </div>
            ) : (
              <p className="text-[10px] text-white/25">Loading…</p>
            )}
          </Section>

          {/* ── Git log ── */}
          <Section title="Recent Commits" icon={Clock}>
            {gitLog.length > 0 ? (
              <div className="space-y-1">
                {gitLog.map((entry) => (
                  <div key={entry.hash} className="flex items-start gap-2 rounded-lg border border-white/4 px-3 py-2 hover:bg-white/[0.02]">
                    <code className="mt-0.5 font-mono text-[8.5px] text-cyan-400/60 shrink-0">{entry.shortHash}</code>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] text-white/65">{entry.message}</p>
                      <p className="text-[8.5px] text-white/25">{entry.author} · {new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    {entry.filesChanged.length > 0 && (
                      <span className="shrink-0 rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-white/30">{entry.filesChanged.length}f</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/25">No commits loaded.</p>
            )}
          </Section>

          {/* ── Build history ── */}
          <Section title="Build History" icon={Hammer}>
            {buildHistory.length > 0 ? (
              <div className="space-y-1">
                {buildHistory.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 rounded-lg border border-white/4 px-3 py-2">
                    {job.status === 'done' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : job.status === 'failed' ? (
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    ) : (
                      <Package className="h-3.5 w-3.5 shrink-0 text-blue-400 animate-pulse" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] text-white/60">{job.reason}</p>
                      <p className="font-mono text-[8.5px] text-white/25">{job.startedAt ? new Date(job.startedAt).toLocaleString() : job.ts}</p>
                    </div>
                    <span className={cn('shrink-0 font-mono text-[8.5px] uppercase', job.status === 'done' ? 'text-emerald-400' : job.status === 'failed' ? 'text-red-400' : 'text-blue-400')}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/25">No builds yet.</p>
            )}
          </Section>

          {/* ── Audit log ── */}
          <Section title="Audit Log" icon={FileText}>
            {auditLog.length > 0 ? (
              <div className="space-y-1">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 rounded-lg border border-white/4 px-3 py-1.5">
                    <span className={cn('mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full', entry.action.startsWith('content') ? 'bg-cyan-400' : entry.action.startsWith('build') ? 'bg-blue-400' : entry.action.startsWith('auth') ? 'bg-violet-400' : 'bg-white/30')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-white/60"><span className="font-mono text-white/35">{entry.action}</span> · {entry.actor}</p>
                      {entry.detail && (
                        <p className="truncate font-mono text-[8.5px] text-white/25">{entry.detail}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[8px] text-white/20">{new Date(entry.ts).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/25">No audit entries.</p>
            )}
          </Section>

          {/* ── Media ── */}
          <Section title="Media" icon={Upload}>
            <p className="text-[10px] text-white/35">
              Use <code className="rounded bg-white/5 px-1 font-mono text-cyan-400">POST /media</code> to upload files.
              Images are converted to WebP (max 2400px, 85% quality) before storage.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Max size', value: '10 MB' },
                { label: 'Output', value: 'WebP' },
                { label: 'Max width', value: '2400px' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.015] py-2">
                  <div className="text-[13px] font-semibold text-white/70">{s.value}</div>
                  <div className="text-[7.5px] uppercase tracking-widest text-white/25">{s.label}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Danger zone ── */}
          <Section title="Danger Zone" icon={Trash2}>
            <p className="text-[10px] text-white/35 mb-3">Rollback deploys or revert commits via the API. These operations affect the live site.</p>
            <div className="flex gap-2">
              <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'analytics' })}
                className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[9.5px] text-white/45 transition-colors hover:bg-white/5 hover:text-white/65">
                View analytics →
              </button>
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
