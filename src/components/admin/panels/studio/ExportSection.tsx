'use client'

import { useState, useRef, useCallback } from 'react'
import {
  FileJson, Copy, Download, Clipboard, FolderOpen,
  Check, Search, RotateCcw, Activity, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { defaultStudioConfig } from '@/lib/admin/state'
import type { StudioConfig } from '@/lib/admin/types'
import { ALL_PANELS, RESET_SECTIONS, SLabel } from './primitives'

export function ExportSection() {
  const { state, dispatch } = useAdmin()
  const cfg = state.studioConfig

  const [copied,        setCopied]        = useState(false)
  const [presetsCopied, setPresetsCopied] = useState(false)
  const [importMsg,     setImportMsg]     = useState('')
  const [diffInput,     setDiffInput]     = useState('')
  const [diffParsed,    setDiffParsed]    = useState<Partial<StudioConfig> | null>(null)
  const [diffError,     setDiffError]     = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (partial: Partial<typeof cfg>) =>
    dispatch({ type: 'UPDATE_STUDIO', payload: partial })

  const getOverride = (id: typeof ALL_PANELS[number]['id']) =>
    cfg.panelOverrides.find(p => p.id === id)

  const visibleCount = ALL_PANELS.filter(p => getOverride(p.id)?.visible ?? true).length

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(cfg, null, 2)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [cfg])

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `studio-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [cfg])

  const handlePasteImport = useCallback(async () => {
    try {
      const text   = await navigator.clipboard.readText()
      const parsed = JSON.parse(text) as Partial<StudioConfig>
      set(parsed)
      setImportMsg('✓ Imported')
    } catch {
      setImportMsg('✗ Invalid JSON')
    }
    setTimeout(() => setImportMsg(''), 2500)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<StudioConfig>
        set(parsed)
        setImportMsg(`✓ Imported from ${file.name}`)
      } catch {
        setImportMsg('✗ Invalid JSON file')
      }
      setTimeout(() => setImportMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyPresets = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(cfg.customPresets, null, 2)).then(() => {
      setPresetsCopied(true)
      setTimeout(() => setPresetsCopied(false), 1500)
    })
  }, [cfg.customPresets])

  const handleSectionReset = useCallback((keys: (keyof StudioConfig)[]) => {
    const partial = Object.fromEntries(
      keys.map(k => [k, defaultStudioConfig[k]])
    ) as Partial<StudioConfig>
    set(partial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const parseDiff = () => {
    try {
      setDiffParsed(JSON.parse(diffInput) as Partial<StudioConfig>)
      setDiffError('')
    } catch {
      setDiffError('Invalid JSON — check syntax')
      setDiffParsed(null)
    }
  }

  const diffChanges = diffParsed ? Object.entries(diffParsed).filter(([k, v]) =>
    JSON.stringify(cfg[k as keyof StudioConfig]) !== JSON.stringify(v)
  ) : []

  const applyDiff = () => {
    if (!diffParsed) return
    set(diffParsed)
    setDiffInput('')
    setDiffParsed(null)
  }

  // Health check items
  const healthItems: Array<{ label: string; status: 'good' | 'warn' | 'info'; reason: string }> = [
    {
      label: 'Reset protection',
      status: cfg.confirmReset ? 'good' : 'warn',
      reason: cfg.confirmReset
        ? 'Confirm dialog active — resets are safe'
        : 'No confirmation — factory reset is immediate',
    },
    {
      label: 'Auto-save delay',
      status: cfg.autoSaveMs <= 1000 ? 'good' : 'warn',
      reason: `${cfg.autoSaveMs}ms — ${cfg.autoSaveMs <= 800 ? 'responsive' : cfg.autoSaveMs <= 1500 ? 'moderate' : 'slow, risk of data loss on close'}`,
    },
    {
      label: 'Reduced motion',
      status: cfg.reducedMotion ? 'good' : 'info',
      reason: cfg.reducedMotion
        ? 'Enabled — accessible for motion-sensitive users'
        : 'Disabled — animations active (check OS preference)',
    },
    {
      label: 'Panel coverage',
      status: visibleCount >= Math.floor(ALL_PANELS.length * 0.6) ? 'good' : 'warn',
      reason: `${visibleCount}/${ALL_PANELS.length} panels visible`,
    },
    {
      label: 'Keyboard shortcuts',
      status: cfg.keyboardShortcuts ? 'good' : 'info',
      reason: cfg.keyboardShortcuts
        ? '⌘K search and ⌘S save are active'
        : 'Shortcuts disabled — navigation is pointer-only',
    },
    {
      label: 'Workspace profiles',
      status: cfg.workspaceProfiles.length > 0 ? 'good' : 'info',
      reason: cfg.workspaceProfiles.length > 0
        ? `${cfg.workspaceProfiles.length} custom + 4 built-in profiles saved`
        : '4 built-in profiles available — save a custom one for quick recovery',
    },
    {
      label: 'Scrollbar UX',
      status: cfg.scrollbarStyle !== 'hidden' ? 'good' : 'warn',
      reason: cfg.scrollbarStyle === 'hidden'
        ? 'Scrollbar hidden — users may not discover scrollable content'
        : `Scrollbar is ${cfg.scrollbarStyle} — content is discoverable`,
    },
  ]
  const goodCount  = healthItems.filter(i => i.status === 'good').length
  const score      = Math.round((goodCount / healthItems.length) * 100)
  const scoreColor = score >= 85 ? '#34d399' : score >= 60 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="space-y-3">
      <p className="px-1 text-[10px] text-white/30">
        Export, import, or partially reset your studio configuration. All changes live-sync to localStorage.
      </p>

      {/* JSON viewer */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
          <div className="flex items-center gap-2">
            <FileJson className="h-3.5 w-3.5 text-white/35" />
            <span className="text-[10px] font-medium text-white/55">studio-config.json</span>
            <span className="rounded-full border border-white/8 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] text-white/30">
              {JSON.stringify(cfg).length.toLocaleString()} chars
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleCopyJson}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[8.5px] uppercase tracking-wider transition-all',
                copied
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                  : 'border-white/10 text-white/35 hover:border-white/25 hover:text-white/60'
              )}>
              {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[8.5px] uppercase tracking-wider text-white/35 transition-all hover:border-white/25 hover:text-white/60">
              <Download className="h-2.5 w-2.5" />
              Download
            </button>
          </div>
        </div>
        <pre className="max-h-48 overflow-y-auto px-4 py-3 font-mono text-[8.5px] leading-relaxed text-white/35 select-all">
          {JSON.stringify(cfg, null, 2)}
        </pre>
      </div>

      {/* Import from clipboard or file */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Import</SLabel>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={handlePasteImport}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-white/40 transition-all hover:border-cyan-400/20 hover:text-cyan-400/60">
            <Clipboard className="h-3 w-3" />
            Paste from clipboard
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-white/40 transition-all hover:border-white/25 hover:text-white/60">
            <FolderOpen className="h-3 w-3" />
            Import from file
          </button>
          <input
            ref={fileInputRef}
            type="file" accept=".json" onChange={handleFileImport}
            className="sr-only" aria-label="Import studio config from JSON file" />
          {importMsg && (
            <span className={cn(
              'font-mono text-[9.5px]',
              importMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'
            )}>
              {importMsg}
            </span>
          )}
        </div>
      </div>

      {/* Config diff viewer */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Config diff viewer</SLabel>
        <p className="mb-3 text-[9px] text-white/30">
          Paste a JSON config snippet, preview what would change, then apply selectively.
        </p>
        <textarea
          value={diffInput}
          onChange={e => { setDiffInput(e.target.value); setDiffParsed(null); setDiffError('') }}
          placeholder={'{ "backgroundStyle": "void", "accentColor": "#a78bfa" }'}
          rows={3}
          className="w-full resize-none rounded-lg border border-white/8 bg-black/20 px-3 py-2 font-mono text-[9.5px] text-white/60 placeholder:text-white/18 focus:border-cyan-400/30 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={parseDiff} disabled={!diffInput.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/40 transition-all hover:border-white/25 hover:text-white/60 disabled:opacity-30">
            <Search className="h-2.5 w-2.5" />
            Preview changes
          </button>
          {diffError && <span className="font-mono text-[9px] text-red-400">{diffError}</span>}
        </div>
        {diffParsed && (
          <div className="mt-3 space-y-1.5">
            {diffChanges.length === 0 ? (
              <div className="text-[9px] text-white/35">No differences — config already matches.</div>
            ) : (
              <>
                <div className="text-[8.5px] uppercase tracking-widest text-white/30 mb-2">
                  {diffChanges.length} field{diffChanges.length !== 1 ? 's' : ''} would change:
                </div>
                {diffChanges.map(([k, v]) => (
                  <div key={k} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-1.5">
                    <span className="shrink-0 font-mono text-[8.5px] text-white/45">{k}</span>
                    <span className="font-mono text-[8px] text-white/22 line-through truncate">
                      {JSON.stringify(cfg[k as keyof StudioConfig])}
                    </span>
                    <span className="font-mono text-[8px] text-emerald-400/70 truncate">
                      → {JSON.stringify(v)}
                    </span>
                  </div>
                ))}
                <button onClick={applyDiff}
                  className="mt-2 flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-cyan-400 transition-all hover:bg-cyan-400/20">
                  <Check className="h-2.5 w-2.5" />
                  Apply {diffChanges.length} change{diffChanges.length !== 1 ? 's' : ''}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Config health check */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
          <Activity className="h-3.5 w-3.5 text-white/35" />
          <span className="text-[10px] font-medium text-white/55">Config health check</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%`, background: scoreColor }} />
            </div>
            <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: scoreColor }}>
              {score}%
            </span>
          </div>
        </div>
        <div className="divide-y divide-white/4">
          {healthItems.map(item => (
            <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
              <div className={cn(
                'mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[7px] font-bold',
                item.status === 'good' ? 'bg-emerald-400/15 text-emerald-400' :
                item.status === 'warn' ? 'bg-amber-400/15 text-amber-400' :
                'bg-white/8 text-white/35'
              )}>
                {item.status === 'good' ? '✓' : item.status === 'warn' ? '!' : 'i'}
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-medium text-white/60">{item.label}</div>
                <div className="mt-0.5 text-[8.5px] text-white/30 leading-snug">{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2">
          <ShieldCheck className="h-3 w-3 text-white/18" />
          <span className="text-[8.5px] text-white/22">{goodCount}/{healthItems.length} checks passed</span>
        </div>
      </div>

      {/* Partial resets */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Partial reset</SLabel>
        <p className="mb-3 text-[9px] text-white/30">
          Reset individual sections to factory defaults without affecting other settings.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {RESET_SECTIONS.map(({ label, color, keys }) => (
            <button key={label} onClick={() => handleSectionReset(keys)}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left transition-all hover:border-white/18 hover:bg-white/[0.04]">
              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
              <div>
                <div className="text-[9.5px] font-medium text-white/55">{label}</div>
                <div className="font-mono text-[7.5px] text-white/22">{keys.length} settings</div>
              </div>
              <RotateCcw className="ml-auto h-3 w-3 text-white/18 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Export custom presets */}
      {cfg.customPresets.length > 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
          <SLabel>Export custom presets</SLabel>
          <button onClick={handleCopyPresets}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9.5px] uppercase tracking-wider transition-all',
              presetsCopied
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400'
                : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'
            )}>
            {presetsCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {presetsCopied ? 'Copied!' : `Copy presets JSON (${cfg.customPresets.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
