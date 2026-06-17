'use client'

import React, { useState } from 'react'
import {
  Plus, Trash2, Check, Cpu,
  Zap, Bot, ExternalLink,
  ChevronDown, ChevronUp,
  Send,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { MCPServer, CapabilitySkill, MCPTransport, PlatformId } from '@/lib/admin/types'
import { HermesTab } from './capabilities/HermesTab'

type Tab = 'agentes' | 'hermes' | 'mcp' | 'skills' | 'plataformas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'agentes',    label: 'Agentes'    },
  { id: 'hermes',     label: 'Hermes ☤'  },
  { id: 'mcp',        label: 'MCP'        },
  { id: 'skills',     label: 'Skills'     },
  { id: 'plataformas', label: 'Plataformas' },
]

const PLATFORM_META: Record<PlatformId, { label: string; emoji: string; color: string }> = {
  telegram:  { label: 'Telegram',  emoji: '✈',  color: '#229ED9' },
  discord:   { label: 'Discord',   emoji: '◉',  color: '#5865F2' },
  slack:     { label: 'Slack',     emoji: '#',  color: '#4A154B' },
  whatsapp:  { label: 'WhatsApp',  emoji: '◎',  color: '#25D366' },
  signal:    { label: 'Signal',    emoji: '⊕',  color: '#3A76F0' },
  email:     { label: 'Email',     emoji: '@',  color: '#EA4335' },
}

const TRANSPORTS: MCPTransport[] = ['http', 'sse', 'stdio']

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

