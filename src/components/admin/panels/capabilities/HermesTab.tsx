'use client'

import { useState } from 'react'
import {
  RefreshCw, Check, Eye, EyeOff, Activity, Shield, Server, Copy,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { type TestStatus, PROVIDERS, MODEL_PRESETS } from './hermes-constants'
import { HermesSection } from './HermesSection'
import { HermesBackendSection } from './HermesBackendSection'
import { HermesPlatformSection } from './HermesPlatformSection'
import { HermesIntelligenceSection } from './HermesIntelligenceSection'
import { HermesCronSection } from './HermesCronSection'

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

const fieldCls = 'w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors'

export function HermesTab() {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes

  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(['status', 'backend', 'provider', 'portal', 'platforms', 'intelligence', 'cron', 'security'])
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
