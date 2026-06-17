'use client'

import { useState, useMemo } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { LabStatus, LabEntry } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

const STATUS_META: Record<LabStatus, { label: string; color: string }> = {
  live:    { label: 'Live',    color: '#34d399' },
  beta:    { label: 'Beta',    color: '#fbbf24' },
  rd:      { label: 'R&D',     color: '#38bdf8' },
  roadmap: { label: 'Roadmap', color: '#94a3b8' },
}

const LAB_STATUSES: LabStatus[] = ['live', 'beta', 'rd', 'roadmap']

const EMPTY_LAB: Omit<LabEntry, 'key'> = {
  name: '',
  tagline: '',
  status: 'roadmap',
  description: '',
  stack: [],
  metrics: [
    { label: 'Metric 1', value: '—' },
    { label: 'Metric 2', value: '—' },
    { label: 'Metric 3', value: '—' },
    { label: 'Metric 4', value: '—' },
  ],
  accent: '#a78bfa',
  visible: true,
}

function StackEditor({
  stack,
  accent,
  onChange,
}: {
  stack: string[]
  accent: string
  onChange: (s: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !stack.includes(trimmed)) {
      onChange([...stack, trimmed])
      setInput('')
    }
  }

  const remove = (tech: string) => onChange(stack.filter((t) => t !== tech))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {stack.map((tech) => (
          <button
            key={tech}
            onClick={() => remove(tech)}
            title="Click to remove"
            className="group flex items-center gap-1 rounded-md border border-white/10 bg-white/4 px-2 py-0.5 text-[10px] font-mono text-white/55 hover:border-red-400/30 hover:text-red-400/70 transition-colors"
          >
            {tech}
            <span className="opacity-0 group-hover:opacity-100 text-[8px]">×</span>
          </button>
        ))}
        {stack.length === 0 && (
          <span className="text-[10px] text-white/20 italic">No technologies added</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Add technology…"
          className="flex-1 rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 text-[11px] font-mono text-white/65 placeholder-white/20 focus:outline-none focus:border-white/20"
        />
        <button
          onClick={add}
          className="rounded-lg border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors"
          style={{ borderColor: `${accent}25`, color: accent }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useAdmin()
  const [form, setForm] = useState({ ...EMPTY_LAB, name: '', tagline: '' })
  const [stackInput, setStackInput] = useState('')

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const addStack = () => {
    const t = stackInput.trim()
    if (t && !form.stack.includes(t)) {
      update({ stack: [...form.stack, t] })
      setStackInput('')
    }
  }

  const submit = () => {
    if (!form.name.trim()) return
    const key = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (state.labsRegistry.find((l) => l.key === key)) {
      alert('A project with this key already exists.')
      return
    }
    dispatch({ type: 'SET_LABS_REGISTRY', payload: [...state.labsRegistry, { key, ...form }] })
    onClose()
  }

  return (
    <div className="rounded-xl border-2 border-violet-400/20 bg-violet-400/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-violet-400/70">New Project</span>
        <button onClick={onClose} className="text-[11px] text-white/30 hover:text-white/60">✕</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Name *</div>
          <input
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="My Project"
            className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-white/80 focus:outline-none focus:border-violet-400/30"
          />
        </div>
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Status</div>
          <select
            value={form.status}
            onChange={(e) => update({ status: e.target.value as LabStatus })}
            className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-white/70 focus:outline-none focus:border-violet-400/30 appearance-none"
          >
            {LAB_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-[#0a0a14]">{STATUS_META[st].label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Tagline</div>
        <input
          value={form.tagline}
          onChange={(e) => update({ tagline: e.target.value })}
          placeholder="One-line project description"
          className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[12px] text-white/80 focus:outline-none focus:border-violet-400/30"
        />
      </div>
      <div className="space-y-1">
        <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Description</div>
        <textarea
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={2}
          placeholder="Detailed project description…"
          className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/70 focus:outline-none focus:border-violet-400/30 resize-none leading-relaxed"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Tech Stack (Enter to add)</div>
          <div className="flex gap-2">
            <input
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStack() } }}
              placeholder="Next.js"
              className="flex-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[11px] font-mono text-white/65 placeholder-white/20 focus:outline-none"
            />
            <button onClick={addStack} className="rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10px] text-white/40 hover:text-white/70">+</button>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {form.stack.map((t) => (
              <button key={t} onClick={() => update({ stack: form.stack.filter((x) => x !== t) })} className="rounded border border-white/10 bg-white/4 px-1.5 py-0.5 text-[9px] font-mono text-white/45 hover:text-red-400/70 transition-colors">
                {t} ×
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Accent Color</div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accent}
              onChange={(e) => update({ accent: e.target.value })}
              className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
            />
            <span className="font-mono text-[11px] text-white/40">{form.accent}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/3 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-white/40 hover:text-white/60 transition-colors">Cancel</button>
        <button
          onClick={submit}
          disabled={!form.name.trim()}
          className="rounded-lg border px-4 py-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors disabled:opacity-30"
          style={{ borderColor: `${form.accent}40`, color: form.accent, background: `${form.accent}10` }}
        >
          Add Project
        </button>
      </div>
    </div>
  )
}

type LabSortBy = 'name' | 'status' | 'newest'

export default function LabsManagerPanel() {
  const { state, dispatch } = useAdmin()
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LabStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<LabSortBy>('newest')

  const allLabs = state.labsRegistry

  const filtered = useMemo(() => {
    let list = allLabs
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.tagline.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.stack.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter)
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'status') return LAB_STATUSES.indexOf(a.status) - LAB_STATUSES.indexOf(b.status)
      return 0 // newest = registry order
    })
  }, [allLabs, search, statusFilter, sortBy])

  const total = allLabs.length
  const live = allLabs.filter((l) => l.status === 'live').length
  const beta = allLabs.filter((l) => l.status === 'beta').length

  const remove = (key: string) => {
    if (confirm('Remove this project from the registry?')) {
      dispatch({ type: 'SET_LABS_REGISTRY', payload: allLabs.filter((l) => l.key !== key) })
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Projects Manager</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Product Registry</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">{total} total · {live} live · {beta} beta</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-2">
        {LAB_STATUSES.map((st) => {
          const count = allLabs.filter((l) => l.status === st).length
          const meta = STATUS_META[st]
          return (
            <div key={st} className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2.5 text-center">
              <div className="text-[15px] font-semibold tabular-nums" style={{ color: meta.color }}>{count}</div>
              <div className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">{meta.label}</div>
            </div>
          )
        })}
      </div>

      {/* Search + sort toolbar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search labs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/70 placeholder:text-white/20 outline-none focus:border-violet-400/30 transition-colors"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as LabSortBy)} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-white/50 outline-none focus:border-violet-400/25 transition-colors cursor-pointer">
          <option value="newest">Registry Order</option>
          <option value="name">Name A–Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'live', 'beta', 'rd', 'roadmap'] as const).map((v) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={cn(
            'rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all',
            statusFilter === v
              ? 'border-violet-400/40 bg-violet-400/15 text-violet-400'
              : 'border-white/10 bg-white/[0.02] text-white/30 hover:border-white/20'
          )}>
            {v === 'all' ? 'All' : STATUS_META[v as LabStatus]?.label ?? v}
          </button>
        ))}
      </div>

      {/* Add new */}
      {!showNew ? (
        <button onClick={() => setShowNew(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-violet-400/20 bg-violet-400/[0.02] py-2.5 text-[10px] uppercase tracking-[0.15em] text-violet-400/50 hover:border-violet-400/40 hover:text-violet-400/80 hover:bg-violet-400/[0.05] transition-all">
          <span className="text-base leading-none">+</span>
          Add Project
        </button>
      ) : (
        <NewProjectForm onClose={() => setShowNew(false)} />
      )}

      {/* Project list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
            <p className="font-mono text-[11px] text-white/20">
              {search || statusFilter !== 'all' ? 'No labs match the current filter.' : 'No labs registered yet.'}
            </p>
          </div>
        )}
        {filtered.map((lab) => {
          const sm = STATUS_META[lab.status]
          const isOpen = expanded === lab.key
          return (
            <div
              key={lab.key}
              className={cn(
                'rounded-xl border bg-white/[0.02] overflow-hidden transition-all duration-200',
                lab.visible ? 'border-white/10' : 'border-white/5 opacity-50'
              )}
              style={{ borderLeftColor: `${lab.accent}35`, borderLeftWidth: '2px' }}
            >
              {/* Collapsed header */}
              <button
                onClick={() => setExpanded(isOpen ? null : lab.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: lab.accent, boxShadow: `0 0 6px ${lab.accent}60` }}
                />
                <span className="flex-1 min-w-0 text-[13px] font-semibold text-white/85">{lab.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35 hidden sm:block">{lab.tagline}</span>
                <span
                  className="shrink-0 rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                  style={{ color: sm.color, borderColor: `${sm.color}30` }}
                >
                  {sm.label}
                </span>
                <span className={cn(
                  'shrink-0 rounded-md border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] transition-colors',
                  lab.visible ? 'border-white/12 text-white/40' : 'border-white/6 text-white/20'
                )}>
                  {lab.visible ? 'Visible' : 'Hidden'}
                </span>
                <span className="shrink-0 text-white/20 text-[10px]">{isOpen ? '▲' : '▼'}</span>
              </button>

              {/* Expanded editor */}
              {isOpen && (
                <div className="border-t border-white/8 p-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={lab.status}
                      onChange={(e) =>
                        dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { status: e.target.value as LabStatus } } })
                      }
                      className="rounded-md border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] focus:outline-none"
                      style={{ color: sm.color }}
                    >
                      {LAB_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-[#0a0a14] text-white">{STATUS_META[st].label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { visible: !lab.visible } } })}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] transition-colors',
                        lab.visible ? 'border-white/12 bg-white/4 text-white/50' : 'border-white/8 bg-white/2 text-white/25'
                      )}
                    >
                      {lab.visible ? '● Visible' : '○ Hidden'}
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      <input
                        type="color"
                        value={lab.accent}
                        onChange={(e) => dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { accent: e.target.value } } })}
                        title="Accent color"
                        className="h-6 w-8 cursor-pointer rounded border border-white/10 bg-transparent"
                      />
                      <button onClick={() => remove(lab.key)} className="text-[9px] uppercase tracking-wider text-red-400/30 hover:text-red-400 transition-colors">Remove</button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Tagline</div>
                      <input
                        value={lab.tagline}
                        onChange={(e) => dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { tagline: e.target.value } } })}
                        className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/70 focus:outline-none focus:border-violet-400/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Key (slug)</div>
                      <input value={lab.key} readOnly className="w-full rounded-lg border border-white/6 bg-white/2 px-3 py-1.5 text-[11px] font-mono text-white/30 cursor-default" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Description</div>
                    <textarea
                      value={lab.description}
                      onChange={(e) => dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { description: e.target.value } } })}
                      rows={2}
                      className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/70 focus:outline-none focus:border-violet-400/30 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Tech Stack</div>
                    <StackEditor
                      stack={lab.stack}
                      accent={lab.accent}
                      onChange={(st) => dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { stack: st } } })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/25">Metrics</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {lab.metrics.map((m, mi) => (
                        <div key={mi} className="relative rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2 space-y-1 group">
                          <button
                            onClick={() => {
                              const updated = lab.metrics.filter((_, i) => i !== mi)
                              dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { metrics: updated } } })
                            }}
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 rounded text-[8px] text-red-400/50 hover:text-red-400 transition-all cursor-pointer px-1"
                          >
                            ✕
                          </button>
                          <input
                            value={m.label}
                            onChange={(e) => {
                              const updated = lab.metrics.map((x, i) => i === mi ? { ...x, label: e.target.value } : x)
                              dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { metrics: updated } } })
                            }}
                            className="w-full bg-transparent text-[9px] uppercase tracking-widest text-white/25 focus:outline-none"
                            placeholder="Label"
                          />
                          <input
                            value={m.value}
                            onChange={(e) => {
                              const updated = lab.metrics.map((x, i) => i === mi ? { ...x, value: e.target.value } : x)
                              dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { metrics: updated } } })
                            }}
                            className="w-full bg-transparent text-[13px] font-semibold focus:outline-none"
                            style={{ color: lab.accent }}
                            placeholder="Value"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const updated = [...lab.metrics, { label: 'Metric', value: '—' }]
                        dispatch({ type: 'UPDATE_LAB', payload: { key: lab.key, data: { metrics: updated } } })
                      }}
                      className="mt-2 w-full rounded-lg border border-dashed border-white/10 py-1.5 font-mono text-[9px] uppercase tracking-wider text-white/25 hover:border-violet-400/25 hover:text-violet-400/60 transition-colors cursor-pointer"
                    >
                      + Add Metric
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
