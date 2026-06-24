'use client'

import { useState } from 'react'
import { Check, Copy, Download, AlertTriangle, Info } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { HermesSection } from './HermesSection'
import type { MCPServer, ResourceMcpItem } from '@/lib/admin/types'

interface Props { isOpen: boolean; onToggle: () => void }

const PROJECT_PATH = '/home/jootacee/Documentos/PROYECTOS/JOOTACEEHUB'

// Maps package → additional args or env vars needed
const MCP_EXTRA: Record<string, { args?: string[]; env?: Record<string, string>; note?: string }> = {
  '@modelcontextprotocol/server-filesystem':   { args: [PROJECT_PATH], note: 'Acceso de lectura/escritura a la ruta del proyecto' },
  '@modelcontextprotocol/server-github':        { env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_...' }, note: 'Necesita PAT con repo, read:user' },
  '@modelcontextprotocol/server-gdrive':        { env: { GDRIVE_OAUTH_PATH: '~/.gdrive-oauth.json' } },
  '@modelcontextprotocol/server-brave-search':  { env: { BRAVE_API_KEY: 'BSA...' } },
  '@modelcontextprotocol/server-google-maps':   { env: { GOOGLE_MAPS_API_KEY: 'AIza...' } },
  'tavily-mcp':                                  { env: { TAVILY_API_KEY: 'tvly-...' } },
  'firecrawl-mcp':                               { env: { FIRECRAWL_API_KEY: 'fc-...' } },
  'exa-mcp-server':                              { env: { EXA_API_KEY: 'exa-...' } },
  'mcp-server-slack':                            { env: { SLACK_BOT_TOKEN: 'xoxb-...' } },
  'mcp-server-gmail':                            { env: { GMAIL_OAUTH_PATH: '~/.gmail-oauth.json' } },
  '@stripe/agent-toolkit':                       { env: { STRIPE_SECRET_KEY: 'sk_...' } },
  '@linear/mcp-server':                          { env: { LINEAR_API_KEY: 'lin_api_...' } },
  '@cloudflare/mcp-server-cloudflare':           { env: { CLOUDFLARE_API_TOKEN: 'cf_...' } },
  '@vercel/mcp-server':                          { env: { VERCEL_TOKEN: 'vrt_...' } },
  'mcp-server-sentry':                           { env: { SENTRY_AUTH_TOKEN: 'sntrys_...' }, args: ['--org', 'your-org'] },
  '@neondatabase/mcp-server-neon':               { env: { NEON_API_KEY: 'neon_...' } },
  '@upstash/mcp-server':                         { env: { UPSTASH_REDIS_REST_URL: 'https://...', UPSTASH_REDIS_REST_TOKEN: '...' } },
  'mcp-server-github-actions':                   { env: { GITHUB_TOKEN: 'ghp_...' } },
}

function parseInstall(install: string): { pkg: string; extraArgs: string[] } {
  const parts = install.replace(/^npx\s+/, '').trim().split(/\s+/)
  return { pkg: parts[0], extraArgs: parts.slice(1) }
}

function buildServerEntry(server: MCPServer, regEntry: ResourceMcpItem | undefined) {
  if (!regEntry) {
    if (server.transport === 'http' || server.transport === 'sse') {
      return { type: server.transport, url: server.url || 'http://localhost:8000' }
    }
    return { command: 'npx', args: ['-y', server.name] }
  }
  const { pkg, extraArgs } = parseInstall(regEntry.install)
  const extra = MCP_EXTRA[pkg] ?? {}
  const args = ['-y', pkg, ...extraArgs, ...(extra.args ?? [])]
  const entry: Record<string, unknown> = { command: 'npx', args }
  if (extra.env && Object.keys(extra.env).length > 0) {
    entry.env = extra.env
  }
  return entry
}

export function HermesDesktopConfigSection({ isOpen, onToggle }: Props) {
  const { state } = useAdmin()
  const [copied,      setCopied]      = useState(false)
  const [showAll,     setShowAll]     = useState(false)
  const [filterNote,  setFilterNote]  = useState(false)

  const mcpServers = state.capabilities.mcpServers as MCPServer[]
  const registry   = (state.mcpRegistry ?? []) as ResourceMcpItem[]

  const activeServers = showAll ? mcpServers : mcpServers.filter(s => s.enabled)

  const configObj: Record<string, unknown> = {}
  const warnings: { name: string; note: string }[] = []

  activeServers.forEach(server => {
    const regEntry = registry.find(r => r.name.toLowerCase() === server.name.toLowerCase())
    const key = server.name.replace(/[^a-zA-Z0-9_-]/g, '-')
    const entry = buildServerEntry(server, regEntry)
    configObj[key] = entry

    if (regEntry) {
      const { pkg } = parseInstall(regEntry.install)
      const extra = MCP_EXTRA[pkg]
      if (extra?.note) warnings.push({ name: server.name, note: extra.note })
    }
  })

  const fullConfig = { mcpServers: configObj }
  const jsonStr    = JSON.stringify(fullConfig, null, 2)

  const displayed = filterNote ? warnings : undefined

  function copyConfig() {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function downloadConfig() {
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'claude_desktop_config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <HermesSection id="desktop-config" title="Claude Desktop Config" isOpen={isOpen} onToggle={onToggle}>

      {/* Header info */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-400/12 bg-blue-400/[0.03] px-3 py-2.5">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400/60" />
        <div className="min-w-0">
          <div className="font-mono text-[9px] text-white/55">Pega este JSON en <code className="text-blue-400/80">~/.config/claude/claude_desktop_config.json</code></div>
          <div className="font-mono text-[8px] text-white/30 mt-0.5">
            {activeServers.length} servidor{activeServers.length !== 1 ? 'es' : ''} · Proyecto: <span className="text-white/45">{PROJECT_PATH}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowAll(v => !v)}
          className={`rounded-full border px-2.5 py-1 font-mono text-[8.5px] transition-colors cursor-pointer ${showAll ? 'border-violet-400/30 bg-violet-400/10 text-violet-400' : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55'}`}
        >
          {showAll ? `Todos (${mcpServers.length})` : `Solo activos (${activeServers.length})`}
        </button>
        <button
          onClick={() => setFilterNote(v => !v)}
          className={`rounded-full border px-2.5 py-1 font-mono text-[8.5px] transition-colors cursor-pointer ${filterNote ? 'border-amber-400/30 bg-amber-400/8 text-amber-400' : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/55'}`}
        >
          {warnings.length > 0 ? `⚠ ${warnings.length} req. auth` : 'Sin alerts'}
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={downloadConfig}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[8.5px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/65"
          >
            <Download className="h-3 w-3" />JSON
          </button>
          <button
            onClick={copyConfig}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[8.5px] transition-colors ${copied ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border-cyan-400/25 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15'}`}
          >
            {copied ? <><Check className="h-3 w-3" />Copiado</> : <><Copy className="h-3 w-3" />Copiar</>}
          </button>
        </div>
      </div>

      {/* Warnings */}
      {(displayed ?? warnings).length > 0 && (
        <div className="space-y-1">
          {(displayed ?? warnings).map(w => (
            <div key={w.name} className="flex items-start gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-1.5">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-amber-400/60" />
              <div className="min-w-0">
                <span className="font-mono text-[9px] text-amber-400/80">{w.name}</span>
                <span className="font-mono text-[8px] text-white/35 ml-2">{w.note}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JSON preview */}
      {activeServers.length === 0 ? (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] py-6 text-center font-mono text-[9px] text-white/25">
          No hay servidores activos. Habilita servidores en la pestaña MCP.
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-white/8 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/6 px-3 py-1.5">
            <span className="font-mono text-[8px] text-white/25">claude_desktop_config.json</span>
            <span className="font-mono text-[7.5px] text-white/18">{jsonStr.split('\n').length} líneas</span>
          </div>
          <pre className="max-h-80 overflow-y-auto p-3 font-mono text-[8.5px] text-white/55 leading-relaxed" style={{ scrollbarWidth: 'thin' }}>
            {jsonStr}
          </pre>
        </div>
      )}

      {/* Per-server list with auth status */}
      {activeServers.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="border-b border-white/6 px-4 py-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Estado por servidor</span>
          </div>
          <div className="divide-y divide-white/5">
            {activeServers.map(server => {
              const regEntry = registry.find(r => r.name.toLowerCase() === server.name.toLowerCase())
              const pkg   = regEntry ? parseInstall(regEntry.install).pkg : null
              const extra = pkg ? MCP_EXTRA[pkg] : undefined
              const needsAuth = extra?.env && Object.keys(extra.env).length > 0
              return (
                <div key={server.id} className="flex items-center gap-3 px-4 py-2">
                  <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${server.enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] text-white/60">{server.name}</span>
                    {regEntry && <span className="ml-2 font-mono text-[7.5px] text-white/25">{regEntry.toolCount} tools</span>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {needsAuth && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/6 px-1.5 py-0.5 font-mono text-[7.5px] text-amber-400/70">
                        env vars
                      </span>
                    )}
                    <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase ${server.transport === 'stdio' ? 'border-violet-400/20 bg-violet-400/6 text-violet-400/60' : 'border-sky-400/20 bg-sky-400/6 text-sky-400/60'}`}>
                      {server.transport}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </HermesSection>
  )
}
