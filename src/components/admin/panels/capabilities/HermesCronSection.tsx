'use client'

import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import type { HermesCronTask } from '@/lib/admin/types'
import { HermesSection } from './HermesSection'
import { generateId, CRON_DELIVERY_PLATFORMS } from './hermes-constants'

interface Props {
  isOpen: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

const fieldCls = 'w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors'

export function HermesCronSection({ isOpen, onToggle }: Props) {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes

  const [showAdd, setShowAdd] = useState(false)
  const [cronDraft, setCronDraft] = useState<Partial<HermesCronTask>>({
    name: '', cron: '0 9 * * *', prompt: '', deliveryPlatform: 'cli', enabled: true, lastRun: null,
  })

  if (!hermes) return null

  function addTask() {
    if (!cronDraft.name || !cronDraft.cron || !cronDraft.prompt) return
    const task: HermesCronTask = {
      id: generateId(),
      name: cronDraft.name ?? '',
      cron: cronDraft.cron ?? '0 9 * * *',
      prompt: cronDraft.prompt ?? '',
      deliveryPlatform: (cronDraft.deliveryPlatform as HermesCronTask['deliveryPlatform']) ?? 'cli',
      enabled: cronDraft.enabled ?? true,
      lastRun: null,
    }
    dispatch({ type: 'HERMES_ADD_CRON_TASK', payload: task })
    setCronDraft({ name: '', cron: '0 9 * * *', prompt: '', deliveryPlatform: 'cli', enabled: true, lastRun: null })
    setShowAdd(false)
  }

  return (
    <HermesSection id="cron" title="Cron Scheduler" isOpen={isOpen} onToggle={onToggle}>
      <div className="flex items-center justify-between">
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
          Scheduled tasks · {(hermes.scheduledTasks ?? []).length} configured
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[9px] text-white/40 transition-colors hover:text-white/70 hover:bg-white/10">
          <Plus className="h-3 w-3" />
          Add task
        </button>
      </div>

      {(hermes.scheduledTasks ?? []).length > 0 && (
        <div className="space-y-1.5">
          {(hermes.scheduledTasks ?? []).map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2">
              <div className="flex-1 min-w-0 font-mono text-[10px] text-white/65 truncate">{task.name}</div>
              <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-[8px] text-amber-400/80">{task.cron}</span>
              <span className="shrink-0 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-cyan-400/70">{task.deliveryPlatform}</span>
              <Toggle enabled={task.enabled} onToggle={() => dispatch({ type: 'HERMES_UPDATE_CRON_TASK', payload: { id: task.id, data: { enabled: !task.enabled } } })} />
              <button onClick={() => dispatch({ type: 'HERMES_REMOVE_CRON_TASK', payload: task.id })} className="flex h-6 w-6 items-center justify-center rounded-md text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400 shrink-0">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="mt-3 space-y-2 rounded-xl border border-white/8 bg-black/20 p-3">
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">New scheduled task</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Name</div>
              <input type="text" className={fieldCls} value={cronDraft.name ?? ''} onChange={(e) => setCronDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Daily report" />
            </div>
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Cron expression</div>
              <input type="text" className={fieldCls} value={cronDraft.cron ?? ''} onChange={(e) => setCronDraft((p) => ({ ...p, cron: e.target.value }))} placeholder="0 9 * * *" />
            </div>
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Prompt</div>
            <textarea className="h-28 w-full resize-none rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-white/20 leading-relaxed" value={cronDraft.prompt ?? ''} onChange={(e) => setCronDraft((p) => ({ ...p, prompt: e.target.value }))} placeholder="Generate a daily summary of..." rows={2} />
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Delivery platform</div>
            <select className={fieldCls} value={cronDraft.deliveryPlatform ?? 'cli'} onChange={(e) => setCronDraft((p) => ({ ...p, deliveryPlatform: e.target.value as HermesCronTask['deliveryPlatform'] }))}>
              {CRON_DELIVERY_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[10px] text-emerald-400 transition-colors hover:bg-emerald-400/15">
              <Check className="h-3.5 w-3.5" />
              Add task
            </button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[10px] text-white/30 transition-colors hover:text-white/55">Cancel</button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Command reference</div>
        <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2">
          <code className="font-mono text-[10px] text-emerald-400/80">hermes cron list · hermes cron add · hermes cron remove</code>
        </div>
      </div>
    </HermesSection>
  )
}
