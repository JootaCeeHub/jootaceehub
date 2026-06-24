'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle, XCircle, Eye, EyeOff,
  Plus, Trash2, Zap, ChevronDown, ChevronUp, RotateCcw,
  Copy, Check, TrendingUp, Layers, ArrowRight,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import type { LLMProfile, LLMConnectionStatus } from '@/lib/ai/types'
import {
  PROVIDER_LABELS, PROVIDER_ACCENT, PROVIDER_MODELS,
  PROVIDER_BASE_URL, PROVIDER_COSTS, LOCAL_PROVIDERS,
  testConnection, statusColor,
} from '@/lib/ai/providers'

// ── Provider catalog (for new profile form) ───────────────────────────────────

const PROVIDER_ORDER: LLMProfile['provider'][] = [
  'openai', 'claude', 'gemini', 'deepseek', 'moonshot',
  'openrouter', 'mistral', 'groq', 'together', 'perplexity',
  'xai', 'cohere', 'ollama', 'llamacpp', 'hermes',
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: LLMConnectionStatus }) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full ring-2 ring-black/20',
        status === 'connected' && 'bg-emerald-400',
        status === 'error'     && 'bg-red-400',
        status === 'testing'   && 'bg-amber-400 animate-pulse',
        status === 'untested'  && 'bg-white/25',
      )}
      style={{ color: statusColor(status) }}
    />
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/6 bg-white/[0.02] px-2 py-1 text-center">
      <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">{label}</div>
      <div className="font-mono text-[9px] text-white/55 mt-0.5">{value}</div>
    </div>
  )
}

