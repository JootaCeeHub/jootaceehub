'use client'

import { useState } from 'react'
import { Eye, EyeOff, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import type {
  SystemEntry, LabEntry, InfraNode, DeployEntry, DeployStatus, NodeStatus,
} from '@/lib/admin/types'
import {
  inp, area, F, Tog, I18nRow,
  STATUS_COL_SYS, STATUS_COL_LAB, STATUS_COL_NODE,
} from './primitives'

// ─── Hero editor ───────────────────────────────────────────────────────────────

export function HeroEditor() {
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

export function SystemsEditor() {
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

export function LabsEditor() {
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

export function InfraEditor() {
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

export function JournalSummary() {
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

export function CollabEditor() {
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
