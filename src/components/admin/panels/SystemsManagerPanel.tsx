'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { SystemEntry, SystemStatus } from '@/lib/admin/types'
import {
  cn, panel, stat, field, btn, toolbar, grid,
  addForm, empty, filterChip, statusDot, statusSelectCva, visibilityBtn, cardCva, inlineInput,
  type StatusDotProps, type StatusSelectProps,
} from '@/styles/ui'

const STATUSES: SystemStatus[] = ['operational', 'degraded', 'maintenance', 'offline']
const STATUS_LABELS: Record<SystemStatus, string> = {
  operational: 'Operational', degraded: 'Degraded', maintenance: 'Maintenance', offline: 'Offline',
}
const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'operational', label: 'Operational' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
] as const
type FilterValue = 'all' | SystemStatus | 'visible' | 'hidden'

const BLANK: SystemEntry = {
  key: '', name: '', badge: '', description: '', status: 'operational',
  version: '1.0.0', uptime: '99.9%', tools: 0, visible: true,
}

export default function SystemsManagerPanel() {
  const { state, dispatch } = useAdmin()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<SystemEntry>({ ...BLANK })

  const systems = state.systemsRegistry

  const filtered = useMemo(() => {
    let list = systems
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      )
    }
    if (filter === 'visible') list = list.filter((s) => s.visible)
    else if (filter === 'hidden') list = list.filter((s) => !s.visible)
    else if (filter !== 'all') list = list.filter((s) => s.status === filter)
    return list
  }, [systems, search, filter])

  const stats = useMemo(() => ({
    total: systems.length,
    operational: systems.filter((s) => s.status === 'operational').length,
    visible: systems.filter((s) => s.visible).length,
    degraded: systems.filter((s) => s.status === 'degraded' || s.status === 'offline').length,
  }), [systems])

  function update(key: string, data: Partial<SystemEntry>) {
    dispatch({ type: 'UPDATE_SYSTEM', payload: { key, data } })
  }
  function remove(key: string) { dispatch({ type: 'REMOVE_SYSTEM', payload: key }) }

  function handleAdd() {
    if (!form.key.trim() || !form.name.trim()) return
    dispatch({ type: 'ADD_SYSTEM', payload: {
      ...form,
      key: form.key.trim().toLowerCase().replace(/\s+/g, '-'),
      name: form.name.trim(),
      badge: form.badge.trim() || form.key.trim().toUpperCase(),
    }})
    setForm({ ...BLANK })
    setShowAdd(false)
  }

  return (
    <div className={panel.root}>
      {/* Header */}
      <div>
        <div className={panel.label}>Systems Manager</div>
        <h1 className={panel.title}>Architecture Registry</h1>
        <p className={panel.subtitle}>
          {stats.total} systems · {stats.operational} operational · {stats.visible} visible
        </p>
      </div>

      {/* Stats */}
      <div className={stat.grid}>
        {[
          { label: 'Total', value: stats.total, color: '' },
          { label: 'Operational', value: stats.operational, color: 'text-emerald-400' },
          { label: 'Visible', value: stats.visible, color: 'text-primary' },
          { label: 'Issues', value: stats.degraded, color: stats.degraded > 0 ? 'text-amber-400' : '' },
        ].map((s) => (
          <div key={s.label} className={stat.card}>
            <div className={cn(stat.value, s.color)}>{s.value}</div>
            <div className={stat.label}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={toolbar.row}>
        <input
          type="text" placeholder="Search systems…" value={search}
          onChange={(e) => setSearch(e.target.value)} className={toolbar.search}
        />
        <button onClick={() => setShowAdd((v) => !v)} className={btn.add}>
          {showAdd ? '✕ Cancel' : '+ Add System'}
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setFilter(opt.value as FilterValue)}
            className={filterChip({ active: filter === opt.value })}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className={addForm.wrap}>
          <div className={addForm.title}>New System</div>
          <div className={grid.two}>
            <div className={field.wrap}>
              <div className={field.label}>Name *</div>
              <input placeholder="e.g. MCP Gateway" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={field.input} />
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Key * (slug)</div>
              <input placeholder="e.g. mcp-gateway" value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                className={field.input} />
            </div>
          </div>
          <div className={grid.two}>
            <div className={field.wrap}>
              <div className={field.label}>Badge Label</div>
              <input placeholder="e.g. MCP" value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                className={field.input} />
            </div>
            <div className={field.wrap}>
              <div className={field.label}>Status</div>
              <select value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SystemStatus }))}
                className={field.select}>
                {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
              </select>
            </div>
          </div>
          <div className={grid.three}>
            {[
              { label: 'Version', key: 'version' as const, placeholder: '1.0.0' },
              { label: 'Uptime', key: 'uptime' as const, placeholder: '99.9%' },
            ].map((f) => (
              <div key={f.label} className={field.wrap}>
                <div className={field.label}>{f.label}</div>
                <input placeholder={f.placeholder} value={form[f.key] as string}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className={field.input} />
              </div>
            ))}
            <div className={field.wrap}>
              <div className={field.label}>Tools Count</div>
              <input type="number" min={0} placeholder="0" value={form.tools}
                onChange={(e) => setForm((p) => ({ ...p, tools: Number(e.target.value) }))}
                className={field.input} />
            </div>
          </div>
          <div className={field.wrap}>
            <div className={field.label}>Description</div>
            <textarea rows={2} placeholder="Brief description…" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={field.textarea} />
          </div>
          <div className={addForm.btns}>
            <button onClick={handleAdd} disabled={!form.key.trim() || !form.name.trim()}
              className={btn.primary}>Add System</button>
            <button onClick={() => { setShowAdd(false); setForm({ ...BLANK }) }}
              className={btn.ghost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Card list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={empty.wrap}>
            <p className={empty.text}>
              {search || filter !== 'all' ? 'No systems match the current filter.' : 'No systems registered yet.'}
            </p>
          </div>
        ) : (
          filtered.map((sys) => (
            <div key={sys.key} className={cardCva({ muted: !sys.visible })}>
              {/* Header row */}
              <div className="flex items-center gap-3 border-b border-border/20 px-4 py-3">
                <span className={cn(statusDot({ status: sys.status as StatusDotProps['status'] }), 'h-2.5 w-2.5')} />
                <input value={sys.name}
                  onChange={(e) => update(sys.key, { name: e.target.value })}
                  className={inlineInput.name} />
                <input value={sys.badge}
                  onChange={(e) => update(sys.key, { badge: e.target.value })}
                  className={inlineInput.badge} />
                <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0">{sys.version}</span>
                <select value={sys.status}
                  onChange={(e) => update(sys.key, { status: e.target.value as SystemStatus })}
                  className={statusSelectCva({ status: sys.status as StatusSelectProps['status'] })}>
                  {STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-background text-foreground normal-case">
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
                <button onClick={() => update(sys.key, { visible: !sys.visible })}
                  className={visibilityBtn({ visible: sys.visible })}>
                  {sys.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => remove(sys.key)} className={btn.remove}>Remove</button>
              </div>

              {/* Body */}
              <div className="px-4 py-3 space-y-3">
                <textarea rows={2} placeholder="System description…" value={sys.description}
                  onChange={(e) => update(sys.key, { description: e.target.value })}
                  className="w-full rounded-xl border border-border/20 bg-background/40 px-3 py-2 text-xs text-foreground/70 placeholder:text-muted-foreground/25 focus:border-primary/30 focus:outline-none resize-none leading-relaxed" />
                <div className={grid.three}>
                  {[
                    { label: 'Version', value: sys.version, key: 'version' as const },
                    { label: 'Uptime', value: sys.uptime, key: 'uptime' as const },
                    { label: 'Tools', value: String(sys.tools), key: 'tools' as const, num: true },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40 mb-1">{f.label}</div>
                      <input value={f.value}
                        onChange={(e) => update(sys.key, { [f.key]: f.num ? (Number(e.target.value) || 0) : e.target.value })}
                        className="w-full rounded-lg border border-border/20 bg-background/40 px-2 py-1.5 font-mono text-xs text-primary/80 focus:border-primary/30 focus:outline-none transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
