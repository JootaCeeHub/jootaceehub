'use client'

import { ChevronUp, ChevronDown, Eye, EyeOff, Pin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { AdminPanel } from '@/lib/admin/types'
import { ALL_PANELS, NAV_GROUPS_META, SLabel, Toggle, GroupLabelRow } from './primitives'

export function NavigationSection() {
  const { state, dispatch } = useAdmin()
  const cfg          = state.studioConfig
  const pinnedPanels = cfg.pinnedPanels ?? []

  const accentDisplay = cfg.useCustomAccent ? cfg.accentColor : '#22d3ee'
  const BG_MAP: Record<typeof cfg.backgroundStyle, string> = {
    midnight: '#060610', dark: '#0a0a14', slate: '#0f172a', void: '#000000',
  }
  const bgColor = BG_MAP[cfg.backgroundStyle]

  const set = (partial: Partial<typeof cfg>) =>
    dispatch({ type: 'UPDATE_STUDIO', payload: partial })

  const getOverride = (id: AdminPanel) =>
    cfg.panelOverrides.find(p => p.id === id)

  const getNavGroup = (key: string) =>
    cfg.navGroups.find(g => g.key === key)

  const setNavGroup = (key: string, data: { label?: string; visible?: boolean; collapsed?: boolean; order?: number }) =>
    dispatch({ type: 'STUDIO_SET_NAV_GROUP', payload: { key, data } })

  const reorderGroup = (key: string, direction: 'up' | 'down') =>
    dispatch({ type: 'STUDIO_REORDER_GROUP', payload: { key, direction } })

  const setPanelOverride = (id: AdminPanel, data: { visible?: boolean; customLabel?: string; customDesc?: string }) =>
    dispatch({ type: 'STUDIO_SET_PANEL_OVERRIDE', payload: { id, data } })

  const togglePin = (id: AdminPanel) =>
    dispatch({ type: 'STUDIO_TOGGLE_PIN', payload: id })

  const sortedGroups = [...NAV_GROUPS_META].sort((a, b) => {
    const oa = getNavGroup(a.key)?.order ?? 99
    const ob = getNavGroup(b.key)?.order ?? 99
    return oa - ob
  })

  return (
    <div className="space-y-3">
      {/* Sidebar mini-map */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
        <SLabel>Sidebar mini-map</SLabel>
        <p className="text-[8.5px] text-white/25 mb-3">Live — reflects group order, visibility, pins, and dividers</p>
        <div className="overflow-hidden rounded-lg border border-white/8 inline-flex"
          style={{ background: bgColor, minHeight: '160px', width: '140px' }}>
          <div className="flex w-full flex-col pt-2"
            style={{
              borderRight: `1px solid ${cfg.sidebarBorder ? `${accentDisplay}28` : 'rgba(255,255,255,0.05)'}`,
              background: cfg.sidebarStyle === 'glass'
                ? `${accentDisplay}08`
                : cfg.sidebarStyle === 'border'
                  ? 'transparent'
                  : 'rgba(255,255,255,0.02)',
            }}>
            {pinnedPanels.length > 0 && (
              <div className="mx-1.5 mb-1.5 border-b border-amber-400/15 pb-1.5">
                <div className="px-1 mb-0.5 text-[5px] uppercase tracking-widest text-amber-400/50">★ Pinned</div>
                {pinnedPanels.slice(0, 3).map(id => {
                  const p = ALL_PANELS.find(x => x.id === id)
                  return p ? (
                    <div key={id} className="flex items-center gap-1 px-1 py-0.5">
                      <p.icon className="h-2 w-2 shrink-0" style={{ color: p.accent }} />
                      <span className="text-[5.5px] text-white/45 truncate">{p.label}</span>
                    </div>
                  ) : null
                })}
              </div>
            )}
            {sortedGroups.map((grp, idx) => {
              const navGroup    = getNavGroup(grp.key)
              const isVisible   = navGroup?.visible   ?? true
              const isCollapsed = navGroup?.collapsed ?? false
              const customLabel = navGroup?.label
              const panelsInGroup = ALL_PANELS.filter(
                p => p.group === grp.key && (getOverride(p.id)?.visible ?? true)
              )
              if (!isVisible) return null
              return (
                <div key={grp.key} className="mb-1 px-1.5">
                  {idx > 0 && (cfg.showGroupDividers ?? true) && (
                    <div className="mb-1 h-px bg-white/6" />
                  )}
                  <div className="flex items-center gap-0.5 mb-0.5">
                    <div className="h-1 w-1 shrink-0 rounded-full" style={{ background: grp.color, opacity: 0.7 }} />
                    <span className="text-[5px] uppercase tracking-widest truncate"
                      style={{ color: grp.color, opacity: 0.65 }}>
                      {customLabel ?? grp.label}
                    </span>
                    {isCollapsed && <span className="ml-auto text-[5px] text-white/20">▸</span>}
                  </div>
                  {!isCollapsed && panelsInGroup.slice(0, 3).map(p => {
                    const Icon = p.icon
                    return (
                      <div key={p.id} className="flex items-center gap-1 px-0.5 py-0.5">
                        <Icon className="h-1.5 w-1.5 shrink-0" style={{ color: p.accent }} />
                        <span className="text-[5px] text-white/35 truncate">{p.label}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Group dividers toggle */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-1 divide-y divide-white/5">
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
          <div className="min-w-0">
            <div className="text-[10.5px] font-medium text-white/70 leading-none">Group dividers</div>
            <div className="mt-0.5 text-[9px] text-white/28 leading-tight">
              Show separator lines between navigation groups in the sidebar
            </div>
          </div>
          <div className="shrink-0">
            <Toggle value={cfg.showGroupDividers} onChange={v => set({ showGroupDividers: v })} />
          </div>
        </div>
      </div>

      {/* Group labels rename */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
        <SLabel>Rename groups</SLabel>
        <div className="space-y-2">
          {sortedGroups.map(grp => (
            <GroupLabelRow key={grp.key} grp={grp} current={getNavGroup(grp.key)}
              onSave={(key, label) => setNavGroup(key, { label: label ?? undefined })} />
          ))}
        </div>
      </div>

      {/* Group controls with reorder */}
      <p className="px-1 text-[10px] text-white/30">
        Control visibility, collapse state, and sidebar order.
      </p>
      {sortedGroups.map((grp, idx) => {
        const navGroup       = getNavGroup(grp.key)
        const visible        = navGroup?.visible   ?? true
        const collapsed      = navGroup?.collapsed ?? false
        const customLabel    = navGroup?.label
        const panelsInGroup  = ALL_PANELS.filter(p => p.group === grp.key)
        const visibleInGroup = panelsInGroup.filter(p => getOverride(p.id)?.visible ?? true).length

        return (
          <div key={grp.key} className="rounded-xl border border-white/8 bg-white/[0.025] overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ background: grp.color }} />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/60">
                {customLabel ?? grp.label}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8.5px] text-white/30">
                {visibleInGroup}/{panelsInGroup.length}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <button onClick={() => reorderGroup(grp.key, 'up')} disabled={idx === 0}
                    className="rounded p-0.5 text-white/20 hover:text-white/55 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => reorderGroup(grp.key, 'down')}
                    disabled={idx === sortedGroups.length - 1}
                    className="rounded p-0.5 text-white/20 hover:text-white/55 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => panelsInGroup.forEach(p => setPanelOverride(p.id, { visible: true }))}
                    className="text-[8px] uppercase tracking-wider text-white/25 hover:text-emerald-400/70 transition-colors">
                    Show all
                  </button>
                  <span className="text-white/15">·</span>
                  <button onClick={() => panelsInGroup.forEach(p => setPanelOverride(p.id, { visible: false }))}
                    className="text-[8px] uppercase tracking-wider text-white/25 hover:text-red-400/60 transition-colors">
                    Hide all
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-white/30">
                  <span>Collapsed</span>
                  <Toggle value={collapsed} onChange={v => setNavGroup(grp.key, { collapsed: v })} />
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-white/30">
                  <span>Visible</span>
                  <Toggle value={visible} onChange={v => setNavGroup(grp.key, { visible: v })} />
                </div>
              </div>
            </div>
            {panelsInGroup.map(p => {
              const Icon      = p.icon
              const override  = getOverride(p.id)
              const isVisible = override?.visible ?? true
              const isPinned  = pinnedPanels.includes(p.id)
              return (
                <div key={p.id}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2 border-b border-white/4 last:border-0 transition-opacity',
                    !visible && 'opacity-30'
                  )}>
                  <Icon className="h-3 w-3 shrink-0" style={{ color: p.accent }} />
                  <span className="flex-1 text-[10px] text-white/55">{override?.customLabel ?? p.label}</span>
                  <span className="hidden sm:block text-[9px] text-white/22">
                    {override?.customDesc ?? p.desc}
                  </span>
                  <button onClick={() => togglePin(p.id)}
                    className={cn(
                      'shrink-0 transition-colors',
                      isPinned ? 'text-amber-400/60 hover:text-amber-400' : 'text-white/15 hover:text-amber-400/50'
                    )}>
                    <Pin className="h-3 w-3" />
                  </button>
                  <button onClick={() => setPanelOverride(p.id, { visible: !isVisible })}
                    className={cn(
                      'shrink-0 transition-colors',
                      isVisible ? 'text-white/30 hover:text-white/60' : 'text-white/15 hover:text-white/40'
                    )}>
                    {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}

      {pinnedPanels.length > 0 && (
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-medium text-amber-400/70">★ Pinned — fixed at sidebar top</div>
            <button onClick={() => pinnedPanels.forEach(id => togglePin(id))}
              className="text-[8px] uppercase tracking-wider text-white/25 hover:text-red-400/60 transition-colors">
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pinnedPanels.map(id => {
              const p = ALL_PANELS.find(x => x.id === id)
              if (!p) return null
              return (
                <div key={id}
                  className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/8 px-2 py-0.5">
                  <span className="text-[9px] text-amber-400/80">{p.label}</span>
                  <button onClick={() => togglePin(id)}
                    className="text-amber-400/40 hover:text-amber-400/70 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