function fmtTokens(n: number): string {
  if (n === 0) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function fmtCost(profile: LLMProfile): string {
  if (!profile.stats || profile.stats.totalTokensIn + profile.stats.totalTokensOut === 0) return '—'
  const inCost  = (profile.stats.totalTokensIn  / 1000) * (profile.costPer1kInput  ?? 0)
  const outCost = (profile.stats.totalTokensOut / 1000) * (profile.costPer1kOutput ?? 0)
  const total   = inCost + outCost
  return total === 0 ? '$0.00' : total < 0.01 ? '<$0.01' : `$${total.toFixed(2)}`
}

// ── Profile card ──────────────────────────────────────────────────────────────

interface CardProps {
  profile:   LLMProfile
  profiles:  LLMProfile[]
  isActive:  boolean
  onUpdate:  (data: Partial<LLMProfile>) => void
  onRemove:  () => void
  onSetActive: () => void
}

function ProfileCard({ profile, profiles, isActive, onUpdate, onRemove, onSetActive }: CardProps) {
  const [open,      setOpen]      = useState(false)
  const [showKey,   setShowKey]   = useState(false)
  const [testing,   setTesting]   = useState(false)
  const [testMsg,   setTestMsg]   = useState<string | null>(null)
  const [copied,    setCopied]    = useState(false)

  const accent = PROVIDER_ACCENT[profile.provider] ?? '#6b7280'
  const models = PROVIDER_MODELS[profile.provider] ?? []

  async function runTest() {
    setTesting(true)
    setTestMsg(null)
    onUpdate({ status: 'testing' })
    const res = await testConnection(profile)
    onUpdate({ status: res.ok ? 'connected' : 'error' })
    setTestMsg(res.ok ? `✓ ${res.latencyMs}ms` : `✗ ${res.error ?? 'Failed'}`)
    setTesting(false)
  }

  function copyKey() {
    navigator.clipboard.writeText(profile.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const stats = profile.stats

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-colors',
        profile.enabled ? 'border-white/10 bg-white/[0.025]' : 'border-white/5 bg-white/[0.01]',
        isActive && 'ring-1',
      )}
      style={isActive ? { outline: `1px solid ${accent}40` } : undefined}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Color dot + provider icon */}
        <div
          className="h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-black"
          style={{ background: accent }}
        >
          {profile.provider.slice(0, 2).toUpperCase()}
        </div>

        {/* Label + model */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] font-medium text-white/75">{profile.label}</span>
            {isActive && (
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-cyan-400">activo</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusDot status={profile.status} />
            <span className="font-mono text-[8.5px] text-white/30">{profile.model}</span>
            {testMsg && (
              <span className={`font-mono text-[8px] ${testMsg.startsWith('✓') ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                {testMsg}
              </span>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Enable toggle */}
          <button
            onClick={() => onUpdate({ enabled: !profile.enabled })}
            className={cn(
              'relative h-[18px] w-8 rounded-full transition-colors',
              profile.enabled ? 'bg-cyan-400/30' : 'bg-white/10',
            )}
          >
            <span className={cn(
              'absolute top-[3px] h-3 w-3 rounded-full transition-transform',
              profile.enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30',
            )} />
          </button>

          {/* Test button */}
          <button
            onClick={runTest}
            disabled={testing || (!profile.apiKey && !LOCAL_PROVIDERS.has(profile.provider))}
            className="flex items-center gap-1 rounded-lg border border-white/8 px-2 py-1 font-mono text-[8px] text-white/35 transition-colors hover:border-white/20 hover:text-white/60 disabled:opacity-30"
          >
            {testing ? <RotateCcw className="h-2.5 w-2.5 animate-spin" /> : <Zap className="h-2.5 w-2.5" />}
            Test
          </button>

          {/* Expand */}
          <button
            onClick={() => setOpen(v => !v)}
            className="rounded-lg border border-white/8 p-1 text-white/30 transition-colors hover:text-white/60"
          >
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Stats row (always visible if has data) */}
      {stats && stats.totalRequests > 0 && (
        <div className="grid grid-cols-5 gap-1.5 border-t border-white/5 px-4 py-2">
          <StatPill label="Requests" value={String(stats.totalRequests)} />
          <StatPill label="Tokens In"  value={fmtTokens(stats.totalTokensIn)} />
          <StatPill label="Tokens Out" value={fmtTokens(stats.totalTokensOut)} />
          <StatPill label="Avg latency" value={stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : '—'} />
          <StatPill label="Est. cost"  value={fmtCost(profile)} />
        </div>
      )}

      {/* Expanded config */}
      {open && (
        <div className="border-t border-white/8 bg-black/20 p-4 space-y-3">
          {/* API Key */}
          {!LOCAL_PROVIDERS.has(profile.provider) && (
            <div>
              <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">API Key</label>
              <div className="flex gap-1.5">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={`${PROVIDER_LABELS[profile.provider]} API key`}
                  className="flex-1 min-w-0 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  value={profile.apiKey}
                  onChange={e => onUpdate({ apiKey: e.target.value, status: 'untested' })}
                />
                <button onClick={() => setShowKey(v => !v)} className="rounded-lg border border-white/8 p-1.5 text-white/30 hover:text-white/60">
                  {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button onClick={copyKey} disabled={!profile.apiKey} className="rounded-lg border border-white/8 p-1.5 text-white/30 hover:text-white/60 disabled:opacity-30">
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          )}

          {/* Base URL override */}
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">
              Endpoint URL
              <span className="ml-2 normal-case text-white/20">default: {PROVIDER_BASE_URL[profile.provider]}</span>
            </label>
            <input
              type="text"
              placeholder={PROVIDER_BASE_URL[profile.provider]}
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
              value={profile.baseUrl ?? ''}
              onChange={e => onUpdate({ baseUrl: e.target.value || undefined })}
            />
          </div>

          {/* Model selector */}
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">Model</label>
            <div className="flex gap-1.5">
              <select
                className="flex-1 min-w-0 rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 font-mono text-[9.5px] text-white/60 outline-none focus:border-white/20 transition-colors"
                value={profile.model}
                onChange={e => onUpdate({ model: e.target.value })}
              >
                {models.map(m => <option key={m} value={m}>{m}</option>)}
                {!models.includes(profile.model) && <option value={profile.model}>{profile.model} (custom)</option>}
              </select>
              <input
                type="text"
                placeholder="custom model id…"
                className="w-36 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                value={profile.model}
                onChange={e => onUpdate({ model: e.target.value })}
              />
            </div>
          </div>

          {/* Generation params */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">
                <span>Temperature</span>
                <span className="text-white/45">{profile.temperature ?? 0.7}</span>
              </label>
              <input
                type="range" min="0" max="2" step="0.05"
                className="w-full accent-cyan-400"
                value={profile.temperature ?? 0.7}
                onChange={e => onUpdate({ temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">Max Tokens</label>
              <input
                type="number" min="64" max="200000" step="256"
                placeholder="default"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                value={profile.maxTokens ?? ''}
                onChange={e => onUpdate({ maxTokens: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          {/* Priority + Fallback */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">
                <span>Priority</span>
                <span className="text-white/45">{profile.priority} (lower = primary)</span>
              </label>
              <input
                type="range" min="1" max="100" step="1"
                className="w-full accent-violet-400"
                value={profile.priority}
                onChange={e => onUpdate({ priority: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">Fallback to</label>
              <select
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 font-mono text-[9.5px] text-white/60 outline-none focus:border-white/20 transition-colors"
                value={profile.fallbackToId ?? ''}
                onChange={e => onUpdate({ fallbackToId: e.target.value || undefined })}
              >
                <option value="">— None —</option>
                {profiles.filter(p => p.id !== profile.id).map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost fields (read-only display + override) */}
          {(profile.costPer1kInput != null || profile.costPer1kOutput != null) && (
            <div className="flex gap-4 rounded-lg border border-white/6 bg-white/[0.01] px-3 py-2">
              <div>
                <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">Cost / 1K input tokens</div>
                <div className="font-mono text-[9px] text-white/50 mt-0.5">${profile.costPer1kInput?.toFixed(3) ?? '—'}</div>
              </div>
              <div>
                <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">Cost / 1K output tokens</div>
                <div className="font-mono text-[9px] text-white/50 mt-0.5">${profile.costPer1kOutput?.toFixed(3) ?? '—'}</div>
              </div>
              <div className="ml-auto">
                <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">Est. total spend</div>
                <div className="font-mono text-[9px] text-emerald-400/70 mt-0.5">{fmtCost(profile)}</div>
              </div>
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onSetActive}
              disabled={isActive}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] transition-colors',
                isActive
                  ? 'border-cyan-400/20 bg-cyan-400/6 text-cyan-400/50 cursor-default'
                  : 'border-cyan-400/20 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15 cursor-pointer',
              )}
            >
              <CheckCircle className="h-3 w-3" />
              {isActive ? 'Perfil activo' : 'Usar como activo'}
            </button>
            <button
              onClick={runTest}
              disabled={testing}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[9px] text-white/45 transition-colors hover:bg-white/5 hover:text-white/65"
            >
              {testing ? <RotateCcw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              {testing ? 'Probando…' : 'Probar conexión'}
            </button>
            <button
              onClick={onRemove}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-400/12 px-3 py-1.5 font-mono text-[9px] text-red-400/50 transition-colors hover:border-red-400/25 hover:text-red-400/80"
            >
              <Trash2 className="h-3 w-3" />Eliminar
            </button>
          </div>

          {/* Last error */}
          {stats?.lastError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-400/12 bg-red-400/5 px-3 py-2">
              <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-400/60" />
              <span className="font-mono text-[8.5px] text-red-400/70 break-all">{stats.lastError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── New profile form ──────────────────────────────────────────────────────────

function NewProfileForm({ onAdd }: { onAdd: (p: LLMProfile) => void }) {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState<LLMProfile['provider']>('openai')
  const [label, setLabel] = useState('')

  function add() {
    const models = PROVIDER_MODELS[provider] ?? []
    const p: LLMProfile = {
      id:            crypto.randomUUID(),
      provider,
      label:         label || PROVIDER_LABELS[provider],
      model:         models[0] ?? 'default',
      apiKey:        '',
      enabled:       false,
      status:        'untested',
      priority:      99,
      temperature:   0.7,
      costPer1kInput:  PROVIDER_COSTS[provider]?.input,
      costPer1kOutput: PROVIDER_COSTS[provider]?.output,
      stats:         { lastUsed: null, lastError: null, totalRequests: 0, totalTokensIn: 0, totalTokensOut: 0, avgLatencyMs: 0, errorCount: 0 },
    }
    onAdd(p)
    setLabel('')
    setOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 font-mono text-[9.5px] text-white/35 transition-colors hover:bg-white/[0.03] hover:text-white/55"
      >
        <Plus className="h-3 w-3" />Añadir nueva conexión LLM
      </button>
      {open && (
        <div className="border-t border-white/8 p-4 space-y-3 bg-violet-400/[0.02]">
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-2">Proveedor</label>
            <div className="grid grid-cols-5 gap-1.5">
              {PROVIDER_ORDER.map(pv => (
                <button
                  key={pv}
                  onClick={() => setProvider(pv)}
                  className={cn(
                    'rounded-lg border py-1.5 font-mono text-[7.5px] transition-colors truncate px-1',
                    provider === pv
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/8 text-white/30 hover:border-white/20 hover:text-white/55',
                  )}
                  style={provider === pv ? { borderColor: PROVIDER_ACCENT[pv] + '40', color: PROVIDER_ACCENT[pv] } : {}}
                >
                  {pv}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder={`Label (default: ${PROVIDER_LABELS[provider]})`}
            className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={add} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[9px] text-emerald-400 hover:bg-emerald-400/15 transition-colors">
              <Check className="h-3 w-3" />Crear
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[9px] text-white/30 hover:text-white/55 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fallback chain visualizer ──────────────────────────────────────────────────

function FallbackChain({ profiles, activeId }: { profiles: LLMProfile[]; activeId: string | null }) {
  const chain = useMemo(() => {
    const visited = new Set<string>()
    const result: LLMProfile[] = []
    let id: string | undefined = activeId ?? undefined
    while (id && !visited.has(id)) {
      visited.add(id)
      const p = profiles.find(x => x.id === id && x.enabled)
      if (!p) break
      result.push(p)
      id = p.fallbackToId
    }
    return result
  }, [profiles, activeId])

  if (chain.length <= 1) return null

  return (
    <div className="rounded-xl border border-violet-400/12 bg-violet-400/[0.025] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Layers className="h-3 w-3 text-violet-400/60" />
        <span className="font-mono text-[8.5px] uppercase tracking-wider text-violet-400/60">Fallback chain activo</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {chain.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-black/20 px-2.5 py-1">
              <StatusDot status={p.status} />
              <span className="font-mono text-[9px] text-white/55">{p.label}</span>
            </div>
            {i < chain.length - 1 && <ArrowRight className="h-3 w-3 text-white/20 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function SummaryBar({ profiles }: { profiles: LLMProfile[] }) {
  const enabled    = profiles.filter(p => p.enabled).length
  const connected  = profiles.filter(p => p.status === 'connected').length
  const errors     = profiles.filter(p => p.status === 'error').length
  const totalReqs  = profiles.reduce((s, p) => s + (p.stats?.totalRequests ?? 0), 0)
  const totalTkIn  = profiles.reduce((s, p) => s + (p.stats?.totalTokensIn  ?? 0), 0)
  const totalTkOut = profiles.reduce((s, p) => s + (p.stats?.totalTokensOut ?? 0), 0)

  return (
    <div className="grid grid-cols-6 gap-2">
      {[
        { label: 'Total',      value: String(profiles.length),   color: 'text-white/45' },
        { label: 'Habilitados',value: String(enabled),           color: 'text-cyan-400/70' },
        { label: 'Conectados', value: String(connected),         color: 'text-emerald-400/70' },
        { label: 'Errores',    value: String(errors),            color: errors > 0 ? 'text-red-400/70' : 'text-white/30' },
        { label: 'Requests',   value: fmtTokens(totalReqs),      color: 'text-white/45' },
        { label: 'Tokens tot', value: fmtTokens(totalTkIn + totalTkOut), color: 'text-white/45' },
      ].map(({ label, value, color }) => (
        <div key={label} className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center">
          <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">{label}</div>
          <div className={`font-mono text-[13px] font-medium mt-0.5 ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function LLMConnectionsTab() {
  const { state, dispatch } = useAdmin()
  const [filter, setFilter] = useState<'all' | 'enabled' | 'connected' | 'error'>('all')
  const [search, setSearch] = useState('')

  const profiles   = state.aiConfig.profiles as LLMProfile[]
  const activeId   = state.aiConfig.activeProfileId

  const filtered = useMemo(() => {
    let list = profiles
    if (filter === 'enabled')   list = list.filter(p => p.enabled)
    if (filter === 'connected') list = list.filter(p => p.status === 'connected')
    if (filter === 'error')     list = list.filter(p => p.status === 'error')
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.label.toLowerCase().includes(q) ||
        p.provider.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => a.priority - b.priority)
  }, [profiles, filter, search])

  function update(id: string, data: Partial<LLMProfile>) {
    const existing = profiles.find(p => p.id === id)
    if (!existing) return
    dispatch({ type: 'AI_SET_PROFILE', payload: { ...existing, ...data } })
  }

  function remove(id: string) {
    dispatch({ type: 'AI_REMOVE_PROFILE', payload: id })
  }

  function setActive(id: string) {
    dispatch({ type: 'AI_SET_ACTIVE_PROFILE', payload: id })
  }

  function addProfile(p: LLMProfile) {
    dispatch({ type: 'AI_SET_PROFILE', payload: p })
  }

  function testAll() {
    profiles.filter(p => p.enabled).forEach(p => {
      testConnection(p).then(res => {
        update(p.id, { status: res.ok ? 'connected' : 'error' })
      })
    })
  }

  return (
    <div className="space-y-4">

      {/* Summary */}
      <SummaryBar profiles={profiles} />

      {/* Fallback chain visualization */}
      <FallbackChain profiles={profiles} activeId={activeId} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <input
            type="text"
            placeholder="Buscar proveedor, modelo…"
            className="w-full rounded-xl border border-white/8 bg-white/[0.02] py-1.5 pl-3 pr-8 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        {(['all', 'enabled', 'connected', 'error'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider transition-colors capitalize',
              filter === f
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                : 'border-white/8 text-white/30 hover:border-white/20 hover:text-white/55',
            )}
          >
            {f}
          </button>
        ))}

        {/* Test all */}
        <button
          onClick={testAll}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[9px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/65"
        >
          <Zap className="h-3 w-3" />Test all enabled
        </button>
      </div>

      {/* Provider cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/6 py-8 text-center font-mono text-[10px] text-white/20">
            No hay conexiones con ese filtro.
          </div>
        )}
        {filtered.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            profiles={profiles}
            isActive={profile.id === activeId}
            onUpdate={data => update(profile.id, data)}
            onRemove={() => remove(profile.id)}
            onSetActive={() => setActive(profile.id)}
          />
        ))}
      </div>

      {/* Add new */}
      <NewProfileForm onAdd={addProfile} />

      {/* Provider reference table */}
      <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
        <div className="border-b border-white/6 px-4 py-2.5 flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-white/30" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">Referencia de proveedores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Proveedor', 'Endpoint', 'Auth', 'Formato', '$/1K in', '$/1K out'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-mono text-[8px] uppercase tracking-wider text-white/25">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROVIDER_ORDER.map(pv => {
                const costs  = PROVIDER_COSTS[pv]
                const local  = LOCAL_PROVIDERS.has(pv)
                const accent = PROVIDER_ACCENT[pv]
                return (
                  <tr key={pv} className="border-b border-white/4 hover:bg-white/[0.015] transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md text-[8px] font-bold text-black flex items-center justify-center" style={{ background: accent }}>
                          {pv.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-mono text-[9px] text-white/60">{PROVIDER_LABELS[pv]}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[8px] text-white/30 max-w-48 truncate">{PROVIDER_BASE_URL[pv]}</td>
                    <td className="px-3 py-2">
                      {local
                        ? <span className="rounded-full border border-emerald-400/20 bg-emerald-400/6 px-1.5 py-0.5 font-mono text-[7px] text-emerald-400/60">Sin key</span>
                        : <span className="rounded-full border border-amber-400/20 bg-amber-400/6 px-1.5 py-0.5 font-mono text-[7px] text-amber-400/60">API Key</span>
                      }
                    </td>
                    <td className="px-3 py-2">
                      {pv === 'gemini'
                        ? <span className="font-mono text-[8px] text-white/30">Gemini API</span>
                        : pv === 'claude'
                        ? <span className="font-mono text-[8px] text-white/30">Anthropic API</span>
                        : pv === 'cohere'
                        ? <span className="font-mono text-[8px] text-white/30">Cohere API</span>
                        : pv === 'ollama'
                        ? <span className="font-mono text-[8px] text-white/30">Ollama API</span>
                        : <span className="font-mono text-[8px] text-white/30">OpenAI-compat</span>
                      }
                    </td>
                    <td className="px-3 py-2 font-mono text-[8.5px] text-white/45">
                      {costs?.input === 0 ? <span className="text-emerald-400/60">free</span> : costs ? `$${costs.input.toFixed(3)}` : '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-[8.5px] text-white/45">
                      {costs?.output === 0 ? <span className="text-emerald-400/60">free</span> : costs ? `$${costs.output.toFixed(3)}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
