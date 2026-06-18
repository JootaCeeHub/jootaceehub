'use client'
// Sub-files handle tab content — each calls useAdmin() directly

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import { ReposTab } from './github/ReposSection'
import { StarredTab } from './github/ActivitySection'
import { DisplayTab, ExportTab, ProfileTab } from './github/StatsSection'
import { PageBuilderTab } from './github/PageBuilderSection'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'builder' | 'profile' | 'repos' | 'starred' | 'display' | 'export'

const TABS: { id: Tab; label: string }[] = [
  { id: 'builder', label: '🏗 Página' },
  { id: 'profile', label: 'Perfil' },
  { id: 'repos',   label: 'Repos' },
  { id: 'starred', label: '⭐ Starred' },
  { id: 'display', label: 'Display' },
  { id: 'export',  label: 'Export' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GitHubLayerPanel() {
  const { state } = useAdmin()
  const { githubConfig: gc } = state
  const [tab, setTab] = useState<Tab>('builder')

  const pinnedCount = gc.displayRepos.filter((r) => gc.repoMeta[r]?.pinned).length
  const totalStars  = gc.displayRepos.reduce((s, r) => s + (gc.repoMeta[r]?.stars ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-pink-400/60">GitHub Layer</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Code Intelligence</h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          @{gc.username} · {gc.displayRepos.length} showcase repos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Showcase Repos', value: gc.displayRepos.length, color: '#f472b6' },
          { label: 'Pinned',         value: pinnedCount,             color: '#a78bfa' },
          { label: 'Total Stars',    value: totalStars,              color: '#f59e0b' },
          { label: 'Activity',       value: gc.showActivity ? 'On' : 'Off', color: '#34d399' },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
            <div className="text-[15px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
            <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            'flex-1 rounded-lg py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors',
            tab === t.id ? 'bg-pink-400/15 text-pink-400 border border-pink-400/20' : 'text-white/30 hover:text-white/55'
          )}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'builder' && <PageBuilderTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'repos'   && <ReposTab />}
      {tab === 'starred' && <StarredTab username={gc.username || 'jootaceehub'} />}
      {tab === 'display' && <DisplayTab />}
      {tab === 'export'  && <ExportTab />}
    </div>
  )
}
