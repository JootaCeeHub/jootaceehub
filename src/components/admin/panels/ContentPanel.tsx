'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Eye, EyeOff, RefreshCw, ExternalLink, Maximize2, Pencil,
  ChevronRight, ChevronDown, Sparkles, LayoutGrid, Monitor, Tablet, Smartphone,
  Layers, Cpu, FlaskConical, Server, BookOpen, MessageSquare,
  User, GitBranch, FolderKanban, Microscope, Library, Gamepad2, Globe,
  Plus, Trash2, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { profile } from '@/lib/config/brand'
import {
  RESOURCE_CATEGORIES,
} from '@/lib/resources/registry'
import type { RCatKey } from '@/lib/resources/registry'
import type {
  StatItem, ServiceItem, LogoItem, AdminPanel, BlockSection,
  ProjectEntry, ResearchEntry, SystemEntry, LabEntry, CuratedLink,
  GithubRepoMeta, TrackedSource, TrackedSourceType,
  InfraNode, DeployEntry, DeployStatus, NodeStatus,
  ContactContent, NewsletterContent, MapContent,
  ResourceToolItem, ResourceRepoItem, ResourceWorkItem,
  ResourcePromptItem, ResourceMcpItem, ResourceAgentItem, ResourceSkillItem,
  IntelligenceFeed,
} from '@/lib/admin/types'

// ─── Primitives ────────────────────────────────────────────────────────────────

const inp  = "w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors"
const area = "w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/75 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-colors resize-none leading-relaxed"

function F({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{l}</label>
      {children}
    </div>
  )
}

function Tog({ label, on, toggle }: { label: string; on: boolean; toggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-white/65">{label}</span>
      <button onClick={toggle}
        className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all',
          on ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
          on ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30')} />
      </button>
    </div>
  )
}

function Slider({ label, value, min, max, step = 0.05, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{label}</span>
        <span className="font-mono text-[9px] text-white/45">{Math.round(value * 100) / 100}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded bg-white/10 accent-cyan-400" />
    </div>
  )
}

function I18nRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
      <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 shrink-0 min-w-[70px]">{label}</span>
      <span className="text-[11px] text-white/60 leading-relaxed">{value}</span>
    </div>
  )
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COL_SYS: Record<string, string>  = { operational: '#34d399', degraded: '#fbbf24', maintenance: '#94a3b8', offline: '#f87171' }
const STATUS_COL_LAB: Record<string, string>  = { live: '#34d399', beta: '#60a5fa', rd: '#a78bfa', roadmap: '#94a3b8' }
const STATUS_COL_PROJ: Record<string, string> = { live: '#34d399', beta: '#60a5fa', wip: '#fbbf24', archived: '#94a3b8' }
const STATUS_COL_NODE: Record<string, string> = { running: '#34d399', stopped: '#f87171', degraded: '#fbbf24' }
const CAT_COL: Record<string, string> = { opinion: '#a78bfa', research: '#34d399', essays: '#fbbf24', news: '#38bdf8' }
const LINK_CAT_COL: Record<string, string> = {
  tools: '#34d399', articles: '#a78bfa', repos: '#60a5fa', videos: '#f472b6',
  docs: '#fbbf24', agents: '#fb923c', automations: '#38bdf8', other: '#94a3b8',
}

// ─── Hero editor ───────────────────────────────────────────────────────────────

function HeroEditor() {
  const { state, dispatch } = useAdmin()
  const tHero = useTranslations('hero')
  const h = state.content.hero
  const p = (d: Partial<typeof h>) => dispatch({ type: 'UPDATE_HERO_CONTENT', payload: d })
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
        Los textos del Hero se definen en i18n. Los campos de abajo son ajustes del CMS.
      </div>
      <div className="space-y-1.5">
        <I18nRow label="headline"      value={tHero('headline') as string}      />
        <I18nRow label="subheadline"   value={tHero('subheadline') as string}   />
        <I18nRow label="cta primary"   value={tHero('ctaPrimary') as string}    />
        <I18nRow label="cta secondary" value={tHero('ctaSecondary') as string}  />
      </div>
      <div className="border-t border-white/6 pt-3 space-y-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Ajustes CMS</p>
        <F l="Eyebrow / Badge"><input className={inp} value={h.eyebrow} onChange={e => p({ eyebrow: e.target.value })} /></F>
        <F l="Override Título"><input className={inp} value={h.title} placeholder="(usa i18n si vacío)" onChange={e => p({ title: e.target.value })} /></F>
        <F l="Override Subtítulo"><textarea rows={2} className={area} value={h.subtitle} placeholder="(usa i18n si vacío)" onChange={e => p({ subtitle: e.target.value })} /></F>
        <div className="grid grid-cols-2 gap-2">
          <F l="Texto botón 1"><input className={inp} value={h.primaryBtnText} onChange={e => p({ primaryBtnText: e.target.value })} /></F>
          <F l="Href botón 1"><input className={inp} value={h.primaryBtnHref} onChange={e => p({ primaryBtnHref: e.target.value })} /></F>
          <F l="Texto botón 2"><input className={inp} value={h.secondaryBtnText} onChange={e => p({ secondaryBtnText: e.target.value })} /></F>
          <F l="Href botón 2"><input className={inp} value={h.secondaryBtnHref} onChange={e => p({ secondaryBtnHref: e.target.value })} /></F>
        </div>
        <Tog label="Mostrar eyebrow badge" on={h.showBadge} toggle={() => p({ showBadge: !h.showBadge })} />
      </div>
    </div>
  )
}

// ─── Systems editor (full inline CRUD) ────────────────────────────────────────

function SystemsEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const t = useTranslations('home.systems')
  const systems = state.systemsRegistry ?? []
  const online  = systems.filter(s => s.status === 'operational').length

  const upd = (key: string, data: Partial<SystemEntry>) =>
    dispatch({ type: 'UPDATE_SYSTEM', payload: { key, data } })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5">
        <I18nRow label="badge" value={t('badge') as string} />
        <I18nRow label="title" value={t('title') as string} />
      </div>
      <div className="flex items-center gap-2 border-t border-white/6 pt-2">
        <span className="font-mono text-[9px] text-white/30">{systems.length} sistemas</span>
        <span className="h-px flex-1 bg-white/6" />
        <span className="font-mono text-[9px]" style={{ color: '#34d399' }}>{online} operacionales</span>
      </div>
      <div className="space-y-1.5">
        {systems.map(s => {
          const isExp = expanded === s.key
          const sc = STATUS_COL_SYS[s.status] ?? '#94a3b8'
          return (
            <div key={s.key} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sc }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-white/80">{s.name}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{s.status}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{s.version}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{s.uptime}</span>
                    <span className="font-mono text-[7px] text-white/20 shrink-0">{s.tools} tools</span>
                  </div>
                  <div className="text-[9px] text-white/30 truncate">{s.badge}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(s.key, { visible: !s.visible })}
                    title={s.visible ? 'Ocultar' : 'Mostrar'}
                    className={cn('rounded p-1 transition-colors', s.visible ? 'text-white/40' : 'text-white/15 hover:text-white/40')}>
                    {s.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : s.key)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>
              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Nombre"><input className={inp} value={s.name} onChange={e => upd(s.key, { name: e.target.value })} /></F>
                    <F l="Badge"><input className={inp} value={s.badge} onChange={e => upd(s.key, { badge: e.target.value })} /></F>
                  </div>
                  <F l="Descripción">
                    <textarea rows={2} className={area} value={s.description} onChange={e => upd(s.key, { description: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-3 gap-2">
                    <F l="Status">
                      <select className={cn(inp, 'cursor-pointer')} value={s.status}
                        onChange={e => upd(s.key, { status: e.target.value as SystemEntry['status'] })}>
                        {['operational', 'degraded', 'maintenance', 'offline'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </F>
                    <F l="Versión"><input className={inp} value={s.version} onChange={e => upd(s.key, { version: e.target.value })} /></F>
                    <F l="Uptime"><input className={inp} value={s.uptime} onChange={e => upd(s.key, { uptime: e.target.value })} /></F>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-end">
                    <F l="Tools (#)">
                      <input type="number" className={inp} value={s.tools}
                        onChange={e => upd(s.key, { tools: parseInt(e.target.value) || 0 })} />
                    </F>
                    <Tog label="Visible" on={s.visible} toggle={() => upd(s.key, { visible: !s.visible })} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Labs editor (full inline CRUD) ───────────────────────────────────────────

function LabsEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const t = useTranslations('home.labs')
  const labs = state.labsRegistry ?? []

  const upd = (key: string, data: Partial<LabEntry>) =>
    dispatch({ type: 'UPDATE_LAB', payload: { key, data } })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5">
        <I18nRow label="badge" value={t('badge') as string} />
        <I18nRow label="title" value={t('title') as string} />
      </div>
      <div className="flex items-center gap-2 border-t border-white/6 pt-2">
        <span className="font-mono text-[9px] text-white/30">{labs.length} laboratorios</span>
        <span className="h-px flex-1 bg-white/6" />
        <span className="font-mono text-[9px]" style={{ color: '#34d399' }}>
          {labs.filter(l => l.status === 'live').length} live
        </span>
      </div>
      <div className="space-y-1.5">
        {labs.map(l => {
          const isExp = expanded === l.key
          const sc = STATUS_COL_LAB[l.status] ?? '#94a3b8'
          return (
            <div key={l.key} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sc }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-medium text-white/80">{l.name}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{l.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {l.stack.slice(0, 5).map(tech => (
                      <span key={tech} className="font-mono text-[7px] text-white/25">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(l.key, { visible: !l.visible })}
                    className={cn('rounded p-1 transition-colors', l.visible ? 'text-white/40' : 'text-white/15 hover:text-white/40')}>
                    {l.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : l.key)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>
              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Nombre"><input className={inp} value={l.name} onChange={e => upd(l.key, { name: e.target.value })} /></F>
                    <F l="Tagline"><input className={inp} value={l.tagline} onChange={e => upd(l.key, { tagline: e.target.value })} /></F>
                  </div>
                  <F l="Descripción">
                    <textarea rows={2} className={area} value={l.description} onChange={e => upd(l.key, { description: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Status">
                      <select className={cn(inp, 'cursor-pointer')} value={l.status}
                        onChange={e => upd(l.key, { status: e.target.value as LabEntry['status'] })}>
                        <option value="live">live</option>
                        <option value="beta">beta</option>
                        <option value="rd">r&d</option>
                        <option value="roadmap">roadmap</option>
                      </select>
                    </F>
                    <F l="Accent">
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={l.accent} onChange={e => upd(l.key, { accent: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent p-0.5 shrink-0" />
                        <input className={cn(inp, 'flex-1')} value={l.accent} onChange={e => upd(l.key, { accent: e.target.value })} />
                      </div>
                    </F>
                  </div>
                  <F l="Stack (coma)">
                    <input className={inp} value={l.stack.join(', ')}
                      onChange={e => upd(l.key, { stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                  </F>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">Métricas</label>
                    {l.metrics.map((m, mi) => (
                      <div key={mi} className="flex gap-2">
                        <input className={cn(inp, 'flex-1')} value={m.label} placeholder="Label"
                          onChange={e => upd(l.key, { metrics: l.metrics.map((x, i) => i === mi ? { ...x, label: e.target.value } : x) })} />
                        <input className={cn(inp, 'flex-1')} value={m.value} placeholder="Valor"
                          onChange={e => upd(l.key, { metrics: l.metrics.map((x, i) => i === mi ? { ...x, value: e.target.value } : x) })} />
                      </div>
                    ))}
                  </div>
                  <Tog label="Visible" on={l.visible} toggle={() => upd(l.key, { visible: !l.visible })} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Infrastructure summary (with edit) ───────────────────────────────────────

function InfraEditor() {
  const { state, dispatch } = useAdmin()
  const [tab, setTab]       = useState<'config' | 'nodes' | 'deployments'>('config')
  const [expanded, setExpanded] = useState<string | null>(null)
  const cfg     = state.infraConfig
  const nodes   = cfg?.nodes ?? []
  const deploys = cfg?.deployments ?? []

  const p = (d: Partial<{ region: string; orchestrator: string; version: string }>) =>
    dispatch({ type: 'UPDATE_INFRA_CONFIG', payload: d })
  const updNode = (name: string, data: Partial<InfraNode>) =>
    dispatch({ type: 'UPDATE_INFRA_NODE', payload: { name, data } })
  const remNode = (name: string) => dispatch({ type: 'REMOVE_INFRA_NODE', payload: name })
  const addNode = () => dispatch({
    type: 'ADD_INFRA_NODE',
    payload: { name: `node-${Date.now()}`, role: 'worker', image: 'ubuntu:latest', status: 'running', cpu: '0%', mem: '0 MB', uptime: '0d', visible: true },
  })
  const setDeploys = (payload: DeployEntry[]) => dispatch({ type: 'SET_INFRA_DEPLOYMENTS', payload })
  const remDeploy  = (i: number) => dispatch({ type: 'REMOVE_INFRA_DEPLOYMENT', payload: i })
  const addDeploy  = () => dispatch({
    type: 'ADD_INFRA_DEPLOYMENT',
    payload: { service: 'nuevo-servicio', version: '1.0.0', env: 'production', status: 'pending', timestamp: new Date().toISOString() },
  })

  const DEPLOY_COL: Record<DeployStatus, string> = { success: '#34d399', pending: '#fbbf24', failed: '#f87171' }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {([
          { id: 'config',      label: 'Config'                         },
          { id: 'nodes',       label: `Nodos (${nodes.length})`        },
          { id: 'deployments', label: `Deploys (${deploys.length})`    },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              tab === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'config' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <F l="Región"><input className={inp} value={cfg?.region ?? ''} onChange={e => p({ region: e.target.value })} /></F>
            <F l="Orquestador"><input className={inp} value={cfg?.orchestrator ?? ''} onChange={e => p({ orchestrator: e.target.value })} /></F>
          </div>
          <F l="Versión"><input className={inp} value={cfg?.version ?? ''} placeholder="v1.0.0" onChange={e => p({ version: e.target.value })} /></F>
        </div>
      )}

      {tab === 'nodes' && (
        <div className="space-y-1.5">
          {nodes.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin nodos — añade el primer nodo de infraestructura
            </div>
          )}
          {nodes.map(n => {
            const isExp = expanded === n.name
            const sc    = STATUS_COL_NODE[n.status] ?? '#94a3b8'
            return (
              <div key={n.name} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: sc }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{n.name}</span>
                      <span className="font-mono text-[8px] text-white/30">{n.role}</span>
                    </div>
                    <div className="font-mono text-[9px] text-white/25">{n.cpu} CPU · {n.mem} · ⬆ {n.uptime}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updNode(n.name, { visible: !n.visible })}
                      className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                        n.visible ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70' : 'border-white/10 text-white/25 hover:border-white/20')}>
                      {n.visible ? 'VIS' : 'HID'}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : n.name)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remNode(n.name)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Nombre"><input className={inp} value={n.name} onChange={e => updNode(n.name, { name: e.target.value })} /></F>
                      <F l="Rol"><input className={inp} value={n.role} placeholder="worker/master" onChange={e => updNode(n.name, { role: e.target.value })} /></F>
                    </div>
                    <F l="Imagen Docker"><input className={inp} value={n.image} placeholder="ubuntu:latest" onChange={e => updNode(n.name, { image: e.target.value })} /></F>
                    <div className="grid grid-cols-3 gap-2">
                      <F l="CPU"><input className={inp} value={n.cpu} placeholder="12%" onChange={e => updNode(n.name, { cpu: e.target.value })} /></F>
                      <F l="Memoria"><input className={inp} value={n.mem} placeholder="512 MB" onChange={e => updNode(n.name, { mem: e.target.value })} /></F>
                      <F l="Uptime"><input className={inp} value={n.uptime} placeholder="7d 3h" onChange={e => updNode(n.name, { uptime: e.target.value })} /></F>
                    </div>
                    <F l="Estado">
                      <select className={cn(inp, 'cursor-pointer')} value={n.status}
                        onChange={e => updNode(n.name, { status: e.target.value as NodeStatus })}>
                        <option value="running">Running</option>
                        <option value="stopped">Stopped</option>
                        <option value="degraded">Degraded</option>
                      </select>
                    </F>
                  </div>
                )}
              </div>
            )
          })}
          <button onClick={addNode}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir nodo
          </button>
        </div>
      )}

      {tab === 'deployments' && (
        <div className="space-y-1.5">
          {deploys.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin deploys registrados
            </div>
          )}
          {deploys.map((d, i) => {
            const dc    = DEPLOY_COL[d.status] ?? '#94a3b8'
            const isExp = expanded === `d-${i}`
            return (
              <div key={i} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: dc }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{d.service}</span>
                      <span className="font-mono text-[8px] text-white/35">{d.version}</span>
                      <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                        style={{ color: dc, borderColor: `${dc}30`, background: `${dc}10` }}>{d.env}</span>
                    </div>
                    <div className="font-mono text-[9px] text-white/25">{d.timestamp.slice(0, 16).replace('T', ' ')}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setExpanded(isExp ? null : `d-${i}`)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remDeploy(i)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Servicio">
                        <input className={inp} value={d.service}
                          onChange={e => setDeploys(deploys.map((dep, j) => j === i ? { ...dep, service: e.target.value } : dep))} />
                      </F>
                      <F l="Versión">
                        <input className={inp} value={d.version}
                          onChange={e => setDeploys(deploys.map((dep, j) => j === i ? { ...dep, version: e.target.value } : dep))} />
                      </F>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Entorno">
                        <select className={cn(inp, 'cursor-pointer')} value={d.env}
                          onChange={e => setDeploys(deploys.map((dep, j) => j === i ? { ...dep, env: e.target.value } : dep))}>
                          <option value="production">production</option>
                          <option value="staging">staging</option>
                          <option value="development">development</option>
                        </select>
                      </F>
                      <F l="Estado">
                        <select className={cn(inp, 'cursor-pointer')} value={d.status}
                          onChange={e => setDeploys(deploys.map((dep, j) => j === i ? { ...dep, status: e.target.value as DeployStatus } : dep))}>
                          <option value="success">success</option>
                          <option value="pending">pending</option>
                          <option value="failed">failed</option>
                        </select>
                      </F>
                    </div>
                    <F l="Timestamp">
                      <input className={inp} value={d.timestamp}
                        onChange={e => setDeploys(deploys.map((dep, j) => j === i ? { ...dep, timestamp: e.target.value } : dep))} />
                    </F>
                  </div>
                )}
              </div>
            )
          })}
          <button onClick={addDeploy}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir deploy
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Journal summary ───────────────────────────────────────────────────────────

function JournalSummary() {
  const { state } = useAdmin()
  const t = useTranslations('home.journal')
  const articles = state.researchRegistry ?? []
  const published = articles.filter(a => a.published)
  const featured  = articles.filter(a => a.featured)
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5">
        <I18nRow label="badge"       value={t('badge') as string}       />
        <I18nRow label="title"       value={t('title') as string}       />
        <I18nRow label="description" value={t('description') as string} />
        <I18nRow label="cta"         value={t('cta') as string}         />
      </div>
      <div className="border-t border-white/6 pt-2 space-y-1.5">
        <div className="flex gap-4 text-[10px] text-white/40">
          <span>{articles.length} artículos</span>
          <span>{published.length} publicados</span>
          <span>{featured.length} destacados</span>
        </div>
        {articles.slice(0, 4).map(a => (
          <div key={a.slug} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/6 bg-white/[0.015]">
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.published ? 'bg-emerald-400' : 'bg-white/20')} />
            <span className="flex-1 text-[11px] text-white/65 truncate">{a.title}</span>
            <span className="font-mono text-[8px] text-white/25 shrink-0">{a.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Collab editor ─────────────────────────────────────────────────────────────

function CollabEditor() {
  const { state, dispatch } = useAdmin()
  const t  = useTranslations('home.collab')
  const ab = state.aboutConfig
  const c  = state.content.contact ?? { email: '', phone: '', address: '', mapEmbedUrl: '', showForm: true, showMap: false, whatsapp: '' }

  const AVAIL_COL = { available: '#34d399', limited: '#fbbf24', unavailable: '#f87171' } as const
  const avail = ab?.availability ?? 'available'

  return (
    <div className="space-y-3">
      {/* Availability quick-toggle */}
      <div className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30 mb-2">Estado de disponibilidad</p>
        <div className="flex gap-2">
          {(['available', 'limited', 'unavailable'] as const).map(s => {
            const col = AVAIL_COL[s]
            return (
              <button key={s} onClick={() => dispatch({ type: 'UPDATE_ABOUT', payload: { availability: s } })}
                className={cn('flex-1 rounded-lg border py-1.5 font-mono text-[9px] capitalize transition-all',
                  avail === s ? 'border-current' : 'border-white/10 text-white/30 hover:text-white/55')}
                style={avail === s ? { color: col, borderColor: `${col}40`, background: `${col}10` } : {}}>
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick email edit */}
      <F l="Email de contacto (CTA)">
        <input type="email" className={inp} value={c.email}
          onChange={e => dispatch({ type: 'UPDATE_CONTACT_CONTENT', payload: { email: e.target.value } })} />
      </F>

      {/* i18n reference */}
      <div className="border-t border-white/6 pt-2 space-y-1.5">
        <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
          Textos via i18n — <code className="font-mono">messages/*.json → home.collab</code>
        </div>
        <I18nRow label="badge"       value={t('badge') as string}        />
        <I18nRow label="title"       value={t('title') as string}        />
        <I18nRow label="description" value={t('description') as string}  />
        <I18nRow label="cta"         value={t('cta') as string}          />
        <I18nRow label="cta 2"       value={t('ctaSecondary') as string} />
        <I18nRow label="email"       value={t('email') as string}        />
      </div>
    </div>
  )
}

// ─── Projects editor (full CRUD) ──────────────────────────────────────────────

function ProjectsEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const projects = state.projectsRegistry ?? []

  const upd = (id: string, data: Partial<ProjectEntry>) =>
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, data } })
  const rem = (id: string) => dispatch({ type: 'REMOVE_PROJECT', payload: id })
  const add = () => dispatch({
    type: 'ADD_PROJECT',
    payload: {
      id: crypto.randomUUID(), slug: `project-${Date.now()}`,
      title: 'Nuevo proyecto', tagline: '', category: 'ai', status: 'wip',
      featured: false, published: false, description: '',
      techStack: [], tags: [], screenshots: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      relatedResearch: [], relatedResources: [], accent: '#60a5fa',
    },
  })

  const total = projects.length
  const pub   = projects.filter(p => p.published).length
  const feat  = projects.filter(p => p.featured).length
  const live  = projects.filter(p => p.status === 'live').length

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Total',      v: total, c: '#94a3b8' },
          { l: 'Live',       v: live,  c: '#34d399' },
          { l: 'Publicados', v: pub,   c: '#60a5fa' },
          { l: 'Destacados', v: feat,  c: '#fbbf24' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-base font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="space-y-1.5">
        {projects.map(p => {
          const isExp = expanded === p.id
          const sc = STATUS_COL_PROJ[p.status] ?? '#94a3b8'
          return (
            <div key={p.id} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              {/* Row header */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sc }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/80 truncate">{p.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{p.status}</span>
                    <span className="font-mono text-[7px] rounded border border-white/10 px-1.5 py-0.5 text-white/30 shrink-0">{p.category}</span>
                  </div>
                  <div className="text-[9px] text-white/35 truncate">{p.tagline || p.description}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(p.id, { published: !p.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      p.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {p.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(p.id, { featured: !p.featured })} title="Destacado"
                    className={cn('rounded p-1 transition-colors', p.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : p.id)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                  <button onClick={() => rem(p.id)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Expanded form */}
              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={p.title} onChange={e => upd(p.id, { title: e.target.value })} />
                    </F>
                    <F l="Tagline">
                      <input className={inp} value={p.tagline} onChange={e => upd(p.id, { tagline: e.target.value })} />
                    </F>
                  </div>
                  <F l="Descripción">
                    <textarea rows={2} className={area} value={p.description} onChange={e => upd(p.id, { description: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Status">
                      <select className={cn(inp, 'cursor-pointer')} value={p.status}
                        onChange={e => upd(p.id, { status: e.target.value as ProjectEntry['status'] })}>
                        <option value="live">live</option>
                        <option value="beta">beta</option>
                        <option value="wip">wip</option>
                        <option value="archived">archived</option>
                      </select>
                    </F>
                    <F l="Categoría">
                      <select className={cn(inp, 'cursor-pointer')} value={p.category}
                        onChange={e => upd(p.id, { category: e.target.value as ProjectEntry['category'] })}>
                        {['ai','web','automation','infrastructure','tool','research','other'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </F>
                  </div>
                  <F l="Tech Stack (coma)">
                    <input className={inp} value={p.techStack.join(', ')}
                      onChange={e => upd(p.id, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Repo URL">
                      <input className={inp} value={p.repoUrl ?? ''} onChange={e => upd(p.id, { repoUrl: e.target.value })} />
                    </F>
                    <F l="Live URL">
                      <input className={inp} value={p.liveUrl ?? ''} onChange={e => upd(p.id, { liveUrl: e.target.value })} />
                    </F>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado" on={p.published} toggle={() => upd(p.id, { published: !p.published })} />
                    <Tog label="Destacado" on={p.featured}  toggle={() => upd(p.id, { featured: !p.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Añadir proyecto
      </button>
    </div>
  )
}

// ─── Research editor (full CRUD) ──────────────────────────────────────────────

function ResearchEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState('all')
  const articles = state.researchRegistry ?? []

  const upd = (slug: string, data: Partial<ResearchEntry>) =>
    dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data } })
  const add = () => dispatch({
    type: 'ADD_RESEARCH_ENTRY',
    payload: {
      slug: `article-${Date.now()}`, title: 'Nuevo artículo',
      category: 'opinion', excerpt: '', tags: [], readTime: 5,
      published: false, featured: false,
    },
  })

  const cats = ['all', 'opinion', 'research', 'essays', 'news']
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter)
  const pub  = articles.filter(a => a.published).length
  const feat = articles.filter(a => a.featured).length

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { l: 'Total',      v: articles.length, c: '#94a3b8' },
          { l: 'Publicados', v: pub,              c: '#34d399' },
          { l: 'Destacados', v: feat,             c: '#fbbf24' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {cats.map(c => {
          const cc = CAT_COL[c] ?? '#94a3b8'
          return (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn('rounded-lg border px-2 py-0.5 font-mono text-[8px] transition-all',
                catFilter === c ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 text-white/25 hover:text-white/50')}
              style={catFilter === c && c !== 'all' ? { borderColor: `${cc}30`, color: cc, background: `${cc}10` } : {}}>
              {c === 'all' ? `todos (${articles.length})` : `${c} (${articles.filter(a => a.category === c).length})`}
            </button>
          )
        })}
      </div>

      {/* Article list */}
      <div className="space-y-1.5">
        {filtered.map(a => {
          const isExp = expanded === a.slug
          const cc    = CAT_COL[a.category] ?? '#94a3b8'
          return (
            <div key={a.slug} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/75 truncate">{a.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{a.readTime}min</span>
                  </div>
                  <div className="text-[9px] text-white/30 truncate">{a.excerpt}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(a.slug, { published: !a.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      a.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {a.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(a.slug, { featured: !a.featured })}
                    className={cn('rounded p-1 transition-colors', a.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : a.slug)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={a.title} onChange={e => upd(a.slug, { title: e.target.value })} />
                    </F>
                    <F l="Categoría">
                      <select className={cn(inp, 'cursor-pointer')} value={a.category}
                        onChange={e => upd(a.slug, { category: e.target.value as ResearchEntry['category'] })}>
                        <option value="opinion">opinion</option>
                        <option value="research">research</option>
                        <option value="essays">essays</option>
                        <option value="news">news</option>
                      </select>
                    </F>
                  </div>
                  <F l="Excerpt">
                    <textarea rows={2} className={area} value={a.excerpt} onChange={e => upd(a.slug, { excerpt: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Tags (coma)">
                      <input className={inp} value={a.tags.join(', ')}
                        onChange={e => upd(a.slug, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <F l="Lectura (min)">
                      <input type="number" className={inp} value={a.readTime}
                        onChange={e => upd(a.slug, { readTime: parseInt(e.target.value) || 1 })} />
                    </F>
                  </div>
                  <F l="URL Externa (opcional)">
                    <input className={inp} value={a.externalUrl ?? ''}
                      onChange={e => upd(a.slug, { externalUrl: e.target.value || undefined })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado" on={a.published} toggle={() => upd(a.slug, { published: !a.published })} />
                    <Tog label="Destacado" on={a.featured}  toggle={() => upd(a.slug, { featured: !a.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Añadir artículo
      </button>
    </div>
  )
}

// ─── Journal page editor (publication management) ─────────────────────────────

const SOURCE_TYPE_COL: Record<TrackedSourceType, string> = {
  newsletter: '#60a5fa', blog: '#34d399', youtube: '#f87171',
  podcast: '#a78bfa', github: '#94a3b8', twitter: '#38bdf8', other: '#fbbf24',
}

function JournalPageEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState('all')
  const articles = state.researchRegistry ?? []

  const upd = (slug: string, data: Partial<ResearchEntry>) =>
    dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data } })
  const add = () => dispatch({
    type: 'ADD_RESEARCH_ENTRY',
    payload: {
      slug: `article-${Date.now()}`, title: 'Nuevo artículo',
      category: 'opinion', excerpt: '', tags: [], readTime: 5,
      published: false, featured: false,
    },
  })

  const featuredList = articles.filter(a => a.featured)
  const cats = ['all', 'opinion', 'research', 'essays', 'news']
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter)

  return (
    <div className="space-y-3">
      {/* Publication stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Total',      v: articles.length,                          c: '#94a3b8' },
          { l: 'Publicados', v: articles.filter(a => a.published).length, c: '#34d399' },
          { l: 'Destacados', v: featuredList.length,                      c: '#fbbf24' },
          { l: 'Borradores', v: articles.filter(a => !a.published).length,c: '#fb923c' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Featured article indicator */}
      {featuredList.length > 0 && (
        <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2 space-y-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-amber-400/60">Artículos destacados en portada</p>
          {featuredList.map(a => {
            const cc = CAT_COL[a.category] ?? '#94a3b8'
            return (
              <div key={a.slug} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="flex-1 text-[10px] text-white/65 truncate">{a.title}</span>
                <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border"
                  style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                <span className="font-mono text-[7px] text-white/25">{a.readTime}min</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {cats.map(c => {
          const cc = CAT_COL[c] ?? '#94a3b8'
          return (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn('rounded-lg border px-2 py-0.5 font-mono text-[8px] transition-all',
                catFilter === c ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 text-white/25 hover:text-white/50')}
              style={catFilter === c && c !== 'all' ? { borderColor: `${cc}30`, color: cc, background: `${cc}10` } : {}}>
              {c === 'all' ? `todos (${articles.length})` : `${c} (${articles.filter(a => a.category === c).length})`}
            </button>
          )
        })}
      </div>

      {/* Article list */}
      <div className="space-y-1.5">
        {filtered.map(a => {
          const isExp = expanded === a.slug
          const cc    = CAT_COL[a.category] ?? '#94a3b8'
          return (
            <div key={a.slug} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/75 truncate">{a.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{a.readTime}min</span>
                  </div>
                  <div className="text-[9px] text-white/30 truncate">{a.excerpt}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(a.slug, { published: !a.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      a.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {a.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(a.slug, { featured: !a.featured })}
                    title="Destacar en portada"
                    className={cn('rounded p-1 transition-colors', a.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : a.slug)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={a.title} onChange={e => upd(a.slug, { title: e.target.value })} />
                    </F>
                    <F l="Slug">
                      <input className={cn(inp, 'opacity-40 cursor-not-allowed')} value={a.slug} readOnly />
                    </F>
                  </div>
                  <F l="Categoría">
                    <select className={cn(inp, 'cursor-pointer')} value={a.category}
                      onChange={e => upd(a.slug, { category: e.target.value as ResearchEntry['category'] })}>
                      <option value="opinion">opinion</option>
                      <option value="research">research</option>
                      <option value="essays">essays</option>
                      <option value="news">news</option>
                    </select>
                  </F>
                  <F l="Excerpt">
                    <textarea rows={2} className={area} value={a.excerpt} onChange={e => upd(a.slug, { excerpt: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Tags (coma)">
                      <input className={inp} value={a.tags.join(', ')}
                        onChange={e => upd(a.slug, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <F l="Lectura (min)">
                      <input type="number" className={inp} value={a.readTime}
                        onChange={e => upd(a.slug, { readTime: parseInt(e.target.value) || 1 })} />
                    </F>
                  </div>
                  <F l="URL Externa (opcional)">
                    <input className={inp} value={a.externalUrl ?? ''}
                      onChange={e => upd(a.slug, { externalUrl: e.target.value || undefined })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado"       on={a.published} toggle={() => upd(a.slug, { published: !a.published })} />
                    <Tog label="Destacar portada" on={a.featured}  toggle={() => upd(a.slug, { featured: !a.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Nuevo artículo
      </button>
    </div>
  )
}

// ─── Resources editor — website categories + CMS tools ────────────────────────

const PRICING_COL: Record<string, string> = {
  Free: '#34d399', OSS: '#34d399', Freemium: '#fbbf24', Paid: '#f87171',
}
const WORKFLOW_COL: Record<string, string> = { cicd: '#60a5fa', n8n: '#a78bfa', ai: '#f472b6' }
const COMPLEXITY_COL: Record<string, string> = { Low: '#34d399', Medium: '#fbbf24', High: '#f87171' }

function ResourcesEditor() {
  const { state, dispatch } = useAdmin()
  const [mainTab, setMainTab] = useState<'website' | 'links' | 'drive' | 'sources'>('website')
  const [catKey,  setCatKey]  = useState<RCatKey>('tools')
  const [subFilter, setSubFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedInstall, setCopiedInstall] = useState<string | null>(null)
  const links   = state.curatedLinks ?? []
  const drive   = state.driveResources ?? []
  const sources = state.trackedSources ?? []

  const activeCat = RESOURCE_CATEGORIES.find(c => c.key === catKey)!

  const setLinks = (payload: CuratedLink[]) => dispatch({ type: 'SET_CURATED_LINKS', payload })
  const updLink  = (id: string, data: Partial<CuratedLink>) =>
    setLinks(links.map(l => l.id === id ? { ...l, ...data } : l))
  const remLink  = (id: string) => setLinks(links.filter(l => l.id !== id))
  const addLink  = () => setLinks([...links, {
    id: crypto.randomUUID(), url: 'https://', title: 'Nuevo recurso',
    description: '', category: 'tools', tags: [], domain: '',
    published: false, featured: false, addedAt: new Date().toISOString(),
  }])

  const updSource = (id: string, data: Partial<TrackedSource>) =>
    dispatch({ type: 'UPDATE_TRACKED_SOURCE', payload: { id, data } })
  const remSource = (id: string) =>
    dispatch({ type: 'SET_TRACKED_SOURCES', payload: sources.filter(s => s.id !== id) })
  const addSource = () => dispatch({
    type: 'ADD_TRACKED_SOURCE',
    payload: {
      id: crypto.randomUUID(), name: 'Nueva fuente', url: 'https://',
      sourceType: 'blog', description: '', active: true, addedAt: new Date().toISOString(),
    },
  })

  const copyInstall = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedInstall(text)
      setTimeout(() => setCopiedInstall(null), 1500)
    })
  }

  return (
    <div className="space-y-3">
      {/* Main tabs */}
      <div className="flex flex-wrap gap-1">
        {([
          { id: 'website', label: 'Website Resources' },
          { id: 'links',   label: `Links (${links.length})` },
          { id: 'drive',   label: `Drive (${drive.length})` },
          { id: 'sources', label: `Fuentes (${sources.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              mainTab === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Website Resources — full CRUD ── */}
      {mainTab === 'website' && (() => {
        const tools     = state.toolRegistry     ?? []
        const repos     = state.repoRegistry     ?? []
        const workflows = state.workflowRegistry ?? []
        const prompts   = state.promptRegistry   ?? []
        const mcps      = state.mcpRegistry      ?? []
        const agents    = state.agentRegistry    ?? []
        const skills    = state.skillRegistry    ?? []

        const countMap: Record<RCatKey, number> = {
          tools: tools.length, repos: repos.length, workflows: workflows.length,
          prompts: prompts.length, mcp: mcps.length, agents: agents.length, skills: skills.length,
        }

        // Per-category setters (replace whole array — simplest, sufficient)
        const setTools     = (p: ResourceToolItem[])   => dispatch({ type: 'SET_TOOL_REGISTRY',     payload: p })
        const setRepos     = (p: ResourceRepoItem[])   => dispatch({ type: 'SET_REPO_REGISTRY',     payload: p })
        const setWorkflows = (p: ResourceWorkItem[])   => dispatch({ type: 'SET_WORKFLOW_REGISTRY', payload: p })
        const setPrompts   = (p: ResourcePromptItem[]) => dispatch({ type: 'SET_PROMPT_REGISTRY',   payload: p })
        const setMcps      = (p: ResourceMcpItem[])    => dispatch({ type: 'SET_MCP_REGISTRY',      payload: p })
        const setAgents    = (p: ResourceAgentItem[])  => dispatch({ type: 'SET_AGENT_REGISTRY',    payload: p })
        const setSkills    = (p: ResourceSkillItem[])  => dispatch({ type: 'SET_SKILL_REGISTRY',    payload: p })

        // Item-level helpers
        const updTool  = (id: string, d: Partial<ResourceToolItem>)   => setTools(tools.map(i => i.id === id ? { ...i, ...d } : i))
        const updRepo  = (id: string, d: Partial<ResourceRepoItem>)   => setRepos(repos.map(i => i.id === id ? { ...i, ...d } : i))
        const updWork  = (id: string, d: Partial<ResourceWorkItem>)   => setWorkflows(workflows.map(i => i.id === id ? { ...i, ...d } : i))
        const updPr    = (id: string, d: Partial<ResourcePromptItem>) => setPrompts(prompts.map(i => i.id === id ? { ...i, ...d } : i))
        const updMcp   = (id: string, d: Partial<ResourceMcpItem>)    => setMcps(mcps.map(i => i.id === id ? { ...i, ...d } : i))
        const updAgent = (id: string, d: Partial<ResourceAgentItem>)  => setAgents(agents.map(i => i.id === id ? { ...i, ...d } : i))
        const updSkill = (id: string, d: Partial<ResourceSkillItem>)  => setSkills(skills.map(i => i.id === id ? { ...i, ...d } : i))

        const addTool  = () => setTools([...tools, { id: `tool-${Date.now()}`, name: 'New Tool', subCat: 'AI & LLM', url: 'https://', pricing: 'Free' }])
        const addRepo  = () => setRepos([...repos, { id: `repo-${Date.now()}`, org: 'owner', name: 'repo', lang: 'TypeScript', stars: '0', url: 'https://github.com/', cat: 'TypeScript' }])
        const addWork  = () => setWorkflows([...workflows, { id: `wf-${Date.now()}`, title: 'New Workflow', type: 'cicd', complexity: 'Low' }])
        const addPr    = () => setPrompts([...prompts, { id: `pr-${Date.now()}`, title: 'New Prompt', cat: 'System', models: [] }])
        const addMcp   = () => setMcps([...mcps, { id: `mcp-${Date.now()}`, name: 'new-server', cat: 'official', install: 'npx ', toolCount: 0 }])
        const addAgent = () => setAgents([...agents, { id: `agent-${Date.now()}`, title: 'New Agent Pattern', stack: [] }])
        const addSkill = () => setSkills([...skills, { id: `skill-${Date.now()}`, command: '/new-skill', title: 'New Skill', builtin: false }])

        // Item row components (inline)
        const ItemRow = ({ id, children, url, onRemove }: { id: string; children: React.ReactNode; url?: string; onRemove: () => void }) => (
          <div className={cn('rounded-xl border overflow-hidden transition-all',
            expanded === id ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="flex-1 min-w-0">{children}</div>
              <div className="flex items-center gap-1 shrink-0">
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="rounded p-1 text-white/20 hover:text-cyan-400/70 transition-colors">
                    <ExternalLink size={10} />
                  </a>
                )}
                <button onClick={() => setExpanded(expanded === id ? null : id)}
                  className={cn('rounded p-1 transition-colors', expanded === id ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                  <Pencil size={10} />
                </button>
                <button onClick={onRemove} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        )


        type Filterable = { subCat?: string; cat?: string; type?: string; builtin?: boolean }
        const subCatFilter = <T extends Filterable>(items: T[]) =>
          subFilter === 'all' ? items : items.filter(i =>
            i.subCat === subFilter || i.cat === subFilter || i.type === subFilter.toLowerCase() ||
            (subFilter === 'Built-in Skills' && i.builtin) || (subFilter === 'Custom Skills' && !i.builtin)
          )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subCatFilterAny = (items: any[]) => subCatFilter(items as Filterable[]) as typeof items

        return (
          <div className="space-y-3">
            {/* Category selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {RESOURCE_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => { setCatKey(cat.key); setSubFilter('all'); setExpanded(null) }}
                  className={cn('rounded-xl border px-3 py-2 text-left transition-all',
                    catKey === cat.key ? 'border-white/20 bg-white/[0.05]' : 'border-white/8 bg-white/[0.015] hover:border-white/15')}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white/75">{cat.label}</span>
                    <span className="font-mono text-[8px] rounded-full px-1.5 py-0.5 border"
                      style={{ color: cat.accent, borderColor: `${cat.accent}30`, background: `${cat.accent}15` }}>
                      {countMap[cat.key]}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[9px] text-white/30 truncate">{cat.description.slice(0, 52)}…</div>
                </button>
              ))}
            </div>

            {/* Active category */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: activeCat.accent }} />
                  <span className="text-[11px] font-medium text-white/75">{activeCat.label}</span>
                  <span className="font-mono text-[8px] text-white/30">{countMap[catKey]} items</span>
                </div>
                <a href={activeCat.path} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded border border-white/10 px-2 py-0.5 text-[9px] text-white/35 hover:text-white/65 hover:border-white/20 transition-all">
                  <ExternalLink size={8} /> Ver en web
                </a>
              </div>

              {/* Sub-category filter */}
              <div className="flex flex-wrap gap-1 border-b border-white/6 px-3 py-2">
                {['all', ...activeCat.subCategories].map(sc => (
                  <button key={sc} onClick={() => setSubFilter(sc)}
                    className={cn('rounded px-2 py-0.5 text-[9px] transition-all font-medium',
                      subFilter === sc ? 'bg-white/10 text-white/70' : 'text-white/25 hover:text-white/50')}>
                    {sc}
                  </button>
                ))}
              </div>

              {/* Item list */}
              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">

                {/* ── Tools ── */}
                {catKey === 'tools' && subCatFilter(tools).map((i) => {
                  const t = i as ResourceToolItem
                  const pc = PRICING_COL[t.pricing] ?? '#94a3b8'
                  return (
                    <div key={t.id} className="overflow-hidden">
                      <ItemRow id={t.id} url={t.url} onRemove={() => setTools(tools.filter(x => x.id !== t.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/75 truncate">{t.name}</span>
                          <span className="font-mono text-[8px] text-white/30">{t.subCat}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: pc, borderColor: `${pc}30`, background: `${pc}10` }}>{t.pricing}</span>
                        </div>
                        <div className="font-mono text-[9px] text-white/25 truncate mt-0.5">{t.url}</div>
                      </ItemRow>
                      {expanded === t.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Nombre"><input className={inp} value={t.name} onChange={e => updTool(t.id, { name: e.target.value })} /></F>
                            <F l="Sub-categoría">
                              <select className={cn(inp, 'cursor-pointer')} value={t.subCat}
                                onChange={e => updTool(t.id, { subCat: e.target.value })}>
                                {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </F>
                          </div>
                          <F l="URL"><input className={inp} value={t.url} onChange={e => updTool(t.id, { url: e.target.value })} /></F>
                          <F l="Pricing">
                            <select className={cn(inp, 'cursor-pointer')} value={t.pricing}
                              onChange={e => updTool(t.id, { pricing: e.target.value })}>
                              {['Free', 'OSS', 'Freemium', 'Paid'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Repos ── */}
                {catKey === 'repos' && subCatFilter(repos).map((i) => {
                  const r = i as ResourceRepoItem
                  const lc = LANG_COL[r.lang.toLowerCase()] ?? '#94a3b8'
                  return (
                    <div key={r.id} className="overflow-hidden">
                      <ItemRow id={r.id} url={r.url} onRemove={() => setRepos(repos.filter(x => x.id !== r.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-white/35">{r.org}/</span>
                          <span className="text-[11px] text-white/75">{r.name}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: lc, borderColor: `${lc}30`, background: `${lc}10` }}>{r.lang}</span>
                          <span className="font-mono text-[8px] text-white/30 shrink-0">★ {r.stars}</span>
                        </div>
                      </ItemRow>
                      {expanded === r.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Organización"><input className={inp} value={r.org} onChange={e => updRepo(r.id, { org: e.target.value })} /></F>
                            <F l="Nombre del repo"><input className={inp} value={r.name} onChange={e => updRepo(r.id, { name: e.target.value })} /></F>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Lenguaje"><input className={inp} value={r.lang} onChange={e => updRepo(r.id, { lang: e.target.value })} /></F>
                            <F l="Stars"><input className={inp} value={r.stars} placeholder="10k" onChange={e => updRepo(r.id, { stars: e.target.value })} /></F>
                          </div>
                          <F l="URL"><input className={inp} value={r.url} onChange={e => updRepo(r.id, { url: e.target.value })} /></F>
                          <F l="Categoría">
                            <select className={cn(inp, 'cursor-pointer')} value={r.cat}
                              onChange={e => updRepo(r.id, { cat: e.target.value })}>
                              {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Workflows ── */}
                {catKey === 'workflows' && subCatFilter(workflows).map((i) => {
                  const w = i as ResourceWorkItem
                  const tc = WORKFLOW_COL[w.type] ?? '#94a3b8'
                  const cc = COMPLEXITY_COL[w.complexity] ?? '#94a3b8'
                  return (
                    <div key={w.id} className="overflow-hidden">
                      <ItemRow id={w.id} onRemove={() => setWorkflows(workflows.filter(x => x.id !== w.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/70 truncate">{w.title}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: tc, borderColor: `${tc}30`, background: `${tc}10` }}>{w.type}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                            style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{w.complexity}</span>
                        </div>
                      </ItemRow>
                      {expanded === w.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={w.title} onChange={e => updWork(w.id, { title: e.target.value })} /></F>
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Tipo">
                              <select className={cn(inp, 'cursor-pointer')} value={w.type}
                                onChange={e => updWork(w.id, { type: e.target.value as ResourceWorkItem['type'] })}>
                                <option value="cicd">CI/CD</option><option value="n8n">n8n</option><option value="ai">AI</option>
                              </select>
                            </F>
                            <F l="Complejidad">
                              <select className={cn(inp, 'cursor-pointer')} value={w.complexity}
                                onChange={e => updWork(w.id, { complexity: e.target.value as ResourceWorkItem['complexity'] })}>
                                <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                              </select>
                            </F>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Prompts ── */}
                {catKey === 'prompts' && subCatFilter(prompts).map((i) => {
                  const p = i as ResourcePromptItem
                  return (
                    <div key={p.id} className="overflow-hidden">
                      <ItemRow id={p.id} onRemove={() => setPrompts(prompts.filter(x => x.id !== p.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-white/70 truncate">{p.title}</span>
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/25 bg-amber-400/10 text-amber-400/70 shrink-0">{p.cat}</span>
                          <span className="font-mono text-[8px] text-white/30 shrink-0">{p.models.length} models</span>
                        </div>
                      </ItemRow>
                      {expanded === p.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={p.title} onChange={e => updPr(p.id, { title: e.target.value })} /></F>
                          <F l="Categoría">
                            <select className={cn(inp, 'cursor-pointer')} value={p.cat}
                              onChange={e => updPr(p.id, { cat: e.target.value })}>
                              {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </F>
                          <F l="Modelos compatibles (coma)">
                            <input className={inp} value={p.models.join(', ')}
                              onChange={e => updPr(p.id, { models: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                          </F>
                          {p.models.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.models.map(m => (
                                <span key={m} className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/20 bg-amber-400/8 text-amber-400/60">{m}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── MCP ── */}
                {catKey === 'mcp' && subCatFilter(mcps).map((i) => {
                  const m = i as ResourceMcpItem
                  return (
                    <div key={m.id} className="overflow-hidden">
                      <ItemRow id={m.id} onRemove={() => setMcps(mcps.filter(x => x.id !== m.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-cyan-400/75">{m.name}</span>
                          <span className="font-mono text-[8px] text-white/30">{m.cat}</span>
                          <span className="font-mono text-[8px] text-white/25 shrink-0">{m.toolCount} tools</span>
                        </div>
                        <div className="font-mono text-[8px] text-white/20 truncate mt-0.5">{m.install}</div>
                      </ItemRow>
                      {expanded === m.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Nombre"><input className={inp} value={m.name} onChange={e => updMcp(m.id, { name: e.target.value })} /></F>
                            <F l="Categoría">
                              <select className={cn(inp, 'cursor-pointer')} value={m.cat}
                                onChange={e => updMcp(m.id, { cat: e.target.value })}>
                                {activeCat.subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </F>
                          </div>
                          <F l="Comando de instalación">
                            <div className="flex gap-2">
                              <input className={cn(inp, 'font-mono flex-1')} value={m.install} onChange={e => updMcp(m.id, { install: e.target.value })} />
                              <button onClick={() => copyInstall(m.install)}
                                className="rounded border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 font-mono text-[8px] text-cyan-400/70 hover:text-cyan-400 transition-all shrink-0">
                                {copiedInstall === m.install ? '✓' : 'copy'}
                              </button>
                            </div>
                          </F>
                          <F l="Número de tools">
                            <input type="number" className={inp} value={m.toolCount} min={0}
                              onChange={e => updMcp(m.id, { toolCount: parseInt(e.target.value) || 0 })} />
                          </F>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Agents ── */}
                {catKey === 'agents' && subCatFilterAny(agents).map((i) => {
                  const a = i as ResourceAgentItem
                  return (
                    <div key={a.id} className="overflow-hidden">
                      <ItemRow id={a.id} onRemove={() => setAgents(agents.filter(x => x.id !== a.id))}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-white/70">{a.title}</span>
                          {a.stack.slice(0, 2).map(s => (
                            <span key={s} className="font-mono text-[7px] rounded px-1 py-0.5 border border-pink-400/20 bg-pink-400/8 text-pink-400/60 truncate max-w-[80px]">{s}</span>
                          ))}
                          {a.stack.length > 2 && <span className="font-mono text-[7px] text-white/25">+{a.stack.length - 2}</span>}
                        </div>
                      </ItemRow>
                      {expanded === a.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <F l="Título"><input className={inp} value={a.title} onChange={e => updAgent(a.id, { title: e.target.value })} /></F>
                          <F l="Stack (coma)">
                            <input className={inp} value={a.stack.join(', ')}
                              onChange={e => updAgent(a.id, { stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                          </F>
                          {a.stack.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {a.stack.map(s => (
                                <span key={s} className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-pink-400/20 bg-pink-400/8 text-pink-400/60">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* ── Skills ── */}
                {catKey === 'skills' && subCatFilter(skills).map((i) => {
                  const s = i as ResourceSkillItem
                  return (
                    <div key={s.id} className="overflow-hidden">
                      <ItemRow id={s.id} onRemove={() => setSkills(skills.filter(x => x.id !== s.id))}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-orange-400/75">{s.command}</span>
                          <span className="text-[9px] text-white/40">{s.title}</span>
                          <span className={cn('font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0',
                            s.builtin ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/60' : 'border-white/10 text-white/30')}>
                            {s.builtin ? 'builtin' : 'custom'}
                          </span>
                        </div>
                      </ItemRow>
                      {expanded === s.id && (
                        <div className="border-t border-white/6 px-3 py-3 space-y-2 bg-white/[0.015]">
                          <div className="grid grid-cols-2 gap-2">
                            <F l="Comando"><input className={cn(inp, 'font-mono')} value={s.command} onChange={e => updSkill(s.id, { command: e.target.value })} /></F>
                            <F l="Título"><input className={inp} value={s.title} onChange={e => updSkill(s.id, { title: e.target.value })} /></F>
                          </div>
                          <Tog label="Builtin" on={s.builtin} toggle={() => updSkill(s.id, { builtin: !s.builtin })} />
                        </div>
                      )}
                    </div>
                  )
                })}

              </div>

              {/* Add button */}
              <div className="border-t border-white/6 px-3 py-2">
                <button onClick={catKey === 'tools' ? addTool : catKey === 'repos' ? addRepo : catKey === 'workflows' ? addWork : catKey === 'prompts' ? addPr : catKey === 'mcp' ? addMcp : catKey === 'agents' ? addAgent : addSkill}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-1.5 text-[10px] text-white/30 hover:text-white/60 hover:border-white/20 transition-all">
                  <Plus size={10} /> Añadir item
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── CMS Links ── */}
      {mainTab === 'links' && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LINK_CAT_COL).map(([cat, cc]) => (
              <span key={cat} className="font-mono text-[7px] rounded-full border px-2 py-0.5"
                style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{cat}</span>
            ))}
          </div>

          {links.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin links curados — añade herramientas, artículos, repos y referencias
            </div>
          )}

          {links.map(l => {
            const isExp = expanded === l.id
            const cc    = LINK_CAT_COL[l.category] ?? '#94a3b8'
            return (
              <div key={l.id} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{l.title}</span>
                      <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                        style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{l.category}</span>
                    </div>
                    <div className="text-[9px] text-white/30 truncate">{l.url}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updLink(l.id, { published: !l.published })}
                      className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                        l.published
                          ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                          : 'border-white/10 text-white/25 hover:border-white/20')}>
                      {l.published ? 'PUB' : 'DRAFT'}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : l.id)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remLink(l.id)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Título">
                        <input className={inp} value={l.title} onChange={e => updLink(l.id, { title: e.target.value })} />
                      </F>
                      <F l="Categoría">
                        <select className={cn(inp, 'cursor-pointer')} value={l.category}
                          onChange={e => updLink(l.id, { category: e.target.value as CuratedLink['category'] })}>
                          {Object.keys(LINK_CAT_COL).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </F>
                    </div>
                    <F l="URL">
                      <input className={inp} value={l.url} onChange={e => updLink(l.id, { url: e.target.value })} />
                    </F>
                    <F l="Descripción">
                      <textarea rows={2} className={area} value={l.description} onChange={e => updLink(l.id, { description: e.target.value })} />
                    </F>
                    <F l="Tags (coma)">
                      <input className={inp} value={l.tags.join(', ')}
                        onChange={e => updLink(l.id, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <div className="grid grid-cols-2 gap-2">
                      <Tog label="Publicado" on={l.published} toggle={() => updLink(l.id, { published: !l.published })} />
                      <Tog label="Destacado"  on={l.featured}  toggle={() => updLink(l.id, { featured: !l.featured })}  />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addLink}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir link curado
          </button>
        </div>
      )}

      {/* ── Drive ── */}
      {mainTab === 'drive' && (
        <div className="space-y-1.5">
          {drive.length === 0 ? (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25 space-y-1">
              <p>Sin recursos de Drive registrados.</p>
              <p className="text-[9px] text-white/15">Añade agent-md, skills, automatizaciones, MCP configs, prompts y datasets.</p>
            </div>
          ) : (
            drive.map(d => (
              <div key={d.id} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', d.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/65 truncate">{d.title}</div>
                  <div className="font-mono text-[8px] text-white/25">{d.resourceType}</div>
                </div>
                <a href={d.driveUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded p-1 text-white/20 hover:text-white/60 transition-colors">
                  <ExternalLink size={10} />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tracked Sources ── */}
      {mainTab === 'sources' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(SOURCE_TYPE_COL) as [TrackedSourceType, string][]).map(([type, col]) => (
              <span key={type} className="font-mono text-[7px] rounded-full border px-2 py-0.5"
                style={{ color: col, borderColor: `${col}30`, background: `${col}10` }}>{type}</span>
            ))}
          </div>

          {sources.length === 0 && (
            <div className="rounded-lg border border-white/6 px-3 py-5 text-center text-[10px] text-white/25">
              Sin fuentes registradas — añade newsletters, blogs, repos y canales de referencia
            </div>
          )}

          {sources.map(s => {
            const isExp = expanded === s.id
            const tc    = SOURCE_TYPE_COL[s.sourceType] ?? '#94a3b8'
            return (
              <div key={s.id} className={cn('rounded-xl border overflow-hidden transition-all',
                isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                <div className="flex items-center gap-2 px-3 py-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', s.active ? 'bg-emerald-400' : 'bg-white/20')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/75 truncate">{s.name}</span>
                      <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                        style={{ color: tc, borderColor: `${tc}30`, background: `${tc}10` }}>{s.sourceType}</span>
                    </div>
                    <div className="text-[9px] text-white/30 truncate">{s.url}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updSource(s.id, { active: !s.active })}
                      className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                        s.active
                          ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                          : 'border-white/10 text-white/25 hover:border-white/20')}>
                      {s.active ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : s.id)}
                      className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                      <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                    </button>
                    <button onClick={() => remSource(s.id)}
                      className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div className="border-t border-white/6 px-3 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <F l="Nombre">
                        <input className={inp} value={s.name} onChange={e => updSource(s.id, { name: e.target.value })} />
                      </F>
                      <F l="Tipo">
                        <select className={cn(inp, 'cursor-pointer')} value={s.sourceType}
                          onChange={e => updSource(s.id, { sourceType: e.target.value as TrackedSourceType })}>
                          {(Object.keys(SOURCE_TYPE_COL) as TrackedSourceType[]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </F>
                    </div>
                    <F l="URL">
                      <input className={inp} value={s.url} onChange={e => updSource(s.id, { url: e.target.value })} />
                    </F>
                    <F l="Descripción">
                      <textarea rows={2} className={area} value={s.description}
                        onChange={e => updSource(s.id, { description: e.target.value })} />
                    </F>
                    <Tog label="Activa" on={s.active} toggle={() => updSource(s.id, { active: !s.active })} />
                  </div>
                )}
              </div>
            )
          })}

          <button onClick={addSource}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
            <Plus size={11} /> Añadir fuente
          </button>
        </div>
      )}
    </div>
  )
}

// ─── About editor (full — CMS state + brand.ts profile reference) ─────────────

function AboutEditor() {
  const { state, dispatch } = useAdmin()
  const [sec, setSec] = useState<'cms' | 'expertise' | 'services' | 'philosophy' | 'social'>('cms')
  const a = state.aboutConfig
  const p = (d: Partial<typeof a>) => dispatch({ type: 'UPDATE_ABOUT', payload: d })

  const tabs = [
    { id: 'cms',       label: 'CMS'       },
    { id: 'expertise', label: 'Expertise' },
    { id: 'services',  label: 'Services'  },
    { id: 'philosophy',label: 'Filosofía' },
    { id: 'social',    label: 'Social'    },
  ] as const

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSec(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              sec === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CMS state ── */}
      {sec === 'cms' && (
        <div className="space-y-2.5">
          <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5 space-y-1.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">Perfil base — brand.ts (referencia)</p>
            <I18nRow label="role"  value={profile.role}            />
            <I18nRow label="email" value={profile.email}           />
            <I18nRow label="loc."  value={`${profile.location} / ${profile.timezone}`} />
          </div>
          <F l="Headline CMS">
            <input className={inp} value={a.headline} onChange={e => p({ headline: e.target.value })} />
          </F>
          <F l="Bio CMS">
            <textarea rows={4} className={area} value={a.bio} onChange={e => p({ bio: e.target.value })} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F l="Ubicación">
              <input className={inp} value={a.location} onChange={e => p({ location: e.target.value })} />
            </F>
            <F l="Disponibilidad">
              <select className={cn(inp, 'cursor-pointer')} value={a.availability}
                onChange={e => p({ availability: e.target.value as typeof a.availability })}>
                <option value="available">Disponible</option>
                <option value="limited">Limitado</option>
                <option value="unavailable">No disponible</option>
              </select>
            </F>
          </div>
          <F l="Skills (coma)">
            <input className={inp} value={a.skills.join(', ')}
              onChange={e => p({ skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          <F l="Tools (coma)">
            <input className={inp} value={(a.tools ?? []).join(', ')}
              onChange={e => p({ tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          <F l="Tipos colaboración (coma)">
            <input className={inp} value={(a.collaborationTypes ?? []).join(', ')}
              onChange={e => p({ collaborationTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
          </F>
          {(a.timeline ?? []).length > 0 && (
            <div className="space-y-1.5 border-t border-white/6 pt-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Timeline ({a.timeline.length} entradas)</p>
              {a.timeline.map(tl => (
                <div key={tl.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/6 bg-white/[0.015]">
                  <span className="font-mono text-[8px] text-white/30 shrink-0">{tl.year}</span>
                  <span className="flex-1 text-[10px] text-white/60 truncate">{tl.title}</span>
                  <span className="font-mono text-[7px] text-white/25 shrink-0">{tl.org}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Expertise (brand.ts, read-only reference) ── */}
      {sec === 'expertise' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.expertise</code> · Edita el archivo para cambiar.
          </div>
          {profile.expertise.map((ex, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] p-3 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-white/80">{ex.title}</span>
                <span className="font-mono text-[8px] text-white/20 shrink-0">#{i + 1}</span>
              </div>
              <p className="text-[10px] text-white/45 leading-relaxed">{ex.description}</p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {ex.tags.map(t => (
                  <span key={t} className="font-mono text-[7px] rounded-full border border-violet-400/20 bg-violet-400/8 px-2 py-0.5 text-violet-400/60">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Services (brand.ts, read-only reference) ── */}
      {sec === 'services' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.services</code> · Edita el archivo para cambiar.
          </div>
          {profile.services.map((sv, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-white/80">{sv.title}</span>
                <span className="font-mono text-[7px] rounded border border-white/10 px-1.5 py-0.5 text-white/30">{sv.engagement}</span>
              </div>
              <p className="text-[10px] text-white/45 leading-relaxed">{sv.description}</p>
              <div className="space-y-1">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">Entregables</p>
                {sv.deliverables.map((d, di) => (
                  <div key={di} className="flex items-start gap-1.5">
                    <span className="text-white/20 text-[8px] shrink-0 mt-0.5">▸</span>
                    <span className="text-[10px] text-white/45">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Philosophy (brand.ts, read-only reference) ── */}
      {sec === 'philosophy' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.philosophy</code> · Edita el archivo para cambiar.
          </div>
          {profile.philosophy.map((ph, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5 flex gap-3">
              <span className="font-mono text-[9px] text-white/20 shrink-0 mt-0.5">0{i + 1}</span>
              <p className="text-[11px] text-white/60 leading-relaxed italic">{ph}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Social links (brand.ts, read-only reference) ── */}
      {sec === 'social' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70">
            Definido en <code className="font-mono">brand.ts → profile.social</code> · Edita el archivo para cambiar.
          </div>
          {profile.social.map(s => (
            <div key={s.platform} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
              <span className="font-mono text-[10px] text-white/40 w-16 shrink-0">{s.platform}</span>
              <span className="flex-1 text-[11px] text-white/65">{s.label}</span>
              <a href={s.href} target="_blank" rel="noopener noreferrer"
                className="rounded p-1 text-white/20 hover:text-white/60 transition-colors">
                <ExternalLink size={10} />
              </a>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2.5">
            <span className="font-mono text-[10px] text-white/40 w-16 shrink-0">email</span>
            <span className="flex-1 text-[11px] text-white/65">{profile.email}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Contact editor ────────────────────────────────────────────────────────────

function ContactEditor() {
  const { state, dispatch } = useAdmin()
  const [tab,     setTab]     = useState<'info' | 'availability' | 'newsletter' | 'map'>('info')
  const [newType, setNewType] = useState('')

  const c  = state.content.contact  ?? { email: '', phone: '', address: '', mapEmbedUrl: '', showForm: true, showMap: false, whatsapp: '' } as ContactContent
  const nl = state.content.newsletter ?? { title: '', description: '', placeholder: '', successMessage: '', showNameField: true } as NewsletterContent
  const mp = state.content.map ?? { embedUrl: '', markerLabel: '', zoom: 14 } as MapContent
  const ab = state.aboutConfig

  const pc  = (d: Partial<ContactContent>)    => dispatch({ type: 'UPDATE_CONTACT_CONTENT',    payload: d })
  const pnl = (d: Partial<NewsletterContent>) => dispatch({ type: 'UPDATE_NEWSLETTER_CONTENT', payload: d })
  const pmp = (d: Partial<MapContent>)        => dispatch({ type: 'UPDATE_MAP_CONTENT',        payload: d })

  const collabTypes    = ab?.collaborationTypes ?? []
  const setCollabTypes = (types: string[]) => dispatch({ type: 'UPDATE_ABOUT', payload: { collaborationTypes: types } })

  const AVAIL_COL = { available: '#34d399', limited: '#fbbf24', unavailable: '#f87171' } as const

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {([
          { id: 'info',         label: 'Contacto'       },
          { id: 'availability', label: 'Disponibilidad' },
          { id: 'newsletter',   label: 'Newsletter'     },
          { id: 'map',          label: 'Mapa & Form'    },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              tab === t.id ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/30 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <F l="Email">
              <input type="email" className={inp} value={c.email} onChange={e => pc({ email: e.target.value })} />
            </F>
            <F l="Teléfono">
              <input className={inp} value={c.phone} placeholder="+34 600 000 000" onChange={e => pc({ phone: e.target.value })} />
            </F>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F l="WhatsApp">
              <input className={inp} value={c.whatsapp} placeholder="+34600000000" onChange={e => pc({ whatsapp: e.target.value })} />
            </F>
            <F l="Dirección">
              <input className={inp} value={c.address} onChange={e => pc({ address: e.target.value })} />
            </F>
          </div>
        </div>
      )}

      {tab === 'availability' && (
        <div className="space-y-3">
          <F l="Estado de disponibilidad">
            <div className="flex gap-2 mt-1">
              {(['available', 'limited', 'unavailable'] as const).map(s => {
                const col     = AVAIL_COL[s]
                const isActive = ab?.availability === s
                return (
                  <button key={s} onClick={() => dispatch({ type: 'UPDATE_ABOUT', payload: { availability: s } })}
                    className={cn('flex-1 rounded-lg border py-1.5 font-mono text-[9px] capitalize transition-all',
                      isActive ? 'border-current' : 'border-white/10 text-white/30 hover:text-white/55')}
                    style={isActive ? { color: col, borderColor: `${col}40`, background: `${col}10` } : {}}>
                    {s}
                  </button>
                )
              })}
            </div>
          </F>

          <div className="border-t border-white/6 pt-2 space-y-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Tipos de colaboración ({collabTypes.length})</p>
            </div>
            {collabTypes.map((type, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={cn(inp, 'flex-1')} value={type}
                  onChange={e => setCollabTypes(collabTypes.map((ct, j) => j === i ? e.target.value : ct))} />
                <button onClick={() => setCollabTypes(collabTypes.filter((_, j) => j !== i))}
                  className="rounded p-1.5 text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input className={cn(inp, 'flex-1')} value={newType} placeholder="ej. Consulting, Freelance…"
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newType.trim()) { setCollabTypes([...collabTypes, newType.trim()]); setNewType('') } }} />
              <button onClick={() => { if (newType.trim()) { setCollabTypes([...collabTypes, newType.trim()]); setNewType('') } }}
                className="flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-1.5 text-[10px] text-cyan-400/70 hover:border-cyan-400/35 transition-all">
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="space-y-2">
          <F l="Título">
            <input className={inp} value={nl.title} onChange={e => pnl({ title: e.target.value })} />
          </F>
          <F l="Descripción">
            <textarea rows={2} className={area} value={nl.description} onChange={e => pnl({ description: e.target.value })} />
          </F>
          <F l="Placeholder">
            <input className={inp} value={nl.placeholder} onChange={e => pnl({ placeholder: e.target.value })} />
          </F>
          <F l="Mensaje de éxito">
            <input className={inp} value={nl.successMessage} onChange={e => pnl({ successMessage: e.target.value })} />
          </F>
          <Tog label="Mostrar campo nombre" on={nl.showNameField} toggle={() => pnl({ showNameField: !nl.showNameField })} />
        </div>
      )}

      {tab === 'map' && (
        <div className="space-y-2.5">
          <Tog label="Mostrar formulario de contacto" on={c.showForm} toggle={() => pc({ showForm: !c.showForm })} />
          <Tog label="Mostrar mapa"                   on={c.showMap}  toggle={() => pc({ showMap: !c.showMap })}   />
          {c.showMap && (
            <div className="border-t border-white/6 pt-2 space-y-2">
              <F l="URL embed del mapa">
                <input className={inp} value={mp.embedUrl} onChange={e => pmp({ embedUrl: e.target.value })} />
              </F>
              <div className="grid grid-cols-2 gap-2">
                <F l="Etiqueta marcador">
                  <input className={inp} value={mp.markerLabel} onChange={e => pmp({ markerLabel: e.target.value })} />
                </F>
                <F l="Zoom (1-20)">
                  <input type="number" className={inp} min={1} max={20} value={mp.zoom}
                    onChange={e => pmp({ zoom: parseInt(e.target.value) || 14 })} />
                </F>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── GitHub editor — aligned with /en/github/ page ────────────────────────────

const LANG_COL: Record<string, string> = {
  typescript: '#3178c6', javascript: '#f7df1e', python: '#3572A5',
  rust: '#dea584', go: '#00ADD8', css: '#563d7c', html: '#e34c26',
  mdx: '#fcb32c', shell: '#89e051',
}

function GitHubEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newRepo, setNewRepo]   = useState('')
  const [ghTab, setGhTab]       = useState<'config' | 'repos' | 'sections'>('sections')
  const c = state.githubConfig
  const p = (d: Partial<typeof c>) => dispatch({ type: 'UPDATE_GITHUB_CONFIG', payload: d })

  const setRepoMeta = (repo: string, meta: Partial<GithubRepoMeta>) =>
    dispatch({ type: 'SET_REPO_META', payload: { repo, meta } })

  const addRepo = () => {
    const r = newRepo.trim()
    if (!r || c.displayRepos.includes(r)) return
    p({ displayRepos: [...c.displayRepos, r] })
    setNewRepo('')
  }
  const removeRepo = (repo: string) => {
    p({ displayRepos: c.displayRepos.filter(r => r !== repo) })
    if (expanded === repo) setExpanded(null)
  }

  const totalStars = c.displayRepos.reduce((s, r) => s + (c.repoMeta[r]?.stars ?? 0), 0)
  const pinned     = c.displayRepos.filter(r => c.repoMeta[r]?.pinned).length

  return (
    <div className="space-y-3">
      {/* Stats summary matching the page */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Repos',    v: c.displayRepos.length, c: '#f472b6' },
          { l: 'Stars',    v: totalStars,             c: '#f59e0b' },
          { l: 'Pinned',   v: pinned,                 c: '#a78bfa' },
          { l: 'Activity', v: c.activityLimit,        c: '#34d399' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1">
        {([
          { id: 'sections', label: 'Secciones' },
          { id: 'repos',    label: `Repos (${c.displayRepos.length})` },
          { id: 'config',   label: 'Config' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setGhTab(t.id)}
            className={cn('rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-all',
              ghTab === t.id ? 'border-pink-400/25 bg-pink-400/10 text-pink-400' : 'border-white/8 text-white/35 hover:text-white/60')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SECTIONS TAB — matches the actual page sections ── */}
      {ghTab === 'sections' && (
        <div className="space-y-2">
          <div className="rounded-lg border border-pink-400/10 bg-pink-400/5 px-3 py-2 text-[10px] text-pink-400/70">
            Controla qué secciones aparecen en <code className="font-mono">/en/github/</code>
          </div>

          {/* Page sections matching the actual layout */}
          {([
            { key: 'showStats',         label: 'Stats Row',           desc: 'Repos · Commits(30d) · Stars · Forks', section: 'stats'         },
            { key: 'showContributions', label: 'Heatmap',             desc: 'Contribution activity — Last 26 Weeks', section: 'heatmap'       },
            { key: 'showLanguages',     label: 'Language Breakdown',  desc: 'Distribución de lenguajes de repos',    section: 'langs'         },
            { key: 'showStarred',       label: '⭐ Starred / Curated', desc: 'Repos recomendados por ti (starred)',   section: 'starred'       },
            { key: 'showActivity',      label: 'Repo Cards',          desc: 'Tarjetas de repositorios del showcase', section: 'repos'         },
            { key: 'showTopics',        label: 'Topics',              desc: 'Tags de topics en cada repo',           section: 'topics'        },
            { key: 'showForks',         label: 'Forks count',         desc: 'Contador de forks visible',             section: 'forks'         },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.01] px-3 py-2">
              <div>
                <div className="text-[11px] font-medium text-white/70">{label}</div>
                <div className="text-[9px] text-white/30">{desc}</div>
              </div>
              <button onClick={() => p({ [key]: !(c[key] as boolean) })}
                className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-colors',
                  (c[key] as boolean) ? 'border-pink-400/40 bg-pink-400/20' : 'border-white/15 bg-white/5')}>
                <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all',
                  (c[key] as boolean) ? 'left-[18px] bg-pink-400' : 'left-0.5 bg-white/30')} />
              </button>
            </div>
          ))}

          {/* Display mode */}
          <div className="pt-1">
            <F l="Modo de vista (repo cards)">
              <select className={cn(inp, 'cursor-pointer')} value={c.displayMode}
                onChange={e => p({ displayMode: e.target.value as typeof c.displayMode })}>
                <option value="grid">Grid</option>
                <option value="list">List</option>
                <option value="compact">Compact</option>
              </select>
            </F>
          </div>
        </div>
      )}

      {/* ── REPOS TAB ── */}
      {ghTab === 'repos' && (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {c.displayRepos.map(repo => {
              const meta    = c.repoMeta[repo] as GithubRepoMeta | undefined
              const isExp   = expanded === repo
              const langCol = LANG_COL[(meta?.language ?? '').toLowerCase()] ?? '#94a3b8'
              return (
                <div key={repo} className={cn('rounded-xl border overflow-hidden transition-all',
                  isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-medium text-white/80 truncate">{repo}</span>
                        {meta?.pinned && (
                          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border border-amber-400/25 bg-amber-400/8 text-amber-400/70">pinned</span>
                        )}
                        {meta?.language && (
                          <span className="font-mono text-[7px] flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: langCol }} />
                            <span style={{ color: langCol }}>{meta.language}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        {meta?.stars !== undefined && <span className="font-mono text-[8px] text-white/25">★ {meta.stars}</span>}
                        {meta?.forks  !== undefined && <span className="font-mono text-[8px] text-white/25">⑂ {meta.forks}</span>}
                        {meta?.description && <span className="text-[8px] text-white/25 truncate">{meta.description}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpanded(isExp ? null : repo)}
                        className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                        <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                      </button>
                      <button onClick={() => removeRepo(repo)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                  {isExp && (
                    <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                      <F l="Descripción">
                        <input className={inp} value={meta?.description ?? ''}
                          onChange={e => setRepoMeta(repo, { description: e.target.value })} />
                      </F>
                      <div className="grid grid-cols-2 gap-2">
                        <F l="Lenguaje">
                          <input className={inp} value={meta?.language ?? ''} placeholder="TypeScript"
                            onChange={e => setRepoMeta(repo, { language: e.target.value })} />
                        </F>
                        <F l="Stars">
                          <input type="number" className={inp} value={meta?.stars ?? 0}
                            onChange={e => setRepoMeta(repo, { stars: parseInt(e.target.value) || 0 })} />
                        </F>
                      </div>
                      <F l="Topics (coma)">
                        <input className={inp} value={(meta?.topics ?? []).join(', ')}
                          onChange={e => setRepoMeta(repo, { topics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                      </F>
                      <Tog label="Pinned" on={meta?.pinned ?? false}
                        toggle={() => setRepoMeta(repo, { pinned: !(meta?.pinned ?? false) })} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input className={cn(inp, 'flex-1')} value={newRepo} placeholder="nombre-del-repo"
              onChange={e => setNewRepo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRepo()} />
            <button onClick={addRepo}
              className="flex items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-3 py-1.5 text-[10px] text-cyan-400/70 hover:border-cyan-400/35 hover:text-cyan-400 transition-all">
              <Plus size={10} /> Add
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIG TAB ── */}
      {ghTab === 'config' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <F l="Username GitHub">
              <input className={inp} value={c.username} onChange={e => p({ username: e.target.value })} />
            </F>
            <F l="Actividad máx.">
              <input type="number" className={inp} value={c.activityLimit}
                onChange={e => p({ activityLimit: parseInt(e.target.value) || 10 })} />
            </F>
          </div>

          {/* Stat Slot 4 picker */}
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">Stat Slot 4 — 4ª tarjeta de estadística</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'starred', label: '⭐ Repos Starred', desc: 'Repos que has marcado con estrella' },
                { value: 'forks',   label: '⑂  Total Forks',   desc: 'Forks totales de tus repos' },
              ] as { value: 'starred' | 'forks'; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => p({ statSlot4: opt.value })}
                  className={cn(
                    'flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-all',
                    c.statSlot4 === opt.value || (!c.statSlot4 && opt.value === 'starred')
                      ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/8 bg-white/[0.02] text-white/50 hover:border-white/15'
                  )}
                >
                  <span className="text-[11px] font-medium">{opt.label}</span>
                  <span className="font-mono text-[8px] text-white/35">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display mode */}
          <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">Modo de vista de repos</p>
            <div className="flex gap-2">
              {(['list', 'grid', 'compact'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => p({ displayMode: mode })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 font-mono text-[10px] capitalize transition-all',
                    c.displayMode === mode
                      ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/8 bg-white/[0.02] text-white/40 hover:border-white/15'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-[10px] text-cyan-400/70 leading-relaxed">
            Para Live Sync con la API de GitHub, importar repos starred y configurar el token PAT → usa el panel <strong>GitHub Panel</strong> (botón arriba).
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Playground editor ────────────────────────────────────────────────────────

const PLAYGROUND_FEATURES = [
  { id: '1', title: 'AI Sandbox',       desc: 'Claude API interactivo con system prompts customizables',         status: 'in-progress', eta: 'Q3 2026' },
  { id: '2', title: 'MCP Visualizer',   desc: 'Explorador de servidores MCP con herramientas disponibles',       status: 'planned',     eta: 'Q3 2026' },
  { id: '3', title: 'Agent Builder',    desc: 'Constructor visual de agentes con patrones ReAct/CoT',            status: 'planned',     eta: 'Q4 2026' },
  { id: '4', title: 'Prompt Lab',       desc: 'Editor de prompts con comparación multi-modelo en tiempo real',   status: 'planned',     eta: 'Q4 2026' },
  { id: '5', title: 'Graph Explorer',   desc: 'Visualizador interactivo de arquitecturas GraphRAG',              status: 'roadmap',     eta: '2027'    },
  { id: '6', title: 'Infra Dashboard',  desc: 'Vista en vivo del clúster — nodos, contenedores, logs',           status: 'roadmap',     eta: '2027'    },
]
const PG_STATUS_COL: Record<string, string> = {
  'in-progress': '#fbbf24', planned: '#60a5fa', roadmap: '#94a3b8', done: '#34d399',
}

function IntelligenceEditor() {
  const { state, dispatch } = useAdmin()
  const feeds: IntelligenceFeed[] = state.intelligence?.feeds ?? []
  const enabledFeeds  = feeds.filter(f => f.enabled)
  const publishable   = feeds.filter(f => f.publishable)

  const togglePublishable = (id: string, current: boolean) =>
    dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id, data: { publishable: !current } } })

  return (
    <div className="space-y-3">
      {/* Header info */}
      <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-3 py-2.5 space-y-0.5">
        <p className="text-[11px] text-cyan-400/80 font-medium">Intelligence Feed — /en/intelligence/</p>
        <p className="text-[9px] text-white/35 leading-relaxed">
          Agrega fuentes de datos en vivo. Marca feeds como "publicables" para que aparezcan en la página pública.
          Gestiona las fuentes completas en el panel <strong className="text-white/50">Intelligence Feeds</strong>.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total feeds', value: feeds.length, color: '#94a3b8' },
          { label: 'Enabled',     value: enabledFeeds.length, color: '#38bdf8' },
          { label: 'Publishable', value: publishable.length,  color: '#34d399' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-center">
            <p className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="font-mono text-[8px] uppercase tracking-wider text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Publishable toggle list */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Visible en página pública</p>
          <span className="h-px flex-1 bg-white/6" />
        </div>
        {enabledFeeds.length === 0 ? (
          <p className="text-[10px] text-white/25 py-2 text-center">No hay feeds habilitados aún.</p>
        ) : (
          enabledFeeds.map(feed => (
            <div key={feed.id} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
              <span className="text-base flex-shrink-0">{feed.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/70 truncate">{feed.name}</p>
                <p className="font-mono text-[8px] text-white/25 uppercase">{feed.category}</p>
              </div>
              <Tog
                label=""
                on={!!feed.publishable}
                toggle={() => togglePublishable(feed.id, !!feed.publishable)}
              />
            </div>
          ))
        )}
      </div>

      <p className="text-[9px] text-white/20 leading-relaxed pt-1">
        Para añadir, editar o configurar feeds ve al panel <span className="text-cyan-400/50">Intelligence Feeds</span>.
        Este editor solo controla visibilidad pública.
      </p>
    </div>
  )
}

function PlaygroundEditor() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <div>
          <span className="text-[11px] text-amber-400/80">Coming soon — roadmap activo</span>
          <span className="block font-mono text-[9px] text-amber-400/40">Lanzamiento estimado: Q3 2026</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Features planificadas</p>
          <span className="h-px flex-1 bg-white/6" />
          <div className="flex gap-1.5">
            {Object.entries(PG_STATUS_COL).map(([s, col]) => (
              <span key={s} className="font-mono text-[7px] rounded-full border px-1.5 py-0.5"
                style={{ color: col, borderColor: `${col}30`, background: `${col}10` }}>{s}</span>
            ))}
          </div>
        </div>
        {PLAYGROUND_FEATURES.map(f => {
          const sc = PG_STATUS_COL[f.status] ?? '#94a3b8'
          return (
            <div key={f.id} className="rounded-xl border border-white/8 bg-white/[0.015] px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: sc }} />
                    <span className="text-[11px] font-medium text-white/70">{f.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{f.status}</span>
                  </div>
                  <div className="mt-0.5 pl-3 text-[9px] text-white/30 truncate">{f.desc}</div>
                </div>
                <span className="font-mono text-[8px] text-white/25 shrink-0">{f.eta}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5 text-[9px] text-white/30 leading-relaxed">
        Para modificar el roadmap edita <code className="font-mono text-cyan-400/60">PLAYGROUND_FEATURES</code> en <code className="font-mono text-cyan-400/60">ContentPanel.tsx</code>.
        Cuando el Playground esté activo, mover la config a <code className="font-mono text-cyan-400/60">src/lib/admin/types.ts</code>.
      </div>
    </div>
  )
}

// ─── CMS block editors ────────────────────────────────────────────────────────

function LogosEditor() {
  const { state, dispatch } = useAdmin()
  const logos = state.content.logos ?? []
  const set = (p: LogoItem[]) => dispatch({ type: 'SET_LOGOS', payload: p })
  return (
    <div className="space-y-2">
      {logos.map((l, i) => (
        <div key={l.id} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(logos.filter(x => x.id !== l.id))}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <F l="Nombre"><input className={inp} value={l.name} onChange={e => set(logos.map(x => x.id === l.id ? { ...x, name: e.target.value } : x))} /></F>
            <F l="URL"><input className={inp} value={l.url} onChange={e => set(logos.map(x => x.id === l.id ? { ...x, url: e.target.value } : x))} /></F>
          </div>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...logos, { id: crypto.randomUUID(), name: 'Empresa', imageUrl: '', url: 'https://' }])}>
        + Añadir logo
      </button>
    </div>
  )
}

function StatsEditor() {
  const { state, dispatch } = useAdmin()
  const stats = state.content.stats
  const set = (p: StatItem[]) => dispatch({ type: 'SET_STATS', payload: p })
  return (
    <div className="space-y-2">
      {stats.map((s, i) => (
        <div key={i} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(stats.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <F l="Valor"><input className={inp} value={s.value} onChange={e => set(stats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} /></F>
            <F l="Icono"><input className={inp} value={s.icon} onChange={e => set(stats.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} /></F>
            <F l="Etiqueta"><input className={inp} value={s.label} onChange={e => set(stats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} /></F>
          </div>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...stats, { value: '0', label: 'Métrica', icon: '📌' }])}>
        + Añadir estadística
      </button>
    </div>
  )
}

function ServicesEditor() {
  const { state, dispatch } = useAdmin()
  const sv = state.content.services
  const set = (p: ServiceItem[]) => dispatch({ type: 'SET_SERVICES', payload: p })
  return (
    <div className="space-y-2">
      {sv.map((s, i) => (
        <div key={i} className="rounded-lg border border-white/8 bg-white/2 p-2.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-white/25">#{i + 1}</span>
            <button className="text-[9px] text-red-400/40 hover:text-red-400" onClick={() => set(sv.filter((_, j) => j !== i))}>✕</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <F l="Icono"><input className={inp} value={s.icon} onChange={e => set(sv.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} /></F>
            <F l="Título"><input className={inp} value={s.title} onChange={e => set(sv.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} /></F>
          </div>
          <F l="Descripción"><textarea rows={2} className={area} value={s.description} onChange={e => set(sv.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} /></F>
        </div>
      ))}
      <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-400/15 py-1.5 text-[9px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all"
        onClick={() => set([...sv, { icon: '🔧', title: 'Servicio', description: '' }])}>
        + Añadir servicio
      </button>
    </div>
  )
}

const CMS_EDITORS: Record<string, React.ComponentType> = {
  logos: LogosEditor, stats: StatsEditor, services: ServicesEditor,
}

// ─── Section / domain page map ────────────────────────────────────────────────

interface SectionDef {
  id: string; anchor: string; label: string; desc: string
  icon: React.ReactNode; accent: string; path: string
  editor: React.ComponentType
  relatedPanel?: AdminPanel; relatedLabel?: string
  badge?: string
}

const HOME_SECTIONS: SectionDef[] = [
  { id: 'hero',           anchor: 'hero',           label: 'Hero',              desc: 'Portada — titular, subtítulo, CTAs y badge',              path: '/en/',                icon: <Layers size={12} />,        accent: '#49b7ff', editor: HeroEditor,     badge: 'LIVE' },
  { id: 'systems',        anchor: 'systems',        label: 'Systems',           desc: 'Preview de arquitecturas AI activas',                      path: '/en/#systems',        icon: <Cpu size={12} />,           accent: '#a78bfa', editor: SystemsEditor,  badge: 'LIVE', relatedPanel: 'systems',        relatedLabel: 'Systems Manager' },
  { id: 'labs',           anchor: 'labs',           label: 'Labs',              desc: 'Preview de productos de laboratorio',                      path: '/en/#labs',           icon: <FlaskConical size={12} />,  accent: '#34d399', editor: LabsEditor,     badge: 'LIVE', relatedPanel: 'labs',           relatedLabel: 'Labs Manager' },
  { id: 'infrastructure', anchor: 'infrastructure', label: 'Infrastructure',    desc: 'Preview del centro de operaciones',                        path: '/en/#infrastructure', icon: <Server size={12} />,        accent: '#38bdf8', editor: InfraEditor,    badge: 'LIVE', relatedPanel: 'infrastructure', relatedLabel: 'Infrastructure' },
  { id: 'journal',        anchor: 'journal',        label: 'Journal Preview',   desc: 'Preview del diario técnico — artículo destacado',          path: '/en/#journal',        icon: <BookOpen size={12} />,      accent: '#fbbf24', editor: JournalSummary, badge: 'LIVE', relatedPanel: 'research',       relatedLabel: 'Research Manager' },
  { id: 'collab',         anchor: 'collaborate',    label: 'Collaboration CTA', desc: 'Sección de llamada a colaborar',                           path: '/en/#collaborate',    icon: <MessageSquare size={12} />, accent: '#fb923c', editor: CollabEditor,   badge: 'LIVE' },
]

const DOMAIN_PAGES: SectionDef[] = [
  { id: 'projects',    anchor: 'projects',   label: 'Projects',   desc: 'Portfolio y casos de estudio — todos los proyectos',         path: '/en/projects/',   icon: <FolderKanban size={12} />, accent: '#60a5fa', editor: ProjectsEditor,  relatedPanel: 'projects',    relatedLabel: 'Projects Manager' },
  { id: 'research',    anchor: 'research',   label: 'Research',   desc: 'Artículos, ensayos y noticias técnicas',                     path: '/en/research/',   icon: <Microscope size={12} />,   accent: '#a78bfa', editor: ResearchEditor,  relatedPanel: 'research',    relatedLabel: 'Research Manager' },
  { id: 'journal-page',anchor: 'journal-p', label: 'Journal',    desc: 'Publicación técnica — todos los artículos',                  path: '/en/journal/',    icon: <BookOpen size={12} />,     accent: '#fbbf24', editor: JournalPageEditor, relatedPanel: 'research',    relatedLabel: 'Research Manager' },
  { id: 'resources',   anchor: 'resources',  label: 'Resources',  desc: 'Herramientas, agentes, automatizaciones, prompts',           path: '/en/resources/',  icon: <Library size={12} />,      accent: '#34d399', editor: ResourcesEditor },
  { id: 'about',       anchor: 'about',      label: 'About',      desc: 'Perfil, skills, timeline y filosofía',                       path: '/en/about/',      icon: <User size={12} />,         accent: '#94a3b8', editor: AboutEditor,     relatedPanel: 'about',       relatedLabel: 'About Panel' },
  { id: 'contact',     anchor: 'contact',    label: 'Contact',    desc: 'Formulario de contacto y datos de colaboración',             path: '/en/contact/',    icon: <MessageSquare size={12} />,accent: '#fb923c', editor: ContactEditor },
  { id: 'github',      anchor: 'github',     label: 'GitHub',     desc: 'Repositorios, contribuciones y actividad',                   path: '/en/github/',     icon: <GitBranch size={12} />,    accent: '#f472b6', editor: GitHubEditor,    relatedPanel: 'github',      relatedLabel: 'GitHub Panel' },
  { id: 'playground',    anchor: 'playground',  label: 'Playground',       desc: 'Sandbox interactivo — coming soon',                          path: '/en/playground/',    icon: <Gamepad2 size={12} />,    accent: '#94a3b8', editor: PlaygroundEditor,    badge: 'SOON' },
  { id: 'intelligence',  anchor: 'intelligence', label: 'Intelligence Feed', desc: 'Fuentes de inteligencia y feeds en vivo',                     path: '/en/intelligence/',  icon: <Globe size={12} />,       accent: '#facc15', editor: IntelligenceEditor,  relatedPanel: 'intelligence', relatedLabel: 'Intelligence Feeds' },
]

// ─── Visual effects ────────────────────────────────────────────────────────────

type FxKey = 'aurora' | 'meteors' | 'smoothScroll' | 'customCursor' | 'borderBeam' | 'spotlight' | 'noiseOverlay' | 'scanlines' | 'parallax' | 'glitchText'
type FxObj = { enabled: boolean; intensity?: number; count?: number; duration?: number; speed?: number; radius?: number }

const EFFECTS: { key: FxKey; label: string; desc: string; accent: string }[] = [
  { key: 'aurora',       label: 'Aurora',       desc: 'Gradiente ambiental animado en el fondo',  accent: '#a78bfa' },
  { key: 'meteors',      label: 'Meteoros',      desc: 'Lluvia de partículas estilo meteoros',     accent: '#fb923c' },
  { key: 'smoothScroll', label: 'Smooth Scroll', desc: 'Lenis — scroll suave con inercia',         accent: '#49b7ff' },
  { key: 'customCursor', label: 'Custom Cursor', desc: 'Cursor personalizado con halo',            accent: '#f472b6' },
  { key: 'borderBeam',   label: 'Border Beam',   desc: 'Haz animado en bordes de tarjetas',        accent: '#34d399' },
  { key: 'spotlight',    label: 'Spotlight',     desc: 'Luz ambiental siguiendo el cursor',        accent: '#fbbf24' },
  { key: 'noiseOverlay', label: 'Noise Overlay', desc: 'Textura de ruido sobre el fondo',          accent: '#94a3b8' },
  { key: 'scanlines',    label: 'Scanlines',     desc: 'Líneas de escaneo estilo CRT',             accent: '#38bdf8' },
  { key: 'parallax',     label: 'Parallax',      desc: 'Efecto parallax en scroll',                accent: '#60a5fa' },
  { key: 'glitchText',   label: 'Glitch Text',   desc: 'Efecto glitch en títulos',                 accent: '#f87171' },
]

// ─── Live preview ──────────────────────────────────────────────────────────────

type DeviceSize = 'desktop' | 'tablet' | 'mobile'
const DEVICE_W: Record<DeviceSize, string> = { desktop: '100%', tablet: '768px', mobile: '390px' }

function LivePreview({ path }: { path: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded]  = useState(false)
  const [device, setDevice]  = useState<DeviceSize>('desktop')
  const [fullscreen, setFs]  = useState(false)

  const reload = useCallback(() => {
    if (!iframeRef.current) return
    setLoaded(false)
    iframeRef.current.src = path
  }, [path])

  return (
    <div className={cn('flex flex-col rounded-xl border border-white/10 overflow-hidden mt-4',
      fullscreen && 'fixed inset-3 z-[300] border-cyan-400/20 bg-[#05060a]')}>
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/3 px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/20 p-0.5">
          {(['desktop', 'tablet', 'mobile'] as DeviceSize[]).map(d => (
            <button key={d} onClick={() => setDevice(d)}
              className={cn('flex items-center px-1.5 py-0.5 rounded-md transition-all text-[9px]',
                device === d ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/60')}>
              {d === 'desktop' ? <Monitor size={11} /> : d === 'tablet' ? <Tablet size={11} /> : <Smartphone size={11} />}
            </button>
          ))}
        </div>
        <span className="flex-1 font-mono text-[9px] text-white/25 truncate">{path}</span>
        <button onClick={reload} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><RefreshCw size={10} /></button>
        <button onClick={() => window.open(path, '_blank', 'noopener')} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><ExternalLink size={10} /></button>
        <button onClick={() => setFs(v => !v)} className="rounded p-1 text-white/30 hover:text-white/70 transition-colors"><Maximize2 size={10} /></button>
        {fullscreen && <button onClick={() => setFs(false)} className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] text-white/40 hover:text-white/70">✕</button>}
      </div>
      <div className={cn('relative flex items-center justify-center bg-black/60', fullscreen ? 'flex-1' : 'h-[480px]')}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 z-10">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
            <span className="text-[10px] text-white/30">Cargando…</span>
          </div>
        )}
        <div className={cn('h-full overflow-hidden transition-all', device !== 'desktop' && 'rounded-xl border border-white/10 shadow-2xl')}
          style={{ width: DEVICE_W[device] }}>
          <iframe ref={iframeRef} src={path} title={`Preview ${path}`}
            className={cn('h-full w-full border-0 transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
            style={{ colorScheme: 'dark' }} onLoad={() => setLoaded(true)} sandbox="allow-scripts allow-same-origin" />
        </div>
      </div>
    </div>
  )
}

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ sec, active, onClick }: { sec: SectionDef; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all',
        active ? 'border-white/25 shadow-sm' : 'border-white/8 hover:border-white/15')}
      style={active ? { borderColor: `${sec.accent}40`, background: `${sec.accent}08` } : {}}>
      <div className="flex items-start justify-between">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: `${sec.accent}18`, color: sec.accent }}>{sec.icon}</div>
        {sec.badge && (
          <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border"
            style={sec.badge === 'LIVE'
              ? { color: '#34d399', borderColor: '#34d39930', background: '#34d39910' }
              : { color: '#fbbf24', borderColor: '#fbbf2430', background: '#fbbf2410' }}>
            {sec.badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-[11px] font-medium text-white/80">{sec.label}</div>
        <div className="text-[9px] leading-relaxed text-white/30 line-clamp-2">{sec.desc}</div>
      </div>
    </button>
  )
}

// ─── Block row ─────────────────────────────────────────────────────────────────

function BlockRow({ block, expanded, onToggle, onToggleEnabled }: {
  block: BlockSection; expanded: boolean; onToggle: () => void; onToggleEnabled: () => void
}) {
  const Editor = CMS_EDITORS[block.type ?? block.id]
  return (
    <div className={cn('rounded-xl border overflow-hidden transition-all',
      expanded ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="text-base shrink-0">{block.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-white/75">{block.label}</span>
            {!block.enabled && <span className="font-mono text-[7px] text-white/20 border border-white/8 rounded px-1">off</span>}
            {block.effects3D && <span className="font-mono text-[7px] text-violet-400/50 border border-violet-400/10 rounded px-1">3D</span>}
          </div>
          <div className="text-[9px] text-white/30 truncate">{block.description}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onToggleEnabled}
            className={cn('rounded-lg border px-1.5 py-0.5 font-mono text-[8px] transition-all',
              block.enabled
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-400/70 hover:border-emerald-400/40'
                : 'border-white/10 bg-white/4 text-white/30 hover:border-white/20')}>
            {block.enabled ? 'ON' : 'OFF'}
          </button>
          {Editor && (
            <button onClick={onToggle}
              className={cn('rounded p-1 transition-colors', expanded ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
              <ChevronDown size={11} className={cn('transition-transform', expanded && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
      {expanded && Editor && <div className="border-t border-white/6 px-3 py-3"><Editor /></div>}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────────

type TabId = 'sections' | 'effects' | 'preview'

const QUICK_NAV: { panel: AdminPanel; label: string }[] = [
  { panel: 'design-studio', label: 'Design Studio' },
  { panel: 'blocks',        label: 'Bloques'        },
  { panel: 'personality',   label: 'Efectos web'    },
  { panel: 'navbar-config', label: 'Navbar'         },
  { panel: 'seo',           label: 'SEO & Meta'     },
  { panel: 'footer-config', label: 'Footer'         },
]

export default function ContentPanel() {
  const { state, dispatch } = useAdmin()
  const [tab, setTab]             = useState<TabId>('sections')
  const [activeId, setActiveId]   = useState('hero')
  const [showPreview, setPreview] = useState(false)
  const [expandedBlock, setBlock] = useState<string | null>(null)
  const [homeCollapsed,  setHomeCollapsed]   = useState(false)
  const [domainCollapsed, setDomainCollapsed] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const go = (panel: AdminPanel) => dispatch({ type: 'SET_PANEL', payload: panel })

  const allSections = [...HOME_SECTIONS, ...DOMAIN_PAGES]
  const current     = allSections.find(s => s.id === activeId) ?? HOME_SECTIONS[0]
  const Editor      = current.editor

  const selectSection = (id: string) => {
    setActiveId(id)
    // Scroll editor into view after React re-render
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const sortedBlocks = [...state.blocks].sort((a, b) => a.order - b.order)
  const toggleBlock  = (id: string) =>
    dispatch({ type: 'UPDATE_BLOCK', payload: { id, data: { enabled: !state.blocks.find(b => b.id === id)?.enabled } } })

  const patchFx = (key: FxKey, data: Partial<FxObj>) => {
    const cur = state.visualEffects[key] as FxObj
    dispatch({ type: 'UPDATE_VISUAL_EFFECTS', payload: { [key]: { ...cur, ...data } } })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/70">Site Builder</p>
          <h2 className="text-xl font-semibold text-white">Site Content</h2>
          <p className="text-[12px] text-white/40">
            Todo el contenido de tu web — {HOME_SECTIONS.length} secciones en portada · {DOMAIN_PAGES.length} páginas de dominio.
          </p>
        </div>
        <a href="/en" target="_blank" rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
          <Globe size={10} /> Ver sitio
        </a>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_NAV.map(n => (
          <button key={n.panel} onClick={() => go(n.panel)}
            className="rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] text-white/50 hover:border-white/20 hover:bg-white/6 hover:text-white/80 transition-all">
            {n.label}
          </button>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 rounded-xl border border-white/10 bg-white/3 p-1">
        {([
          { id: 'sections', label: 'Secciones', icon: <LayoutGrid size={12} /> },
          { id: 'effects',  label: 'Efectos',   icon: <Sparkles size={12} />   },
          { id: 'preview',  label: 'Preview',   icon: <Eye size={12} />        },
        ] as { id: TabId; label: string; icon: React.ReactNode }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition-all',
              tab === t.id ? 'bg-white/10 text-white/90' : 'text-white/40 hover:text-white/70')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SECCIONES ──────────────────────────────────────────────── */}
      {tab === 'sections' && (
        <div className="space-y-4">
          {/* Homepage — collapsible */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setHomeCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', homeCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Página principal&nbsp;&nbsp;/en/
              </span>
              <span className="font-mono text-[8px] text-white/20">{HOME_SECTIONS.length} secciones</span>
              <a href="/en" target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/60 transition-colors ml-1">
                <ExternalLink size={9} />
              </a>
            </button>
            {!homeCollapsed && (
              <div className="border-t border-white/6 p-2.5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {HOME_SECTIONS.map(s => (
                    <SectionCard key={s.id} sec={s} active={activeId === s.id} onClick={() => selectSection(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Domain pages — collapsible */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setDomainCollapsed(v => !v)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', domainCollapsed && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40 flex-1 text-left">
                Páginas de dominio
              </span>
              <span className="font-mono text-[8px] text-white/20">{DOMAIN_PAGES.length} páginas</span>
            </button>
            {!domainCollapsed && (
              <div className="border-t border-white/6 p-2.5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {DOMAIN_PAGES.map(s => (
                    <SectionCard key={s.id} sec={s} active={activeId === s.id} onClick={() => selectSection(s.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active editor */}
          <div ref={editorRef} className="rounded-xl border p-4 space-y-4"
            style={{ borderColor: `${current.accent}25`, background: `${current.accent}04` }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `${current.accent}20`, color: current.accent }}>{current.icon}</div>
                <div>
                  <div className="text-[13px] font-semibold text-white/90">{current.label}</div>
                  <div className="text-[10px] text-white/35">{current.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {current.path && (
                  <a href={current.path} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                    <ExternalLink size={10} /> Ver página
                  </a>
                )}
                {current.relatedPanel && (
                  <button onClick={() => go(current.relatedPanel!)}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/80 transition-all">
                    <Pencil size={10} />{current.relatedLabel}
                  </button>
                )}
                <button onClick={() => setPreview(v => !v)}
                  className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                    showPreview
                      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400'
                      : 'border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80')}>
                  {showPreview ? <EyeOff size={10} /> : <Eye size={10} />}
                  {showPreview ? 'Ocultar' : 'Preview'}
                </button>
              </div>
            </div>
            <Editor />
            {showPreview && <LivePreview path={current.path} />}
          </div>

          {/* CMS blocks */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <button
              onClick={() => setBlock(expandedBlock ? null : 'open')}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
            >
              <ChevronDown size={11} className={cn('text-white/30 transition-transform shrink-0', !expandedBlock && '-rotate-90')} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30 flex-1 text-left">
                Bloques CMS heredados
              </span>
              <button onClick={(e) => { e.stopPropagation(); go('blocks') }}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/60 transition-colors">
                Gestor <ChevronRight size={10} />
              </button>
            </button>
            <div className="border-t border-white/6 divide-y divide-white/5">
              {sortedBlocks.map(block => (
                <BlockRow key={block.id} block={block} expanded={expandedBlock === block.id}
                  onToggle={() => setBlock(expandedBlock === block.id ? null : block.id)}
                  onToggleEnabled={() => toggleBlock(block.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: EFECTOS ──────────────────────────────────────────────── */}
      {tab === 'effects' && (
        <div className="space-y-3">
          <p className="text-[11px] text-white/35 leading-relaxed">
            Controla los efectos visuales del sitio. Para shaders avanzados usa{' '}
            <button className="text-violet-400 hover:underline" onClick={() => go('design-lab')}>Design Lab</button>.
          </p>
          {EFFECTS.map(fx => {
            const cfg = state.visualEffects[fx.key] as FxObj | undefined
            if (!cfg) return null
            return (
              <div key={fx.key}
                className={cn('rounded-xl border p-3.5 space-y-3 transition-all',
                  cfg.enabled ? 'border-white/12 bg-white/[0.025]' : 'border-white/6 bg-white/[0.01] opacity-70')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: cfg.enabled ? fx.accent : '#ffffff20' }} />
                    <div>
                      <div className="text-[12px] font-medium text-white/80">{fx.label}</div>
                      <div className="text-[10px] text-white/35">{fx.desc}</div>
                    </div>
                  </div>
                  <button onClick={() => patchFx(fx.key, { enabled: !cfg.enabled })}
                    className={cn('relative h-5 w-9 shrink-0 rounded-full border transition-all',
                      cfg.enabled ? 'border-cyan-400/40 bg-cyan-400/20' : 'border-white/15 bg-white/5')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
                      cfg.enabled ? 'left-[18px] bg-cyan-400' : 'left-0.5 bg-white/30')} />
                  </button>
                </div>
                {cfg.enabled && (cfg.intensity !== undefined || cfg.count !== undefined || cfg.duration !== undefined) && (
                  <div className="space-y-2 border-t border-white/6 pt-2">
                    {cfg.intensity !== undefined && <Slider label="Intensidad"    value={cfg.intensity} min={0}   max={1}  onChange={v => patchFx(fx.key, { intensity: v })} />}
                    {cfg.count     !== undefined && <Slider label="Cantidad"      value={cfg.count}     min={1}   max={40} step={1} onChange={v => patchFx(fx.key, { count: Math.round(v) })} />}
                    {cfg.duration  !== undefined && <Slider label="Duración (s)"  value={cfg.duration}  min={0.5} max={3}  step={0.1} onChange={v => patchFx(fx.key, { duration: Math.round(v * 10) / 10 })} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── TAB: PREVIEW ──────────────────────────────────────────────── */}
      {tab === 'preview' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <p className="w-full font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 mb-1">Portada</p>
            {HOME_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  activeId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={activeId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
            <p className="w-full font-mono text-[9px] uppercase tracking-[0.1em] text-white/30 mt-2 mb-1">Páginas</p>
            {DOMAIN_PAGES.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] transition-all',
                  activeId === s.id ? 'border-white/20 bg-white/8' : 'border-white/8 text-white/40 hover:border-white/15 hover:text-white/70')}
                style={activeId === s.id ? { borderColor: `${s.accent}35`, color: s.accent, background: `${s.accent}10` } : {}}>
                <span style={{ color: s.accent }}>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
          <LivePreview path={allSections.find(s => s.id === activeId)?.path ?? '/en/'} />
        </div>
      )}
    </div>
  )
}
