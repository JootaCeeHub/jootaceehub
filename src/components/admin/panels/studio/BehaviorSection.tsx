'use client'

import { cn } from '@/lib/utils'
import { Sidebar, RefreshCw, Accessibility, Clock } from 'lucide-react'
import type { StudioConfig } from '@/lib/admin/types'
import { SLabel, Row, Toggle } from './primitives'

interface Props {
  cfg: StudioConfig
  set: (partial: Partial<StudioConfig>) => void
}

export function BehaviorSection({ cfg, set }: Props) {
  return (
    <div className="space-y-3">
      {/* General */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
        <Row label="Animations" hint="Framer Motion transitions throughout the interface">
          <Toggle value={cfg.animations} onChange={v => set({ animations: v })} />
        </Row>
        <Row label="Show descriptions" hint="Display subtitle text under panel names in the sidebar">
          <Toggle value={cfg.showDescriptions} onChange={v => set({ showDescriptions: v })} />
        </Row>
        <Row label="Show tooltips" hint="Hover tooltips on sidebar buttons when collapsed">
          <Toggle value={cfg.showTooltips} onChange={v => set({ showTooltips: v })} />
        </Row>
        <Row label="Remember last panel" hint="Restore the active panel when Command Center reopens">
          <Toggle value={cfg.rememberLastPanel} onChange={v => set({ rememberLastPanel: v })} />
        </Row>
        <Row label="Keyboard shortcuts" hint="Cmd+K search, Cmd+S save, and other bindings">
          <Toggle value={cfg.keyboardShortcuts} onChange={v => set({ keyboardShortcuts: v })} />
        </Row>
        <Row label="Save indicator" hint="Show 'Saved' confirmation badge in the header">
          <Toggle value={cfg.showSavedIndicator} onChange={v => set({ showSavedIndicator: v })} />
        </Row>
        <Row label="Confirm reset" hint="Show confirmation dialog before resetting to factory defaults">
          <Toggle value={cfg.confirmReset} onChange={v => set({ confirmReset: v })} />
        </Row>
      </div>

      {/* Panel transition */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Panel transition</SLabel>
        <p className="mb-3 text-[9px] text-white/30">Animation style when switching between panels</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'fade',  label: 'Fade',       desc: 'Opacity in from below'     },
            { value: 'slide', label: 'Slide',      desc: 'Horizontal slide-in'        },
            { value: 'scale', label: 'Scale',      desc: 'Subtle zoom-in effect'      },
            { value: 'none',  label: 'Instant',    desc: 'No animation at all'        },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => set({ panelTransition: opt.value })}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition-all',
                cfg.panelTransition === opt.value
                  ? 'border-cyan-400/30 bg-cyan-400/8'
                  : 'border-white/8 bg-white/[0.025] hover:border-white/18'
              )}>
              <div className={cn('text-[10px] font-medium', cfg.panelTransition === opt.value ? 'text-cyan-400' : 'text-white/60')}>
                {opt.label}
              </div>
              <div className="mt-0.5 text-[8.5px] text-white/28">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Animation speed */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Animation speed</SLabel>
        <p className="mb-3 text-[9px] text-white/30">Global multiplier for all panel transition durations</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'slow',   label: 'Slow',   desc: '×2.5 — 300–375ms' },
            { value: 'normal', label: 'Normal', desc: '×1 — 120–150ms'   },
            { value: 'fast',   label: 'Fast',   desc: '×0.4 — 48–60ms'   },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => set({ animationSpeed: opt.value })}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition-all',
                cfg.animationSpeed === opt.value
                  ? 'border-cyan-400/30 bg-cyan-400/8'
                  : 'border-white/8 bg-white/[0.025] hover:border-white/18'
              )}>
              <div className={cn('text-[10px] font-medium', cfg.animationSpeed === opt.value ? 'text-cyan-400' : 'text-white/60')}>
                {opt.label}
              </div>
              <div className="mt-0.5 font-mono text-[8px] text-white/28">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar extras */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
        <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
          <Sidebar className="h-3 w-3 text-white/25" />
          <span className="text-[9.5px] uppercase tracking-widest text-white/30">Sidebar extras</span>
        </div>
        <div className="divide-y divide-white/5">
          <Row label="Panel count badges" hint="Show total panel count next to each nav group label">
            <Toggle value={cfg.showPanelBadges} onChange={v => set({ showPanelBadges: v })} />
          </Row>
          <Row label="Sidebar footer strip" hint="Show version number and last-saved time below the collapse button">
            <Toggle value={cfg.sidebarFooter} onChange={v => set({ sidebarFooter: v })} />
          </Row>
        </div>
      </div>

      {/* Startup */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
        <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
          <RefreshCw className="h-3 w-3 text-white/25" />
          <span className="text-[9.5px] uppercase tracking-widest text-white/30">Startup & sidebar</span>
        </div>
        <div className="divide-y divide-white/5">
          <Row label="Start sidebar collapsed" hint="Open Command Center with sidebar in icon-only mode">
            <Toggle value={cfg.sidebarCollapsedDefault} onChange={v => set({ sidebarCollapsedDefault: v })} />
          </Row>
          <Row label="Hover to expand" hint="When collapsed, hovering the sidebar temporarily reveals full labels">
            <Toggle value={cfg.sidebarHoverExpand} onChange={v => set({ sidebarHoverExpand: v })} />
          </Row>
          <Row label="Clock in header" hint="Display a live HH:MM:SS clock next to the panel breadcrumb">
            <div className="flex items-center gap-2">
              {cfg.headerShowClock && (
                <span className="flex items-center gap-1 font-mono text-[8.5px] text-white/30">
                  <Clock className="h-2.5 w-2.5" /> 12:34
                </span>
              )}
              <Toggle value={cfg.headerShowClock} onChange={v => set({ headerShowClock: v })} />
            </div>
          </Row>
        </div>
      </div>

      {/* Accessibility */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1">
        <div className="flex items-center gap-2 py-2.5 border-b border-white/5">
          <Accessibility className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[9.5px] uppercase tracking-widest text-white/30">Accessibility</span>
        </div>
        <div className="divide-y divide-white/5">
          <Row label="Reduced motion" hint="Disable all panel transition animations">
            <Toggle value={cfg.reducedMotion} onChange={v => set({ reducedMotion: v })} />
          </Row>
          <Row label="High contrast" hint="Increase sidebar text opacity for improved readability">
            <Toggle value={cfg.highContrast} onChange={v => set({ highContrast: v })} />
          </Row>
        </div>
      </div>

      {/* Auto-save */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10.5px] font-medium text-white/70">Auto-save delay</div>
            <div className="mt-0.5 text-[9px] text-white/28">Debounce interval before writing to localStorage</div>
          </div>
          <span className="font-mono text-[10.5px] tabular-nums text-white/50">{cfg.autoSaveMs}ms</span>
        </div>
        <input type="range" min={200} max={3000} step={100} value={cfg.autoSaveMs}
          onChange={e => set({ autoSaveMs: Number(e.target.value) })}
          className="w-full h-1 rounded-full accent-cyan-400" />
        <div className="mt-1.5 flex justify-between text-[8.5px] text-white/20">
          <span>200ms — instant</span><span>3000ms — slow</span>
        </div>
      </div>

      {/* Header actions */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <div className="mb-3 text-[10.5px] font-medium text-white/70">Header quick actions</div>
        <div className="space-y-2">
          {([
            { key: 'showSearch' as const, label: 'Search',  hint: 'Opens smart search (Cmd+K)'  },
            { key: 'showExport' as const, label: 'Export',  hint: 'Export full config as JSON'  },
            { key: 'showImport' as const, label: 'Import',  hint: 'Load config from JSON file'  },
            { key: 'showBackup' as const, label: 'Backup',  hint: 'Save admin-defaults.json'    },
            { key: 'showReset'  as const, label: 'Reset',   hint: 'Reset to factory defaults'   },
          ]).map(({ key, label, hint }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/4 last:border-0">
              <div>
                <div className="text-[10px] text-white/60">{label}</div>
                <div className="text-[8.5px] text-white/25">{hint}</div>
              </div>
              <Toggle value={cfg.headerActions[key]} onChange={v => set({ headerActions: { ...cfg.headerActions, [key]: v } })} />
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts ref */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <div className="mb-3 text-[10.5px] font-medium text-white/70">Keyboard shortcuts</div>
        <div className="space-y-2">
          {([
            { keys: ['⌘', 'K'],  action: 'Open smart search'         },
            { keys: ['⌘', 'S'],  action: 'Save configuration'        },
            { keys: ['Esc'],     action: 'Close search / overlay'    },
            { keys: ['↑', '↓'],  action: 'Navigate search results'  },
            { keys: ['↵'],       action: 'Select / go to panel'     },
          ]).map(({ keys, action }) => (
            <div key={action} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
              <span className="text-[9.5px] text-white/45">{action}</span>
              <div className="flex items-center gap-1">
                {keys.map(k => (
                  <kbd key={k} className="rounded border border-white/12 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/45">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
