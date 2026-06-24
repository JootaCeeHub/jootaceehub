'use client'

import { useState } from 'react'
import {
  RefreshCw, Check, Eye, EyeOff, Activity, Shield, Server, Copy,
  Database, FileText, FlaskConical, Cpu, BookOpen, Layers, Globe,
  GitBranch, Zap, Lock, Unlock, ChevronRight,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { type TestStatus, PROVIDERS, MODEL_PRESETS } from './hermes-constants'
import { HermesSection } from './HermesSection'
import { HermesBackendSection } from './HermesBackendSection'
import { HermesPlatformSection } from './HermesPlatformSection'
import { HermesIntelligenceSection } from './HermesIntelligenceSection'
import { HermesCronSection } from './HermesCronSection'
import { HermesConsoleSection } from './HermesConsoleSection'
import { HermesDesktopConfigSection } from './HermesDesktopConfigSection'

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

const fieldCls = 'w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors'

// ─── Project Domain Control ────────────────────────────────────────────────────

type DomainAccess = { icon: React.ReactNode; label: string; count: number; detail: string; color: string; enabled: boolean }

function DomainAccessRow({ domain, hermesEnabled }: { domain: DomainAccess; hermesEnabled: boolean }) {
  const locked = !hermesEnabled
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${domain.enabled && !locked ? 'border-white/10 bg-white/[0.025]' : 'border-white/5 bg-white/[0.01]'}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${domain.enabled && !locked ? 'border-white/12' : 'border-white/6'}`} style={{ background: domain.enabled && !locked ? `${domain.color}15` : undefined }}>
        <div style={{ color: domain.enabled && !locked ? domain.color : 'rgba(255,255,255,0.2)' }} className="[&>svg]:h-3.5 [&>svg]:w-3.5">{domain.icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-mono text-[10px] font-medium ${domain.enabled && !locked ? 'text-white/70' : 'text-white/30'}`}>{domain.label}</span>
          <span className={`rounded-full border px-1.5 py-px font-mono text-[7.5px] ${domain.enabled && !locked ? 'border-white/10 bg-white/5 text-white/40' : 'border-white/6 text-white/20'}`}>{domain.count}</span>
        </div>
        <div className={`font-mono text-[8px] mt-0.5 ${domain.enabled && !locked ? 'text-white/30' : 'text-white/15'}`}>{locked ? 'Hermes desconectado' : domain.detail}</div>
      </div>
      {locked
        ? <Lock className="h-3 w-3 shrink-0 text-white/15" />
        : <Unlock className="h-3 w-3 shrink-0" style={{ color: domain.enabled ? domain.color : 'rgba(255,255,255,0.15)' }} />
      }
    </div>
  )
}

