'use client'

import { useState } from 'react'
import {
  Plus, Trash2, Check, Cpu, Zap, Bot,
  ExternalLink, ChevronDown, ChevronUp, Send, Download,
  Package, Layers, Wrench,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { MCPServer, CapabilitySkill, MCPTransport, PlatformId, ResourceMcpItem } from '@/lib/admin/types'
import type { Tab as IntTab } from './integrations/constants'
import { PlatformsTab } from './integrations/PlatformsTab'
import { SourcesTab }   from './integrations/SourcesTab'
import { GitHubTab }    from './integrations/GitHubTab'
import { FilesTab }     from './integrations/FilesTab'
import { LinksTab }     from './integrations/LinksTab'
import { HermesTab }    from './capabilities/HermesTab'
import { DeployTab }    from './integrations/DeployTab'

// ─── Tab union ────────────────────────────────────────────────────────────────

type Tab = IntTab | 'agentes' | 'hermes' | 'mcp' | 'skills' | 'bots'

const ALL_TABS: { id: Tab; label: string; group: 'sources' | 'agents' }[] = [
  // ── Data sources (original Integrations) ──────────────────────────────────
  { id: 'platforms', label: 'Platforms',  group: 'sources' },
  { id: 'sources',   label: 'Sources',    group: 'sources' },
  { id: 'github',    label: 'GitHub',     group: 'sources' },
  { id: 'files',     label: 'Files',      group: 'sources' },
  { id: 'links',     label: 'Links & DBs', group: 'sources' },
  { id: 'deploy',    label: 'Deploy',     group: 'sources' },
  // ── AI capabilities (absorbed from Capabilities) ──────────────────────────
  { id: 'agentes',   label: 'Agentes',    group: 'agents' },
  { id: 'hermes',    label: 'Hermes ☤',  group: 'agents' },
  { id: 'mcp',       label: 'MCP',        group: 'agents' },
  { id: 'skills',    label: 'Skills',     group: 'agents' },
  { id: 'bots',      label: 'Bots',       group: 'agents' },
]

// ─── Capabilities constants ──────────────────────────────────────────────────

const PLATFORM_META_CAP: Record<PlatformId, { label: string; emoji: string; color: string }> = {
  telegram:  { label: 'Telegram',  emoji: '✈',  color: '#229ED9' },
  discord:   { label: 'Discord',   emoji: '◉',  color: '#5865F2' },
  slack:     { label: 'Slack',     emoji: '#',  color: '#4A154B' },
  whatsapp:  { label: 'WhatsApp',  emoji: '◎',  color: '#25D366' },
  signal:    { label: 'Signal',    emoji: '⊕',  color: '#3A76F0' },
  email:     { label: 'Email',     emoji: '@',  color: '#EA4335' },
}

const TRANSPORTS: MCPTransport[] = ['http', 'sse', 'stdio']

function generateId(): string {
  return crypto.randomUUID()
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}
    >
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function IntegrationsPanel({ initialTab }: { initialTab?: Tab } = {}) {
  const { state, dispatch } = useAdmin()
  const { integrations, capabilities } = state
  const { github: _github, dataSources } = integrations

  const hermes   = capabilities.hermes
  const platforms = capabilities.platforms
  const agents   = capabilities.skills.filter((sk: CapabilitySkill) => sk.type === 'agent')
  const _skills   = capabilities.skills.filter((sk: CapabilitySkill) => sk.type === 'skill')

  const [tab,           setTab]           = useState<Tab>(initialTab ?? 'platforms')
  const [openPromptId,  setOpenPromptId]  = useState<string | null>(null)
  const [promptDraft,   setPromptDraft]   = useState('')
  const [showMCPForm,   setShowMCPForm]   = useState(false)
  const [newMCP,        setNewMCP]        = useState<Partial<MCPServer>>({ transport: 'http', enabled: true })
  const [showAgentForm, setShowAgentForm] = useState(false)
  const [newAgent,      setNewAgent]      = useState({ name: '', description: '', source: '', systemPrompt: '' })

  // ── Derived stats ────────────────────────────────────────────────────────────
  const repoSources        = dataSources.filter((s) => s.type === 'github-repo').length
  const fileSources        = dataSources.filter((s) => s.type === 'file' || s.type === 'archive' || s.type === 'folder').length
  const readySources       = dataSources.filter((s) => s.status === 'ready').length
  const connectedPlatforms = integrations.socialPlatforms?.filter((p) => p.connected).length ?? 0
  const enabledAgents      = agents.filter((a: CapabilitySkill) => a.enabled).length
  const enabledMCP         = capabilities.mcpServers.filter((m: MCPServer) => m.enabled).length

  // ── MCP helpers ──────────────────────────────────────────────────────────────
  const saveMCP = () => {
    if (!newMCP.name || !newMCP.url) return
    const server: MCPServer = {
      id: generateId(),
      name: newMCP.name,
      url: newMCP.url,
      transport: newMCP.transport ?? 'http',
      description: newMCP.description ?? '',
      enabled: true,
    }
    dispatch({ type: 'CAPABILITIES_ADD_MCP', payload: server })
    setNewMCP({ transport: 'http', enabled: true })
    setShowMCPForm(false)
  }

  // ── Prompt editor helpers ────────────────────────────────────────────────────
  const openPrompt = (skill: CapabilitySkill) => {
    setOpenPromptId(skill.id)
    setPromptDraft(skill.systemPrompt ?? '')
  }
  const savePrompt = (id: string) => {
    dispatch({ type: 'CAPABILITIES_UPDATE_SKILL', payload: { id, data: { systemPrompt: promptDraft } } })
    setOpenPromptId(null)
  }

  const saveAgent = () => {
    if (!newAgent.name) return
    const skill: CapabilitySkill = {
      id: generateId(),
      name: newAgent.name,
      description: newAgent.description,
      source: newAgent.source || 'custom',
      type: 'agent',
      enabled: true,
      systemPrompt: newAgent.systemPrompt || undefined,
    }
    dispatch({ type: 'CAPABILITIES_ADD_SKILL', payload: skill })
    setNewAgent({ name: '', description: '', source: '', systemPrompt: '' })
    setShowAgentForm(false)
  }

  // ── Tab render ───────────────────────────────────────────────────────────────
  const isAgentTab = (t: Tab) => ['agentes','hermes','mcp','skills','bots'].includes(t)
  const _isSourceTab = (t: Tab) => !isAgentTab(t)

  const tabCls = (id: Tab) => {
    const active = tab === id
    const isAgent = isAgentTab(id)
    return `relative shrink-0 pb-2.5 px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors whitespace-nowrap ${
      active
        ? isAgent ? 'text-violet-300/90' : 'text-white/80'
        : 'text-white/30 hover:text-white/55'
    }`
  }
  const activeBarCls = (id: Tab) =>
    isAgentTab(id) ? 'absolute bottom-0 left-0 right-0 h-px bg-violet-400' : 'absolute bottom-0 left-0 right-0 h-px bg-cyan-400'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Command Center</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Integrations</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">
          Repos · archivos · APIs · agentes · MCP · plataformas de mensajería
        </p>

        {/* Connection health bar */}
        {(() => {
          const totalConfigured = dataSources.length + (integrations.socialPlatforms?.length ?? 0) + capabilities.mcpServers.length + agents.length
          const totalHealthy    = readySources + connectedPlatforms + enabledMCP + enabledAgents
          const pct  = totalConfigured > 0 ? Math.round((totalHealthy / totalConfigured) * 100) : 0
          const color = pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171'
          return totalConfigured > 0 ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="shrink-0 font-mono text-[9px] tabular-nums" style={{ color }}>
                {totalHealthy}/{totalConfigured} connected
              </span>
              <span className="shrink-0 font-mono text-[8.5px] text-white/22">
                {pct}% health
              </span>
            </div>
          ) : null
        })()}
      </div>

      {/* Stats grid — clickable, navigate to tab */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Sources', value: dataSources.length,   color: '#22d3ee', tab: 'sources'   as Tab },
          { label: 'GitHub Repos',  value: repoSources,          color: '#a78bfa', tab: 'github'    as Tab },
          { label: 'Ready',         value: readySources,          color: '#34d399', tab: 'sources'   as Tab },
          { label: 'Platforms',     value: connectedPlatforms,   color: '#fb923c', tab: 'platforms' as Tab },
          { label: 'Files',         value: fileSources,           color: '#38bdf8', tab: 'files'     as Tab },
          { label: 'MCP Servers',   value: enabledMCP,            color: '#c084fc', tab: 'mcp'       as Tab },
          { label: 'AI Agents',     value: enabledAgents,         color: '#818cf8', tab: 'agentes'   as Tab },
          {
            label: 'Hermes',
            value: hermes?.status ?? 'off',
            color: hermes?.status === 'connected' ? '#22d3ee' : '#ffffff30',
            tab: 'hermes' as Tab,
          },
        ].map((m) => (
          <button
            key={m.label}
            onClick={() => setTab(m.tab)}
            className={`rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-left transition-all hover:border-white/15 hover:bg-white/[0.04] ${tab === m.tab ? 'border-white/15 bg-white/[0.04]' : ''}`}
          >
            <div className="text-2xl font-semibold tabular-nums leading-none" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
          </button>
        ))}
      </div>

      {/* Tab bar — two visual groups: data sources | AI capabilities */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-400/50">Data Sources</span>
          <div className="flex-1 h-px bg-cyan-400/10" />
          <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.2em] text-violet-400/50">AI Capabilities</span>
        </div>
        <div className="flex gap-0 border-b border-white/8 overflow-x-auto scrollbar-none">
          {ALL_TABS.map((t, i) => {
            const prevGroup = i > 0 ? ALL_TABS[i - 1].group : t.group
            const showDivider = t.group !== prevGroup
            return (
              <div key={t.id} className={`flex items-center ${showDivider ? 'border-l border-white/10 ml-2 pl-2' : ''}`}>
                <button onClick={() => setTab(t.id)} className={tabCls(t.id)}>
                  {t.label}
                  {tab === t.id && <span className={activeBarCls(t.id)} />}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── SOURCE TABS (original Integrations) ─────────────────────────────── */}
      {tab === 'platforms' && <PlatformsTab />}
      {tab === 'sources'   && <SourcesTab />}
      {tab === 'github'    && <GitHubTab onNavigateToSources={() => setTab('sources')} />}
      {tab === 'files'     && <FilesTab  onNavigateToSources={() => setTab('sources')} />}
      {tab === 'links'     && <LinksTab  onNavigateToSources={() => setTab('sources')} />}
      {tab === 'deploy'    && <DeployTab />}

      {/* ─── AGENTES TAB ─────────────────────────────────────────────────────── */}
      {tab === 'agentes' && (
        <div className="space-y-4">
          {hermes && (
            <div className="rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/5 via-transparent to-violet-400/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[13px] font-semibold text-white/85">Hermes Agent</div>
                  <div className="font-mono text-[10px] text-white/35">NousResearch · Auto-improving · 200+ models</div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${{ connected: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400', connecting: 'border-amber-400/25 bg-amber-400/8 text-amber-400', disconnected: 'border-white/10 bg-white/3 text-white/30', error: 'border-red-400/25 bg-red-400/8 text-red-400' }[hermes.status] ?? 'border-white/10 bg-white/3 text-white/30'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${{ connected: 'bg-emerald-400 animate-pulse', connecting: 'bg-amber-400 animate-pulse', disconnected: 'bg-white/20', error: 'bg-red-400' }[hermes.status] ?? 'bg-white/20'}`} />
                  {hermes.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                  { v: hermes.backend,                        label: 'Backend'   },
                  { v: hermes.model.split('/').pop(),         label: 'Model'     },
                  { v: hermes.mcpEnabled  ? 'On' : 'Off',    label: 'MCP'       },
                  { v: hermes.subagents   ? 'On' : 'Off',    label: 'Subagents' },
                ].map(({ v, label }) => (
                  <div key={label} className="rounded-lg border border-white/6 bg-black/20 px-2 py-1.5 text-center">
                    <div className="font-mono text-[11px] font-semibold text-white/70" style={{ fontSize: '9px' }}>{v}</div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: 'Learning Loop',     active: hermes.learningLoop     },
                  { label: 'Persistent Memory', active: hermes.persistentMemory },
                  { label: 'Scheduler',         active: hermes.scheduler        },
                  { label: 'Portal',            active: hermes.portalEnabled    },
                ].map((f) => (
                  <span key={f.label} className={`rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${f.active ? 'border-violet-400/25 bg-violet-400/8 text-violet-400' : 'border-white/8 text-white/20'}`}>
                    {f.label}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setTab('hermes')} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 font-mono text-[9.5px] uppercase tracking-wider text-white/45 transition-colors hover:bg-white/10 hover:text-white/70">
                  Configurar
                </button>
                <button
                  onClick={() => {
                    if (hermes.status === 'connected') {
                      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'disconnected', enabled: false } })
                    } else {
                      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { enabled: true } })
                      setTab('hermes')
                    }
                  }}
                  className={`flex-1 rounded-lg border py-1.5 font-mono text-[9.5px] uppercase tracking-wider transition-colors ${hermes.status === 'connected' ? 'border-red-400/20 bg-red-400/5 text-red-400/70 hover:bg-red-400/10' : 'border-cyan-400/25 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15'}`}
                >
                  {hermes.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">AI Agents</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/20">{enabledAgents}/{agents.length} enabled</span>
                <button
                  onClick={() => setShowAgentForm(v => !v)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[8.5px] text-white/35 transition-colors hover:text-white/65 hover:bg-white/10"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add
                </button>
              </div>
            </div>

            {showAgentForm && (
              <div className="border-b border-white/8 p-4 space-y-2 bg-violet-400/[0.02]">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">New Agent</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Agent name"
                    className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                    value={newAgent.name}
                    onChange={e => setNewAgent(p => ({ ...p, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Source (e.g. custom, agentskills.io)"
                    className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                    value={newAgent.source}
                    onChange={e => setNewAgent(p => ({ ...p, source: e.target.value }))}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  value={newAgent.description}
                  onChange={e => setNewAgent(p => ({ ...p, description: e.target.value }))}
                />
                <textarea
                  placeholder="System prompt (optional)"
                  className="h-20 w-full resize-none rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-white/20 leading-relaxed"
                  value={newAgent.systemPrompt}
                  onChange={e => setNewAgent(p => ({ ...p, systemPrompt: e.target.value }))}
                />
                <div className="flex gap-2">
                  <button onClick={saveAgent} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
                    <Check className="h-3.5 w-3.5" />Save agent
                  </button>
                  <button onClick={() => setShowAgentForm(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[10px] text-white/30 transition-colors hover:text-white/55">Cancel</button>
                </div>
              </div>
            )}

            {agents.length === 0 && !showAgentForm ? (
              <div className="py-8 text-center font-mono text-[10px] text-white/20">
                No agents configured. Click <span className="text-white/40">Add</span> to create one.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {agents.map((agent: CapabilitySkill) => (
                  <div key={agent.id} className="border-b border-white/5 px-4 py-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-400/8 text-violet-400">
                        <Cpu className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] font-semibold text-white/70">{agent.name}</div>
                        <div className="font-mono text-[9px] text-white/30 leading-relaxed">{agent.description}</div>
                        {agent.source !== 'built-in' && (
                          <div className="mt-0.5 font-mono text-[8px] text-white/20">{agent.source}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {agent.systemPrompt !== undefined && (
                          <button
                            onClick={() => openPromptId === agent.id ? setOpenPromptId(null) : openPrompt(agent)}
                            className="flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/55"
                          >
                            Prompt
                            {openPromptId === agent.id ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => dispatch({ type: 'CAPABILITIES_TOGGLE_SKILL', payload: agent.id })}
                          className={`flex h-6 w-14 items-center justify-center rounded-full border font-mono text-[8px] uppercase tracking-wider transition-colors shrink-0 ${agent.enabled ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400' : 'border-white/10 bg-white/3 text-white/25 hover:border-white/20'}`}
                        >
                          {agent.enabled ? 'On' : 'Off'}
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'CAPABILITIES_REMOVE_SKILL', payload: agent.id })}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {openPromptId === agent.id && (
                      <div className="mt-2 space-y-1">
                        <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">System Prompt</div>
                        <textarea
                          className="h-28 w-full resize-none rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-white/20 leading-relaxed"
                          value={promptDraft}
                          onChange={(e) => setPromptDraft(e.target.value)}
                          placeholder="Enter system prompt for this agent..."
                        />
                        <button onClick={() => savePrompt(agent.id)} className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2.5 py-1 font-mono text-[8px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
                          <Check className="h-3 w-3" />
                          Save prompt
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── HERMES ☤ TAB ────────────────────────────────────────────────────── */}
      {tab === 'hermes' && <HermesTab />}

      {/* ─── MCP TAB ─────────────────────────────────────────────────────────── */}
      {tab === 'mcp' && (
        <div className="space-y-4">

          {/* Hermes auto-discovery notice */}
          {hermes?.mcpEnabled && hermes.status === 'connected' && (
            <div className="flex items-start gap-2 rounded-xl border border-violet-400/12 bg-violet-400/5 px-4 py-3">
              <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5 text-violet-400/60" />
              <span className="font-mono text-[9px] text-violet-400/70 leading-relaxed">
                Hermes detecta y registra servidores MCP automáticamente cuando está conectado.
                Los nuevos servidores aparecen aquí en tiempo real.
              </span>
            </div>
          )}

          {/* Active servers */}
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Active Servers</span>
                <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[8px] text-white/25">{enabledMCP}/{capabilities.mcpServers.length}</span>
              </div>
              <button onClick={() => setShowMCPForm((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] text-white/40 transition-colors hover:text-white/70 hover:bg-white/10">
                <Plus className="h-3 w-3" />
                Add manual
              </button>
            </div>
            {showMCPForm && (
              <div className="border-b border-white/8 p-4 space-y-2 bg-cyan-400/[0.02]">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">New MCP Server</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Server name" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors" value={newMCP.name ?? ''} onChange={(e) => setNewMCP((p) => ({ ...p, name: e.target.value }))} />
                  <input type="text" placeholder="https://server/mcp or http://localhost:3100" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors" value={newMCP.url ?? ''} onChange={(e) => setNewMCP((p) => ({ ...p, url: e.target.value }))} />
                </div>
                <input type="text" placeholder="Description (optional)" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors" value={newMCP.description ?? ''} onChange={(e) => setNewMCP((p) => ({ ...p, description: e.target.value }))} />
                <div className="flex items-center gap-2">
                  {TRANSPORTS.map((t) => (
                    <button key={t} onClick={() => setNewMCP((p) => ({ ...p, transport: t }))} className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${newMCP.transport === t ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55'}`}>{t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={saveMCP} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
                    <Check className="h-3.5 w-3.5" />Save
                  </button>
                  <button onClick={() => setShowMCPForm(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[10px] text-white/30 transition-colors hover:text-white/55">Cancel</button>
                </div>
              </div>
            )}
            {capabilities.mcpServers.length === 0 && !showMCPForm ? (
              <div className="py-8 text-center font-mono text-[10px] text-white/20">No MCP servers configured. Add one manually or install from Registry below.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {capabilities.mcpServers.map((server: MCPServer) => {
                  const regEntry = (state.mcpRegistry ?? []).find((r: ResourceMcpItem) => r.name.toLowerCase() === server.name.toLowerCase())
                  return (
                    <div key={server.id} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Toggle enabled={server.enabled} onToggle={() => dispatch({ type: 'CAPABILITIES_TOGGLE_MCP', payload: server.id })} />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[11px] font-semibold text-white/70">{server.name}</div>
                          <div className="font-mono text-[9px] text-white/30 truncate">{server.description || server.url}</div>
                        </div>
                        {regEntry && (
                          <span className="rounded-md border border-emerald-400/15 bg-emerald-400/6 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400/70">
                            {regEntry.toolCount} tools
                          </span>
                        )}
                        <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/35">{server.transport}</span>
                        <button onClick={() => dispatch({ type: 'CAPABILITIES_REMOVE_MCP', payload: server.id })} className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 shrink-0">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {server.url && (
                        <div className="mt-1.5 ml-11 font-mono text-[8px] text-white/18 truncate">{server.url}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* MCP Registry — browseable, installable */}
          {(state.mcpRegistry ?? []).length > 0 && (() => {
            const installedNames = new Set(capabilities.mcpServers.map((s: MCPServer) => s.name.toLowerCase()))
            const byCategory = (state.mcpRegistry as ResourceMcpItem[]).reduce<Record<string, ResourceMcpItem[]>>((acc, item) => {
              const cat = item.cat || 'Other'
              acc[cat] = acc[cat] ? [...acc[cat], item] : [item]
              return acc
            }, {})
            const installFromRegistry = (item: ResourceMcpItem) => {
              const server: MCPServer = {
                id: generateId(),
                name: item.name,
                url: '',
                transport: 'stdio',
                description: item.cat,
                enabled: true,
              }
              dispatch({ type: 'CAPABILITIES_ADD_MCP', payload: server })
            }
            return (
              <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-white/25" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">MCP Registry</span>
                    <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[8px] text-white/25">{(state.mcpRegistry as ResourceMcpItem[]).length} servers</span>
                  </div>
                  <span className="font-mono text-[8px] text-white/20">{(state.mcpRegistry as ResourceMcpItem[]).filter(r => installedNames.has(r.name.toLowerCase())).length} installed</span>
                </div>
                {Object.entries(byCategory).map(([cat, items]) => (
                  <div key={cat} className="border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.015]">
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/22">{cat}</span>
                      <span className="font-mono text-[7.5px] text-white/15">{items.length}</span>
                    </div>
                    {items.map((item: ResourceMcpItem) => {
                      const installed = installedNames.has(item.name.toLowerCase())
                      return (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-t border-white/4">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-[10.5px] font-medium text-white/65">{item.name}</div>
                            <div className="font-mono text-[8px] text-white/25 mt-0.5 truncate">{item.install}</div>
                          </div>
                          <span className="shrink-0 rounded-md border border-sky-400/15 bg-sky-400/6 px-1.5 py-0.5 font-mono text-[8px] text-sky-400/60">
                            {item.toolCount} tools
                          </span>
                          {installed ? (
                            <span className="flex items-center gap-1 shrink-0 rounded-md border border-emerald-400/20 bg-emerald-400/6 px-2 py-0.5 font-mono text-[8px] text-emerald-400/70">
                              <Check className="h-2.5 w-2.5" />Installed
                            </span>
                          ) : (
                            <button
                              onClick={() => installFromRegistry(item)}
                              className="flex items-center gap-1 shrink-0 rounded-md border border-white/10 bg-white/4 px-2 py-0.5 font-mono text-[8px] text-white/35 transition-colors hover:border-cyan-400/25 hover:bg-cyan-400/8 hover:text-cyan-400"
                            >
                              <Download className="h-2.5 w-2.5" />Add
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* ─── SKILLS TAB ──────────────────────────────────────────────────────── */}
      {tab === 'skills' && (() => {
        const allSkills = capabilities.skills as CapabilitySkill[]
        const byType = {
          agent: allSkills.filter(s => s.type === 'agent'),
          skill: allSkills.filter(s => s.type === 'skill'),
          tool:  allSkills.filter(s => s.type === 'tool'),
        }
        const totalEnabled = allSkills.filter(s => s.enabled).length

        const typeConfig = {
          agent: { label: 'Agents',  icon: Cpu,     accent: 'text-violet-400', border: 'border-violet-400/20', bg: 'bg-violet-400/8', badge: 'border-violet-400/20 bg-violet-400/8 text-violet-400' },
          skill: { label: 'Skills',  icon: Layers,  accent: 'text-sky-400',    border: 'border-sky-400/20',    bg: 'bg-sky-400/8',    badge: 'border-sky-400/20 bg-sky-400/8 text-sky-400' },
          tool:  { label: 'Tools',   icon: Wrench,  accent: 'text-amber-400',  border: 'border-amber-400/20',  bg: 'bg-amber-400/8',  badge: 'border-amber-400/20 bg-amber-400/8 text-amber-400' },
        } as const

        return (
          <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
              {(['agent', 'skill', 'tool'] as const).map(type => {
                const cfg = typeConfig[type]
                const IconCmp = cfg.icon
                const items = byType[type]
                const enabled = items.filter(s => s.enabled).length
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${cfg.border} ${cfg.bg}`}>
                      <IconCmp className={`h-2.5 w-2.5 ${cfg.accent}`} />
                    </span>
                    <div>
                      <div className={`font-mono text-[10px] font-semibold ${cfg.accent}`}>{enabled}/{items.length}</div>
                      <div className="font-mono text-[7.5px] uppercase tracking-[0.14em] text-white/22">{cfg.label}</div>
                    </div>
                  </div>
                )
              })}
              <div className="ml-auto flex items-center gap-2 font-mono text-[9px] text-white/25">
                <span>{totalEnabled}/{allSkills.length} active</span>
                <a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400/60 hover:text-cyan-400 transition-colors">
                  agentskills.io <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>

            {/* Sections by type */}
            {(['agent', 'skill', 'tool'] as const).map(type => {
              const cfg = typeConfig[type]
              const IconCmp = cfg.icon
              const items = byType[type]
              if (items.length === 0) return null
              return (
                <div key={type} className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
                  <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2.5">
                    <IconCmp className={`h-3 w-3 ${cfg.accent}`} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{cfg.label}</span>
                    <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[7.5px] ${cfg.badge}`}>{items.filter(s => s.enabled).length}/{items.length}</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {items.map((skill: CapabilitySkill) => (
                      <div key={skill.id} className="flex items-start gap-3 px-4 py-3">
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${cfg.border} ${cfg.bg}`}>
                          <IconCmp className={`h-2.5 w-2.5 ${cfg.accent}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[11px] font-semibold text-white/70">{skill.name}</div>
                          {skill.description && <div className="font-mono text-[9px] text-white/30 leading-relaxed">{skill.description}</div>}
                          {skill.source && skill.source !== 'built-in' && (
                            <div className="mt-0.5 font-mono text-[8px] text-white/18">{skill.source}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {skill.systemPrompt !== undefined && (
                            <button
                              onClick={() => openPromptId === skill.id ? setOpenPromptId(null) : openPrompt(skill)}
                              className="flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/55"
                            >
                              Prompt {openPromptId === skill.id ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                            </button>
                          )}
                          <button onClick={() => dispatch({ type: 'CAPABILITIES_TOGGLE_SKILL', payload: skill.id })} className={`flex h-6 w-14 items-center justify-center rounded-full border font-mono text-[8px] uppercase tracking-wider transition-colors ${skill.enabled ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400' : 'border-white/10 bg-white/3 text-white/25 hover:border-white/20'}`}>
                            {skill.enabled ? 'On' : 'Off'}
                          </button>
                          <button onClick={() => dispatch({ type: 'CAPABILITIES_REMOVE_SKILL', payload: skill.id })} className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 shrink-0">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {openPromptId === skill.id && (
                          <div className="col-span-full mt-2 w-full space-y-1">
                            <textarea
                              className="h-28 w-full resize-none rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-white/20 leading-relaxed"
                              value={promptDraft}
                              onChange={(e) => setPromptDraft(e.target.value)}
                              placeholder="System prompt for this skill..."
                            />
                            <button onClick={() => savePrompt(skill.id)} className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2.5 py-1 font-mono text-[8px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
                              <Check className="h-3 w-3" />Save
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {allSkills.length === 0 && (
              <div className="rounded-xl border border-white/8 bg-white/[0.02] py-8 text-center font-mono text-[10px] text-white/20">
                No skills configured. Add agents in the Agentes tab.
              </div>
            )}
          </div>
        )
      })()}

      {/* ─── BOTS (messaging platforms) TAB ─────────────────────────────────── */}
      {tab === 'bots' && platforms && (
        <div className="space-y-4">

          {/* Status overview */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Active Bots',   value: platforms.filter(p => p.status === 'active').length,  color: '#34d399' },
              { label: 'Configured',    value: platforms.filter(p => p.token).length,                color: '#60a5fa' },
              { label: 'Errors',        value: platforms.filter(p => p.status === 'error').length,   color: '#f87171' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-xl font-semibold tabular-nums" style={{ color: s.color }}>{s.value}</div>
                <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/22">{s.label}</div>
              </div>
            ))}
          </div>

          <p className="font-mono text-[9.5px] text-white/28 leading-relaxed">
            Conecta Hermes a plataformas de mensajería. Cada bot actúa como interfaz conversacional del agente.
            {!hermes?.enabled && (
              <button onClick={() => setTab('hermes')} className="ml-1.5 text-violet-400/70 hover:text-violet-400 transition-colors underline underline-offset-2">
                Activa Hermes primero →
              </button>
            )}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const meta = PLATFORM_META_CAP[platform.id]
              const statusColors = { active: 'text-emerald-400', inactive: 'text-white/20', error: 'text-red-400' } as const
              const dotColors    = { active: 'bg-emerald-400 animate-pulse', inactive: 'bg-white/15', error: 'bg-red-400' } as const
              const borderGlow   = platform.status === 'active' ? `1px solid ${meta.color}30` : '1px solid rgba(255,255,255,0.08)'
              return (
                <div key={platform.id} className="rounded-xl bg-white/[0.02] p-4 space-y-3" style={{ border: borderGlow }}>
                  {/* Platform header */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                      <span style={{ color: meta.color, fontSize: '14px' }}>{meta.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[11px] font-semibold text-white/70">{meta.label}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${dotColors[platform.status] ?? 'bg-white/15'}`} />
                        <span className={`font-mono text-[8px] uppercase tracking-wider ${statusColors[platform.status] ?? 'text-white/20'}`}>{platform.status}</span>
                      </div>
                    </div>
                    <Toggle enabled={platform.enabled} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, enabled: !platform.enabled } })} />
                  </div>

                  {/* Config fields */}
                  <div className="space-y-2">
                    <div>
                      <div className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/22">Bot Token</div>
                      <input
                        type="password"
                        placeholder={`${meta.label} bot token...`}
                        className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                        value={platform.token}
                        onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, token: e.target.value } })}
                      />
                    </div>
                    <div>
                      <div className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/22">Bot Name / Handle</div>
                      <input
                        type="text"
                        placeholder={`@${meta.label.toLowerCase()}_bot`}
                        className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                        value={platform.botName}
                        onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, botName: e.target.value } })}
                      />
                    </div>
                    <div>
                      <div className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/22">Webhook URL</div>
                      <input
                        type="url"
                        placeholder={`https://your-domain.com/api/bots/${platform.id}`}
                        className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9px] text-white/55 placeholder-white/15 outline-none focus:border-white/20 transition-colors"
                        value={platform.webhookUrl ?? ''}
                        onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, webhookUrl: e.target.value } })}
                      />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/6">
                    {platform.enabled && platform.token ? (
                      <button
                        onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, status: 'active' } })}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/4 py-1.5 font-mono text-[9px] text-white/35 transition-colors hover:bg-white/8 hover:text-white/65"
                      >
                        <Send className="h-2.5 w-2.5" />
                        Send test message
                      </button>
                    ) : (
                      <span className="flex-1 font-mono text-[8.5px] text-white/18">
                        {!platform.token ? 'Configure token to activate' : 'Enable to test'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
