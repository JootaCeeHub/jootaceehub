'use client'

import { useState, useCallback } from 'react'
import {
  Sparkles,
  FileText,
  Megaphone,
  Network,
  List,
  Layers,
  Copy,
  Check,
  Download,
  RefreshCw,
  ChevronDown,
  RotateCcw,
  Bot,
  GitBranch,
  File,
  Link,
  Database,
  Archive,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { DataSource } from '@/lib/admin/types'
import { SOURCE_TYPE_META } from '@/lib/integrations/sources'
import { generateShowcase, DEFAULT_SHOWCASE_PROMPT } from '@/lib/showcase/agent'
import { PROVIDER_ACCENT } from '@/lib/ai/providers'

// ─── Tab definitions ──────────────────────────────────────────────────────────

type DocTab = 'readme' | 'showcase' | 'architecture' | 'features' | 'stack'

const TABS: { id: DocTab; label: string; icon: React.ComponentType<{ className?: string }>; filename: string }[] = [
  { id: 'readme',       label: 'README',        icon: FileText,   filename: 'README-PUBLIC.md'  },
  { id: 'showcase',     label: 'Showcase',       icon: Megaphone,  filename: 'SHOWCASE.md'       },
  { id: 'architecture', label: 'Architecture',   icon: Network,    filename: 'ARCHITECTURE.md'   },
  { id: 'features',     label: 'Features',       icon: List,       filename: 'FEATURES.md'       },
  { id: 'stack',        label: 'Stack',          icon: Layers,     filename: 'STACK.md'          },
]

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'github-repo': GitBranch,
  'file':        File,
  'url':         Link,
  'database':    Database,
  'archive':     Archive,
  'folder':      FolderOpen,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShowcasePanel() {
  const { state, dispatch } = useAdmin()
  const { dataSources } = state.integrations
  const { profiles, activeProfileId } = state.aiConfig
  const { skills } = state.capabilities

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DocTab>('readme')
  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfileId ?? profiles[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedTab, setCopiedTab] = useState<DocTab | null>(null)
  const [agentOpen, setAgentOpen] = useState(false)
  const [customPrompt, setCustomPrompt] = useState<string | null>(null)
  const [promptSaved, setPromptSaved] = useState(false)

  const selected = dataSources.find((s) => s.id === selectedId) ?? null
  const activeProfile = profiles.find((p) => p.id === selectedProfileId) ?? null
  const showcaseAgent = skills.find((s) => s.id === 'showcase-generator')

  const effectivePrompt = customPrompt ?? showcaseAgent?.systemPrompt ?? DEFAULT_SHOWCASE_PROMPT

  // ── Generation ──────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!selected || !activeProfile) return
    setLoading(true)
    setError(null)
    try {
      const output = await generateShowcase({
        source: selected,
        profile: activeProfile,
        systemPrompt: effectivePrompt,
      })
      dispatch({ type: 'SOURCES_SET_SHOWCASE', payload: { id: selected.id, output } })
      setActiveTab('readme')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [selected, activeProfile, effectivePrompt, dispatch])

  // ── Copy / Download ─────────────────────────────────────────────────────────

  const handleCopy = useCallback((tab: DocTab, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedTab(tab)
      setTimeout(() => setCopiedTab(null), 2000)
    })
  }, [])

  const handleDownload = useCallback((filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleDownloadAll = useCallback((source: DataSource) => {
    if (!source.showcaseOutput) return
    const { readme, showcase, architecture, features, stack } = source.showcaseOutput
    const pairs: [string, string][] = [
      ['README-PUBLIC.md', readme],
      ['SHOWCASE.md', showcase],
      ['ARCHITECTURE.md', architecture],
      ['FEATURES.md', features],
      ['STACK.md', stack],
    ]
    for (const [filename, content] of pairs) {
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${source.name}_${filename}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [])

  // ── Agent prompt save ────────────────────────────────────────────────────────

  const handleSavePrompt = useCallback(() => {
    setPromptSaved(true)
    setTimeout(() => setPromptSaved(false), 2000)
  }, [])

  const handleResetPrompt = useCallback(() => {
    setCustomPrompt(null)
  }, [])

  // ── Sidebar source count ─────────────────────────────────────────────────────

  const withShowcase = dataSources.filter((s) => s.showcaseOutput).length

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full gap-0 overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="flex w-64 shrink-0 flex-col border-r border-white/8">
        <div className="border-b border-white/8 px-3 py-2.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Data Sources</div>
          <div className="mt-0.5 font-mono text-[9px] text-white/20">
            {dataSources.length} total · {withShowcase} generados
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {dataSources.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="font-mono text-[10px] text-white/20">Sin fuentes conectadas</div>
              <div className="mt-1 font-mono text-[9px] text-cyan-400/60">Agrega en Integraciones →</div>
            </div>
          ) : (
            dataSources.map((src) => {
              const active = src.id === selectedId
              const Icon = SOURCE_ICONS[src.type] ?? File
              const typeMeta = SOURCE_TYPE_META[src.type]
              return (
                <div
                  key={src.id}
                  className={cn(
                    'group relative cursor-pointer px-3 py-2.5 transition-colors',
                    active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                  )}
                  onClick={() => { setSelectedId(src.id); setError(null) }}
                >
                  <div className={cn(
                    'absolute left-0 top-0 bottom-0 w-0.5 transition-all',
                    active ? 'bg-cyan-400' : 'bg-transparent'
                  )} />
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[11px] font-semibold text-white/75">{src.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className="rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                          style={{ color: typeMeta.accent, borderColor: `${typeMeta.accent}30` }}
                        >
                          {typeMeta.label}
                        </span>
                        {src.showcaseOutput && (
                          <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/20">
                            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
              <Sparkles className="h-7 w-7 text-white/20" />
            </div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/25">Showcase Generator</div>
            <div className="max-w-xs text-center font-mono text-[10px] leading-relaxed text-white/15">
              Selecciona una fuente en el panel izquierdo para generar su versión pública con 5 documentos listos para publicar.
            </div>
            <div className="font-mono text-[9px] text-cyan-400/40">← selecciona un repo o fuente</div>
          </div>
        ) : (
          <>
            {/* Source header */}
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                {(() => { const Icon = SOURCE_ICONS[selected.type] ?? File; return <Icon className="h-4 w-4 text-white/40" /> })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-mono text-[13px] font-semibold text-white/85">{selected.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  {selected.metadata.language && (
                    <span className="font-mono text-[9px] text-white/35">{selected.metadata.language as string}</span>
                  )}
                  {selected.metadata.stars !== undefined && (
                    <span className="font-mono text-[9px] text-white/25">★ {selected.metadata.stars as number}</span>
                  )}
                  <span className={selected.metadata.isPrivate
                    ? 'rounded-full border border-amber-400/25 px-1.5 py-0.5 font-mono text-[8px] uppercase text-amber-400/60'
                    : 'rounded-full border border-emerald-400/25 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-400/60'
                  }>
                    {selected.metadata.isPrivate ? 'Private' : 'Public'}
                  </span>
                  {selected.byteSize > 0 && (
                    <span className="font-mono text-[9px] text-white/25">
                      {(selected.byteSize / 1024).toFixed(1)} KB indexado
                    </span>
                  )}
                </div>
              </div>
              {selected.showcaseOutput && (
                <button
                  onClick={() => handleDownloadAll(selected)}
                  className="flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/8 px-3 py-1.5 font-mono text-[9px] text-violet-400 transition-colors hover:bg-violet-400/15"
                >
                  <Download className="h-3 w-3" />
                  Descargar todo
                </button>
              )}
            </div>

            {/* Controls bar */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-black/20 px-5 py-2.5">
              {/* Model selector */}
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/55 outline-none focus:border-white/20"
                style={{ color: activeProfile ? PROVIDER_ACCENT[activeProfile.provider] : undefined }}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>

              {/* Agent pill */}
              <div className="flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/8 px-2.5 py-1 font-mono text-[9px] text-violet-400">
                <Bot className="h-3 w-3" />
                {showcaseAgent?.name ?? 'Showcase Agent'}
              </div>

              <div className="flex-1" />

              {/* Re-generate if already has output */}
              {selected.showcaseOutput && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[9px] text-white/35 transition-colors hover:border-white/20 hover:text-white/60"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerar
                </button>
              )}

              {/* Primary generate */}
              <button
                onClick={handleGenerate}
                disabled={loading || !activeProfile}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-4 py-1.5 font-mono text-[11px] transition-all',
                  loading
                    ? 'cursor-not-allowed border-white/8 bg-white/[0.03] text-white/25'
                    : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/18'
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? 'Generando…' : selected.showcaseOutput ? 'Generar de nuevo' : 'Generar showcase'}
              </button>
            </div>

            {/* Progress bar while loading */}
            {loading && (
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/8 bg-black/10">
                <div className="flex-1 h-0.5 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full bg-cyan-400/60 animate-pulse" style={{ width: '100%' }} />
                </div>
                <span className="font-mono text-[9px] text-white/30">El agente está analizando el repositorio…</span>
              </div>
            )}

            {/* Error bar */}
            {error && (
              <div className="flex items-center gap-2 border-b border-red-400/15 bg-red-400/5 px-5 py-2">
                <span className="flex-1 font-mono text-[10px] text-red-400/80">{error}</span>
                <button onClick={() => setError(null)} className="font-mono text-[9px] text-red-400/50 hover:text-red-400">✕</button>
              </div>
            )}

            {/* Output area */}
            {selected.showcaseOutput ? (
              <>
                <div className="flex gap-0 border-b border-white/8 px-5">
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        className={cn(
                          'relative flex items-center gap-1.5 px-3 pb-2 pt-1 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors',
                          active ? 'text-white/80' : 'text-white/25 hover:text-white/50'
                        )}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400" />}
                        <Icon className="h-3 w-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto px-5 py-4">
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-white/65">
                      {selected.showcaseOutput[activeTab]}
                    </pre>
                  </div>
                </div>

                {/* Per-tab toolbar */}
                <div className="flex items-center gap-2 border-t border-white/8 bg-black/20 px-5 py-2">
                  <span className="flex-1 font-mono text-[9px] text-white/25">
                    {TABS.find((t) => t.id === activeTab)?.filename}
                  </span>
                  <button
                    onClick={() => handleCopy(activeTab, selected.showcaseOutput![activeTab])}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[9px] transition-all',
                      copiedTab === activeTab
                        ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                        : 'border-white/10 text-white/35 hover:border-white/20 hover:text-white/60'
                    )}
                  >
                    {copiedTab === activeTab ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedTab === activeTab ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => handleDownload(
                      `${selected.name}_${TABS.find((t) => t.id === activeTab)?.filename ?? activeTab + '.md'}`,
                      selected.showcaseOutput![activeTab]
                    )}
                    className="flex items-center gap-1.5 rounded-lg border border-violet-400/15 px-2.5 py-1 font-mono text-[9px] text-violet-400/60 transition-colors hover:bg-violet-400/8 hover:text-violet-400"
                  >
                    <Download className="h-3 w-3" />
                    .md
                  </button>
                </div>

                {/* Generation metadata */}
                <div className="flex items-center gap-2 border-t border-white/8 bg-black/20 px-5 py-1.5">
                  <span className="font-mono text-[8px] text-white/20">
                    Generado {new Date(selected.showcaseOutput.generatedAt).toLocaleString()}
                  </span>
                  <span className="ml-auto font-mono text-[8px] text-white/15">{selected.showcaseOutput.modelUsed}</span>
                </div>
              </>
            ) : (
              !loading && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
                    <Sparkles className="h-7 w-7 text-white/15" />
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/25">Sin documentos generados</div>
                  <div className="max-w-xs text-center font-mono text-[10px] leading-relaxed text-white/15">
                    Pulsa &ldquo;Generar showcase&rdquo; para que el agente analice este repositorio y produzca la versión pública.
                  </div>
                </div>
              )
            )}
          </>
        )}

        {/* ── Agent config drawer ── */}
        <div className="border-t border-white/8">
          <button
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[0.02]"
            onClick={() => setAgentOpen((v) => !v)}
          >
            <Bot className="h-3 w-3 text-violet-400/60" />
            <span className="flex-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
              Configuración del agente
            </span>
            <ChevronDown
              className="h-3 w-3 text-white/20 transition-transform"
              style={{ transform: agentOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>

          {agentOpen && (
            <div className="border-t border-white/8 bg-black/10 px-4 pb-3 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[9px] text-white/30">System prompt activo</span>
                {customPrompt && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/8 px-1.5 py-0.5 font-mono text-[8px] text-amber-400">
                    Personalizado
                  </span>
                )}
                {!customPrompt && (
                  <span className="rounded-full border border-violet-400/20 bg-violet-400/8 px-1.5 py-0.5 font-mono text-[8px] text-violet-400">
                    Built-in
                  </span>
                )}
              </div>
              <textarea
                rows={8}
                className="mt-2 max-h-48 w-full resize-none rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-[10px] leading-relaxed text-white/50 placeholder-white/15 outline-none focus:border-white/20"
                value={customPrompt ?? effectivePrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                spellCheck={false}
              />
              <div className="flex items-center gap-0">
                <button onClick={handleSavePrompt} className="mt-2 flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/8 px-3 py-1 font-mono text-[9px] text-cyan-400 transition-colors hover:bg-cyan-400/15">
                  {promptSaved ? <Check className="h-3 w-3" /> : <Check className="h-3 w-3 opacity-0" />}
                  {promptSaved ? 'Guardado' : 'Aplicar prompt'}
                </button>
                {customPrompt && (
                  <button onClick={handleResetPrompt} className="mt-2 ml-2 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1 font-mono text-[9px] text-white/30 transition-colors hover:text-white/55">
                    <RotateCcw className="h-3 w-3" />
                    Restaurar built-in
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