export default function CapabilitiesPanel() {
  const { state, dispatch } = useAdmin()
  const { capabilities } = state

  const hermes = capabilities.hermes
  const platforms = capabilities.platforms
  const agents = capabilities.skills.filter((sk) => sk.type === 'agent')
  const skills = capabilities.skills.filter((sk) => sk.type === 'skill')

  const [activeTab, setActiveTab] = useState<Tab>('agentes')
  const [openPromptId, setOpenPromptId] = useState<string | null>(null)
  const [promptDraft, setPromptDraft] = useState('')
  const [showMCPForm, setShowMCPForm] = useState(false)
  const [newMCP, setNewMCP] = useState<Partial<MCPServer>>({ transport: 'http', enabled: true })

  // ── MCP helpers ─────────────────────────────────────────────────────────────

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

  // ── Prompt editor helpers ───────────────────────────────────────────────────

  const openPrompt = (skill: CapabilitySkill) => {
    setOpenPromptId(skill.id)
    setPromptDraft(skill.systemPrompt ?? '')
  }

  const savePrompt = (id: string) => {
    dispatch({ type: 'CAPABILITIES_UPDATE_SKILL', payload: { id, data: { systemPrompt: promptDraft } } })
    setOpenPromptId(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Command Center</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Workspace · Capacidades</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">Hermes Agent · MCP · Skills · Plataformas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-white/8 pb-0 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative shrink-0 pb-2.5 px-3 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors whitespace-nowrap ${active ? 'text-white/80' : 'text-white/30 hover:text-white/55'}`}>
              {tab.label}
              {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />}
            </button>
          )
        })}
      </div>

      {/* ─ AGENTES TAB ────────────────────────────────────────────────────────── */}
      {activeTab === 'agentes' && (
        <div className="space-y-4">
          {/* Hermes featured card */}
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
                <div className="rounded-lg border border-white/6 bg-black/20 px-2 py-1.5 text-center">
                  <div className="font-mono text-[11px] font-semibold text-white/70">{hermes.backend}</div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Backend</div>
                </div>
                <div className="rounded-lg border border-white/6 bg-black/20 px-2 py-1.5 text-center">
                  <div className="font-mono text-[11px] font-semibold text-white/70" style={{ fontSize: '9px' }}>{hermes.model.split('/').pop()}</div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Model</div>
                </div>
                <div className="rounded-lg border border-white/6 bg-black/20 px-2 py-1.5 text-center">
                  <div className="font-mono text-[11px] font-semibold text-white/70">{hermes.mcpEnabled ? 'On' : 'Off'}</div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">MCP</div>
                </div>
                <div className="rounded-lg border border-white/6 bg-black/20 px-2 py-1.5 text-center">
                  <div className="font-mono text-[11px] font-semibold text-white/70">{hermes.subagents ? 'On' : 'Off'}</div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Subagents</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: 'Learning Loop', active: hermes.learningLoop },
                  { label: 'Persistent Memory', active: hermes.persistentMemory },
                  { label: 'Scheduler', active: hermes.scheduler },
                  { label: 'Portal', active: hermes.portalEnabled },
                ].map((f) => (
                  <span key={f.label} className={`rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${f.active ? 'border-violet-400/25 bg-violet-400/8 text-violet-400' : 'border-white/8 text-white/20'}`}>{f.label}</span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setActiveTab('hermes')} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 font-mono text-[9.5px] uppercase tracking-wider text-white/45 transition-colors hover:bg-white/10 hover:text-white/70">
                  Configurar
                </button>
                <button
                  onClick={() => {
                    if (hermes.status === 'connected') {
                      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'disconnected', enabled: false } })
                    } else {
                      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { enabled: true } })
                      setActiveTab('hermes')
                    }
                  }}
                  className={`flex-1 rounded-lg border py-1.5 font-mono text-[9.5px] uppercase tracking-wider transition-colors ${hermes.status === 'connected' ? 'border-red-400/20 bg-red-400/5 text-red-400/70 hover:bg-red-400/10' : 'border-cyan-400/25 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15'}`}
                >
                  {hermes.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            </div>
          )}

          {/* Agent skills */}
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">AI Agents</span>
              <span className="font-mono text-[9px] text-white/20">
                {agents.filter((a) => a.enabled).length}/{agents.length} enabled
              </span>
            </div>
            {agents.length === 0 ? (
              <div className="py-8 text-center font-mono text-[10px] text-white/20">No agents configured.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {agents.map((agent) => (
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
                            {openPromptId === agent.id
                              ? <ChevronUp className="h-2.5 w-2.5" />
                              : <ChevronDown className="h-2.5 w-2.5" />
                            }
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

      {/* ─ HERMES ☤ TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'hermes' && <HermesTab />}

      {/* ─ MCP TAB ──────────────────────────────────────────────────────────── */}
      {activeTab === 'mcp' && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">MCP Servers</span>
            <button onClick={() => setShowMCPForm((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] text-white/40 transition-colors hover:text-white/70 hover:bg-white/10">
              <Plus className="h-3 w-3" />
              Add server
            </button>
          </div>

          {/* Hermes auto-discovery note */}
          {hermes?.mcpEnabled && hermes.status === 'connected' && (
            <div className="flex items-start gap-2 rounded-lg border border-violet-400/10 bg-violet-400/5 px-3 py-2 mx-4 my-3">
              <Zap className="h-3 w-3 shrink-0 mt-0.5 text-violet-400/60" />
              <span className="font-mono text-[9px] text-violet-400/70 leading-relaxed">
                Hermes detecta y registra servidores MCP automáticamente cuando está conectado.
              </span>
            </div>
          )}

          {/* Add MCP form */}
          {showMCPForm && (
            <div className="border-t border-white/8 p-4 space-y-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">New MCP Server</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Server name"
                  className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  value={newMCP.name ?? ''}
                  onChange={(e) => setNewMCP((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="https://server/mcp or http://localhost:3100"
                  className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                  value={newMCP.url ?? ''}
                  onChange={(e) => setNewMCP((p) => ({ ...p, url: e.target.value }))}
                />
              </div>
              <input
                type="text"
                placeholder="Description (optional)"
                className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                value={newMCP.description ?? ''}
                onChange={(e) => setNewMCP((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                {TRANSPORTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewMCP((p) => ({ ...p, transport: t }))}
                    className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${newMCP.transport === t ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={saveMCP} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
                <button onClick={() => setShowMCPForm(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[10px] text-white/30 transition-colors hover:text-white/55">Cancel</button>
              </div>
            </div>
          )}

          {capabilities.mcpServers.length === 0 && !showMCPForm ? (
            <div className="py-8 text-center font-mono text-[10px] text-white/20">No MCP servers configured.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {capabilities.mcpServers.map((server) => (
                <div key={server.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
                  <Toggle
                    enabled={server.enabled}
                    onToggle={() => dispatch({ type: 'CAPABILITIES_TOGGLE_MCP', payload: server.id })}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] font-semibold text-white/70">{server.name}</div>
                    <div className="font-mono text-[9px] text-white/30 truncate">{server.url}</div>
                  </div>
                  <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-white/35">{server.transport}</span>
                  <button
                    onClick={() => dispatch({ type: 'CAPABILITIES_REMOVE_MCP', payload: server.id })}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─ SKILLS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Skill Library</span>
            <span className="font-mono text-[9px] text-white/20">
              {skills.filter((sk) => sk.enabled).length}/{skills.length} active
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="font-mono text-[9px] text-white/25">Agentskills.io Hub</span>
            <a
              href="https://agentskills.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[9px] text-cyan-400/70 hover:text-cyan-400 transition-colors"
            >
              Explorar skills <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {skills.length === 0 ? (
            <div className="py-8 text-center font-mono text-[10px] text-white/20">No skills configured.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
                  <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider shrink-0 ${{ skill: 'border-sky-400/20 bg-sky-400/8 text-sky-400', agent: 'border-violet-400/20 bg-violet-400/8 text-violet-400', tool: 'border-amber-400/20 bg-amber-400/8 text-amber-400' }[skill.type] ?? 'border-white/10 text-white/30'}`}>{skill.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] font-semibold text-white/70">{skill.name}</div>
                    <div className="font-mono text-[9px] text-white/30">{skill.description}</div>
                    {skill.source !== 'built-in' && (
                      <div className="font-mono text-[8px] text-white/20">{skill.source}</div>
                    )}
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'CAPABILITIES_TOGGLE_SKILL', payload: skill.id })}
                    className={`flex h-6 w-14 items-center justify-center rounded-full border font-mono text-[8px] uppercase tracking-wider transition-colors shrink-0 ${skill.enabled ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400' : 'border-white/10 bg-white/3 text-white/25 hover:border-white/20'}`}
                  >
                    {skill.enabled ? 'On' : 'Off'}
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'CAPABILITIES_REMOVE_SKILL', payload: skill.id })}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─ PLATAFORMAS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'plataformas' && platforms && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-white/30">
              Conecta Hermes a tus plataformas de mensajería. Los bots actúan como interfaces del agente.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const meta = PLATFORM_META[platform.id]
              return (
                <div key={platform.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                      style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                    >
                      <span style={{ color: meta.color, fontSize: '14px' }}>{meta.emoji}</span>
                    </div>
                    <div className="ml-2.5 flex-1 min-w-0">
                      <div className="font-mono text-[11px] font-semibold text-white/70">{meta.label}</div>
                      <div className={`font-mono text-[8px] uppercase tracking-wider ${{ active: 'text-emerald-400', inactive: 'text-white/20', error: 'text-red-400' }[platform.status] ?? 'text-white/20'}`}>{platform.status}</div>
                    </div>
                    <Toggle
                      enabled={platform.enabled}
                      onToggle={() => dispatch({
                        type: 'CAPABILITIES_UPDATE_PLATFORM',
                        payload: { id: platform.id, enabled: !platform.enabled }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="mb-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/25">Bot Token</div>
                      <input
                        type="password"
                        placeholder={`${meta.label} bot token...`}
                        className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                        value={platform.token}
                        onChange={(e) => dispatch({
                          type: 'CAPABILITIES_UPDATE_PLATFORM',
                          payload: { id: platform.id, token: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <div className="mb-0.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-white/25">Bot Name</div>
                      <input
                        type="text"
                        placeholder={`@${meta.label.toLowerCase()}_bot`}
                        className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
                        value={platform.botName}
                        onChange={(e) => dispatch({
                          type: 'CAPABILITIES_UPDATE_PLATFORM',
                          payload: { id: platform.id, botName: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${{ active: 'bg-emerald-400', inactive: 'bg-white/15', error: 'bg-red-400' }[platform.status] ?? 'bg-white/15'}`} />
                      <span className="font-mono text-[8.5px] text-white/25">
                        {platform.status === 'active' ? 'Conectado' : platform.status === 'error' ? 'Error' : 'Inactivo'}
                      </span>
                    </div>
                    {platform.enabled && platform.token && (
                      <button
                        onClick={() => dispatch({
                          type: 'CAPABILITIES_UPDATE_PLATFORM',
                          payload: { id: platform.id, status: 'active' }
                        })}
                        className="flex items-center gap-1 font-mono text-[8.5px] text-cyan-400/70 hover:text-cyan-400 transition-colors"
                      >
                        <Send className="h-2.5 w-2.5" />
                        Test
                      </button>
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