function ProjectDomainSection({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes
  const connected = hermes?.status === 'connected'

  const pubProjects  = state.projectsRegistry.filter(p => p.published).length
  const totalPrj     = state.projectsRegistry.length
  const pubArticles  = state.researchRegistry.filter(r => r.published).length
  const totalArt     = state.researchRegistry.length
  const visLabs      = state.labsRegistry.filter(l => l.visible).length
  const totalLabs    = state.labsRegistry.length
  const visSys       = state.systemsRegistry.filter(s => s.visible).length
  const totalSys     = state.systemsRegistry.length
  const totalResources = (state.toolRegistry?.length ?? 0) + (state.repoRegistry?.length ?? 0)
  const mcpCount     = state.capabilities.mcpServers?.length ?? 0
  const skillCount   = state.capabilities.skills?.filter(s => s.enabled).length ?? 0

  const domains: DomainAccess[] = [
    { icon: <FileText />, label: 'Proyectos & Research', count: totalPrj + totalArt, detail: `${pubProjects}/${totalPrj} proyectos · ${pubArticles}/${totalArt} artículos`, color: '#a78bfa', enabled: true },
    { icon: <FlaskConical />, label: 'Labs & Sistemas', count: totalLabs + totalSys, detail: `${visLabs}/${totalLabs} labs · ${visSys}/${totalSys} sistemas`, color: '#34d399', enabled: true },
    { icon: <Database />, label: 'Recursos & Registries', count: totalResources, detail: `${totalResources} herramientas, repos y prompts`, color: '#38bdf8', enabled: true },
    { icon: <Layers />, label: 'Bloques & Contenido', count: state.blocks.length, detail: `${state.blocks.filter(b => b.enabled).length}/${state.blocks.length} bloques activos`, color: '#fb923c', enabled: true },
    { icon: <Globe />, label: 'Config & SEO', count: 5, detail: 'Site, SEO, Navbar, Footer, CSP', color: '#fbbf24', enabled: true },
    { icon: <GitBranch />, label: 'GitHub Integration', count: state.githubConfig?.username ? 1 : 0, detail: state.githubConfig?.username ? `@${state.githubConfig.username}` : 'No configurado', color: '#e879f9', enabled: !!state.githubConfig?.username },
    { icon: <Cpu />, label: 'MCP Servers', count: mcpCount, detail: `${mcpCount} servidores configurados`, color: '#f87171', enabled: mcpCount > 0 },
    { icon: <Zap />, label: 'Skills Activas', count: skillCount, detail: `${skillCount} skills habilitadas`, color: '#fb923c', enabled: skillCount > 0 },
  ]

  const accessible = domains.filter(d => d.enabled).length

  const contextFiles = (hermes?.contextFiles ?? 'AGENTS.md,SOUL.md,MEMORY.md').split(',').map(f => f.trim()).filter(Boolean)

  return (
    <HermesSection id="project-domain" title="Dominio del Proyecto" isOpen={isOpen} onToggle={onToggle}>

      {/* Access summary */}
      <div className="rounded-xl border border-cyan-400/12 bg-gradient-to-br from-cyan-400/5 to-violet-400/5 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] font-semibold text-white/75">Control del Proyecto</div>
            <div className="font-mono text-[8.5px] text-white/35 mt-0.5">
              {connected
                ? `Hermes tiene acceso a ${accessible} dominios del proyecto`
                : 'Conecta Hermes para activar el acceso al proyecto'}
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className={`font-mono text-[18px] font-bold ${connected ? 'text-cyan-400' : 'text-white/20'}`}>{connected ? accessible : '—'}</div>
            <div className="font-mono text-[7px] text-white/25">dominios</div>
          </div>
        </div>

        {/* Domain access grid */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {domains.map((d) => (
            <DomainAccessRow key={d.label} domain={d} hermesEnabled={connected} />
          ))}
        </div>
      </div>

      {/* Context files */}
      <div>
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Archivos de contexto</div>
        <div className="flex flex-wrap gap-1.5">
          {contextFiles.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-0.5 font-mono text-[8.5px] text-emerald-400/70">
              <BookOpen className="h-2.5 w-2.5" />{f}
            </span>
          ))}
          <button
            onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { contextFiles: (hermes?.contextFiles ?? '') + ',NEW.md' } })}
            className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[8.5px] text-white/30 transition-colors hover:text-white/55 hover:bg-white/8 cursor-pointer"
          >
            + Añadir
          </button>
        </div>
        <div className="mt-1.5">
          <input
            type="text"
            className={fieldCls}
            value={hermes?.contextFiles ?? ''}
            onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { contextFiles: e.target.value } })}
            placeholder="AGENTS.md,SOUL.md,MEMORY.md"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Acciones rápidas</div>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { label: 'Analizar contenido',    desc: 'Escanea gaps y oportunidades',  color: '#a78bfa' },
            { label: 'Auditar SEO',            desc: 'Meta, keywords, estructura',    color: '#fbbf24' },
            { label: 'Generar showcase',       desc: 'Documentación pública de repos', color: '#34d399' },
            { label: 'Revisar accesibilidad',  desc: 'WCAG 2.1 AA + ARIA check',      color: '#38bdf8' },
            { label: 'Traducir contenido',     desc: 'EN → ES automático',            color: '#fb923c' },
            { label: 'Resumir git log',        desc: 'Changelog de cambios recientes', color: '#e879f9' },
          ] as const).map((action) => (
            <button
              key={action.label}
              disabled={!connected}
              className={`group flex flex-col gap-0.5 rounded-xl border p-2.5 text-left transition-colors ${connected ? 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer' : 'border-white/4 bg-white/[0.01] cursor-not-allowed opacity-50'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9.5px] font-medium text-white/65 group-hover:text-white/85 transition-colors">{action.label}</span>
                <ChevronRight className="h-2.5 w-2.5 text-white/20 group-hover:text-white/50 transition-colors" style={{ color: connected ? action.color : undefined }} />
              </div>
              <span className="font-mono text-[7.5px] text-white/25">{action.desc}</span>
            </button>
          ))}
        </div>
      </div>

    </HermesSection>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

export function HermesTab() {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes

  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(['status', 'console', 'project-domain', 'capabilities', 'desktop-config', 'backend', 'provider', 'portal', 'platforms', 'intelligence', 'cron', 'security'])
  )
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied]         = useState<Record<string, boolean>>({})
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testMsg, setTestMsg]       = useState('')

  if (!hermes) return null

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1800)
    })
  }

  async function testConnection() {
    setTestStatus('testing')
    setTestMsg('')
    try {
      const endpoint = hermes.endpoint.replace(/\/$/, '')
      const res = await fetch(`${endpoint}/v1/models`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        setTestStatus('success')
        setTestMsg('Connected successfully')
        dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'connected', lastConnected: new Date().toISOString() } })
      } else {
        setTestStatus('error')
        setTestMsg(`HTTP ${res.status}`)
        dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'error' } })
      }
    } catch {
      setTestStatus('error')
      setTestMsg('Unreachable')
      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'error' } })
    }
  }

  function toggleConnect() {
    if (hermes.status === 'connected') {
      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { status: 'disconnected', enabled: false } })
    } else {
      dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { enabled: true } })
      testConnection()
    }
  }

  const isOpen = (id: string) => openSections.has(id)
  const tog    = (id: string) => () => toggleSection(id)

  return (
    <div className="space-y-3">

      {/* Status banner */}
      <HermesSection id="status" title="Estado de conexión" isOpen={isOpen('status')} onToggle={tog('status')}>
        <div className="rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/5 via-transparent to-pink-400/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${{ connected: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400', connecting: 'border-amber-400/25 bg-amber-400/8 text-amber-400', disconnected: 'border-white/10 bg-white/3 text-white/30', error: 'border-red-400/25 bg-red-400/8 text-red-400' }[hermes.status] ?? 'border-white/10 bg-white/3 text-white/30'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${{ connected: 'bg-emerald-400 animate-pulse', connecting: 'bg-amber-400 animate-pulse', disconnected: 'bg-white/20', error: 'bg-red-400' }[hermes.status] ?? 'bg-white/20'}`} />
                {hermes.status}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[12px] font-semibold text-white/80">Hermes Agent</div>
                <div className="font-mono text-[9px] text-white/30">{hermes.model}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={testConnection} disabled={testStatus === 'testing'} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/45 transition-colors hover:bg-white/10 hover:text-white/70">
                {testStatus === 'testing' ? 'Testing…' : 'Test'}
              </button>
              <button onClick={toggleConnect} className={`rounded-lg border px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${hermes.status === 'connected' ? 'border-red-400/20 bg-red-400/5 text-red-400/70 hover:bg-red-400/10' : 'border-cyan-400/25 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15'}`}>
                {hermes.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[8.5px] text-white/25">Backend: <span className="text-white/50">{hermes.backend}</span></span>
            <span className="font-mono text-[8.5px] text-white/25">Provider: <span className="text-white/50">{hermes.provider}</span></span>
            {hermes.lastConnected && (
              <span className="font-mono text-[8.5px] text-white/25" suppressHydrationWarning>
                Last connected: <span className="text-white/50">{new Date(hermes.lastConnected).toLocaleString()}</span>
              </span>
            )}
            {testMsg && <span className={`font-mono text-[9px] ${testStatus === 'success' ? 'text-emerald-400' : testStatus === 'error' ? 'text-red-400' : 'text-white/30'}`}>{testMsg}</span>}
          </div>
        </div>
      </HermesSection>

      {/* Console */}
      <HermesConsoleSection isOpen={isOpen('console')} onToggle={tog('console')} />

      {/* Project Domain Control */}
      <ProjectDomainSection isOpen={isOpen('project-domain')} onToggle={tog('project-domain')} />

      {/* Backend */}
      <HermesBackendSection isOpen={isOpen('backend')} onToggle={tog('backend')} copied={copied} onCopy={copyText} />

      {/* Provider & Model */}
      <HermesSection id="provider" title="Proveedor y modelo" isOpen={isOpen('provider')} onToggle={tog('provider')}>
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Endpoint URL</div>
          <input type="text" className={fieldCls} value={hermes.endpoint} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { endpoint: e.target.value } })} placeholder="http://localhost:8000" />
        </div>
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Provider</div>
          <div className="flex flex-wrap gap-1.5">
            {PROVIDERS.map((p) => (
              <button key={p} onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { provider: p } })} className={`rounded-full border px-2.5 py-1 font-mono text-[8.5px] cursor-pointer transition-colors ${hermes.provider === p ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/55'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Model</div>
          <input type="text" className={fieldCls} value={hermes.model} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { model: e.target.value } })} placeholder="nousresearch/hermes-3-llama-3.1-70b" />
          {MODEL_PRESETS[hermes.provider] && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {MODEL_PRESETS[hermes.provider].map((m) => (
                <button key={m} onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { model: m } })} className="rounded-full border border-white/8 bg-white/[0.02] px-2 py-0.5 font-mono text-[8px] text-white/30 cursor-pointer transition-colors hover:border-white/20 hover:text-white/55 hover:bg-white/5">
                  {m.split('/').pop()}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">API Key</div>
          <div className="relative">
            <input type={showApiKey ? 'text' : 'password'} className={fieldCls} value={hermes.apiKey} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { apiKey: e.target.value } })} placeholder="sk-…" />
            <button onClick={() => setShowApiKey((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
              {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={testConnection} disabled={testStatus === 'testing'} className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${testStatus === 'testing' ? 'border-amber-400/25 bg-amber-400/8 text-amber-400 cursor-wait' : testStatus === 'success' ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400' : testStatus === 'error' ? 'border-red-400/25 bg-red-400/8 text-red-400' : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/75'}`}>
            {testStatus === 'testing' ? <><RefreshCw className="h-3 w-3 animate-spin" />Probando...</> : testStatus === 'success' ? <><Check className="h-3 w-3" />Conectado</> : <><Activity className="h-3 w-3" />Test conexión</>}
          </button>
          {testMsg && <span className={`font-mono text-[9px] ${testStatus === 'success' ? 'text-emerald-400' : testStatus === 'error' ? 'text-red-400' : 'text-white/30'}`}>{testMsg}</span>}
        </div>
      </HermesSection>

      {/* Nous Portal */}
      <HermesSection id="portal" title="Nous Portal y Tool Gateway" isOpen={isOpen('portal')} onToggle={tog('portal')}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] text-white/55">Portal de modelos Nous</div>
            <div className="font-mono text-[8.5px] text-white/25">Accede a modelos premium via api.nous.com</div>
          </div>
          <Toggle enabled={hermes.portalEnabled} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { portalEnabled: !hermes.portalEnabled } })} />
        </div>
        {hermes.portalEnabled && (
          <div className="mt-2">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Portal Token</div>
            <input type="password" className={fieldCls} value={hermes.portalToken} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { portalToken: e.target.value } })} placeholder="nousportal_…" />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] text-white/55">Tool Gateway</div>
            <div className="font-mono text-[8.5px] text-white/25">Routes web search (Firecrawl), image gen (FAL), TTS (OpenAI), cloud browser (Browser Use) through your portal subscription</div>
          </div>
          <Toggle enabled={hermes.toolGateway} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { toolGateway: !hermes.toolGateway } })} />
        </div>
        <div>
          <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Quick setup</div>
          <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <code className="font-mono text-[10px] text-emerald-400/80">hermes setup --portal</code>
              <button onClick={() => copyText('portal-setup', 'hermes setup --portal')} className={copied['portal-setup'] ? 'shrink-0 flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400' : 'shrink-0 flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/60 hover:bg-white/8'}>
                {copied['portal-setup'] ? <><Check className="h-2.5 w-2.5" />Done</> : <><Copy className="h-2.5 w-2.5" />Copy</>}
              </button>
            </div>
          </div>
        </div>
      </HermesSection>

      {/* Platform Gateway */}
      <HermesPlatformSection isOpen={isOpen('platforms')} onToggle={tog('platforms')} copied={copied} onCopy={copyText} />

      {/* Intelligence & Memory */}
      <HermesIntelligenceSection isOpen={isOpen('intelligence')} onToggle={tog('intelligence')} />

      {/* Cron Scheduler */}
      <HermesCronSection isOpen={isOpen('cron')} onToggle={tog('cron')} />

      {/* Active Capabilities Matrix */}
      <HermesSection id="capabilities" title="Capacidades Activas" isOpen={isOpen('capabilities')} onToggle={tog('capabilities')}>
        {(() => {
          const activeMCP    = hermes.mcpEnabled ? (state.capabilities.mcpServers?.filter((s: { enabled: boolean }) => s.enabled).length ?? 0) : 0
          const activeSkills = state.capabilities.skills?.filter((s: { enabled: boolean; type: string }) => s.enabled).length ?? 0
          const agentCount   = state.capabilities.skills?.filter((s: { enabled: boolean; type: string }) => s.enabled && s.type === 'agent').length ?? 0
          const skillCount   = state.capabilities.skills?.filter((s: { enabled: boolean; type: string }) => s.enabled && s.type === 'skill').length ?? 0
          const toolCount    = state.capabilities.skills?.filter((s: { enabled: boolean; type: string }) => s.enabled && s.type === 'tool').length ?? 0
          const ccSkills     = state.skillRegistry?.length ?? 0
          const ccBuiltin    = state.skillRegistry?.filter((s: { builtin: boolean }) => s.builtin).length ?? 0

          const capRows = [
            { label: 'MCP Servers',       value: `${activeMCP} activos`,       color: '#38bdf8', enabled: activeMCP > 0,    icon: <Server className="h-3 w-3" /> },
            { label: 'AI Agents',         value: `${agentCount} habilitados`,   color: '#a78bfa', enabled: agentCount > 0,   icon: <Cpu className="h-3 w-3" /> },
            { label: 'Skills',            value: `${skillCount} habilitadas`,   color: '#34d399', enabled: skillCount > 0,   icon: <Layers className="h-3 w-3" /> },
            { label: 'Tools',             value: `${toolCount} habilitadas`,    color: '#fbbf24', enabled: toolCount > 0,    icon: <Zap className="h-3 w-3" /> },
            { label: 'Claude Code',       value: `${ccSkills} commands`,        color: '#fb923c', enabled: ccSkills > 0,     icon: <Database className="h-3 w-3" /> },
            { label: 'Built-in /skills',  value: `${ccBuiltin} built-in`,       color: '#e879f9', enabled: ccBuiltin > 0,   icon: <Globe className="h-3 w-3" /> },
          ]

          const totalActive = activeMCP + activeSkills
          return (
            <div className="space-y-2">
              {/* Total counter */}
              <div className="flex items-center justify-between rounded-xl border border-cyan-400/12 bg-cyan-400/[0.03] px-4 py-2.5">
                <div>
                  <div className="font-mono text-[11px] font-semibold text-white/70">Total capacidades activas</div>
                  <div className="font-mono text-[8.5px] text-white/30 mt-0.5">MCP tools + AI skills + Claude Code commands</div>
                </div>
                <div className="font-mono text-[22px] font-bold text-cyan-400">{totalActive + ccSkills}</div>
              </div>

              {/* Capability rows */}
              <div className="grid grid-cols-2 gap-1.5">
                {capRows.map((cap) => (
                  <div key={cap.label} className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${cap.enabled ? 'border-white/10 bg-white/[0.025]' : 'border-white/5 bg-white/[0.01] opacity-50'}`}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/8" style={{ background: cap.enabled ? `${cap.color}15` : undefined, color: cap.enabled ? cap.color : 'rgba(255,255,255,0.2)' }}>
                      {cap.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[9px] font-medium text-white/60 truncate">{cap.label}</div>
                      <div className="font-mono text-[8px] mt-px" style={{ color: cap.enabled ? cap.color : 'rgba(255,255,255,0.2)' }}>{cap.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enable MCP banner if disabled */}
              {!hermes.mcpEnabled && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-2.5">
                  <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400/60" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] text-amber-400/80">MCP deshabilitado</div>
                    <div className="font-mono text-[8px] text-white/30 mt-0.5">Habilita MCP en la sección Backend para que Hermes use servidores MCP.</div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { mcpEnabled: true } })}
                    className="shrink-0 rounded-lg border border-amber-400/25 bg-amber-400/8 px-2.5 py-1 font-mono text-[8px] text-amber-400 transition-colors hover:bg-amber-400/15"
                  >
                    Enable
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </HermesSection>

      {/* Claude Desktop Config */}
      <HermesDesktopConfigSection isOpen={isOpen('desktop-config')} onToggle={tog('desktop-config')} />

      {/* Security */}
      <HermesSection id="security" title="Seguridad" isOpen={isOpen('security')} onToggle={tog('security')}>
        <div className="space-y-2">
          {([
            { key: 'commandApproval'    as const, label: 'Command Approval',    desc: 'All shell commands require approval before execution',      icon: <Shield className="h-3.5 w-3.5" /> },
            { key: 'containerIsolation' as const, label: 'Container Isolation', desc: 'Run agent in isolated Docker/Singularity container',          icon: <Server className="h-3.5 w-3.5" /> },
          ] as const).map((item) => (
            <div key={item.key} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.015] p-3">
              <div className="mt-0.5 shrink-0 text-white/30">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] font-semibold text-white/60">{item.label}</div>
                <div className="font-mono text-[8.5px] text-white/25 leading-relaxed">{item.desc}</div>
              </div>
              <Toggle enabled={!!hermes[item.key]} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { [item.key]: !hermes[item.key] } })} />
            </div>
          ))}
        </div>
      </HermesSection>

    </div>
  )
}
