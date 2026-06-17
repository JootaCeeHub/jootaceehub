'use client'

import { useAdmin } from '@/lib/admin/store'
import { CATEGORY_COLORS } from './utils'

// ─── Inline styles ────────────────────────────────────────────────────────────

const card       = 'overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]'
const cardHeader = 'flex items-center justify-between border-b border-white/8 px-4 py-2.5'
const cardTitle  = 'font-mono text-[10px] uppercase tracking-[0.2em] text-white/35'
const cardBadge  = 'font-mono text-[9px] text-white/20'
const editLink   = 'font-mono text-[8.5px] text-white/25 hover:text-white/55 transition-colors'

const skillList    = 'divide-y divide-white/5'
const skillItem    = 'flex items-center gap-3 px-4 py-2.5'
const skillName    = 'flex-1 font-mono text-[10px] text-white/55'
const skillProv    = 'font-mono text-[8.5px] text-white/22'
const skillDot     = (on: boolean) => `h-1.5 w-1.5 shrink-0 rounded-full ${on ? 'bg-violet-400' : 'bg-white/15'}`
const skillStatus  = (on: boolean) => `font-mono text-[8px] uppercase tracking-wider ${on ? 'text-violet-400' : 'text-white/20'}`

const stackWrap  = 'flex flex-wrap gap-1.5 p-4'
const stackBadge = (count: number) => {
  const cls = count >= 3 ? 'text-sky-400 border-sky-400/25 bg-sky-400/8' : count === 2 ? 'text-white/55 border-white/12' : 'text-white/25 border-white/7'
  return `inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[8.5px] transition-colors ${cls}`
}
const stackCount = 'font-mono text-[7.5px] opacity-60'

const contentRow   = 'flex items-center gap-2 px-4 py-2 border-b border-white/5 last:border-0'
const contentDot   = (color: string) => `h-1.5 w-1.5 shrink-0 rounded-full ${color}`
const contentLabel = 'flex-1 font-mono text-[10px] capitalize text-white/45'
const contentCount = 'font-mono text-[10px] tabular-nums text-white/60'
const contentBar   = 'h-0.5 w-12 overflow-hidden rounded-full bg-white/6'

// ─── Skills Matrix card ───────────────────────────────────────────────────────

function SkillsMatrixCard() {
  const { state, dispatch } = useAdmin()
  const enabledSkills = state.capabilities?.skills?.filter(s => s.enabled).length ?? 0
  const enabledMCP    = state.capabilities?.mcpServers?.filter(s => s.enabled).length ?? 0

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Skills & Capabilities</span>
        <div className="flex items-center gap-3">
          <span className={cardBadge}>{enabledSkills} enabled</span>
          <button onClick={() => dispatch({ type: 'SET_PANEL', payload: 'integrations' })} className={editLink}>
            Manage →
          </button>
        </div>
      </div>

      <div className={skillList}>
        {(state.capabilities?.skills ?? []).map(skill => (
          <div key={skill.id} className={skillItem}>
            <span className={skillDot(skill.enabled)} />
            <span className={skillName}>{skill.name}</span>
            <span className={skillProv}>{skill.source}</span>
            <span className={skillStatus(skill.enabled)}>{skill.enabled ? 'On' : 'Off'}</span>
          </div>
        ))}
        {(state.capabilities?.skills ?? []).length === 0 && (
          <div className="px-4 py-6 text-center font-mono text-[9px] text-white/20">
            No skills configured — open Capabilities panel
          </div>
        )}
      </div>

      {(state.capabilities?.mcpServers ?? []).length > 0 && (
        <div className="border-t border-white/6">
          <div className="px-4 pt-2 pb-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/20">
            MCP Servers ({enabledMCP} active)
          </div>
          {(state.capabilities?.mcpServers ?? []).slice(0, 4).map(srv => (
            <div key={srv.id} className={skillItem}>
              <span className={skillDot(srv.enabled)} />
              <span className={skillName}>{srv.name}</span>
              <span className={skillProv}>{srv.transport}</span>
              <span className={`font-mono text-[9px] ${srv.enabled ? 'text-emerald-400' : 'text-white/20'}`}>
                {srv.enabled ? 'active' : 'off'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tech Stack card ──────────────────────────────────────────────────────────

function TechStackCard() {
  const { state } = useAdmin()

  const freq: Record<string, number> = {}
  for (const lab of state.labsRegistry) {
    for (const tech of lab.stack) {
      freq[tech] = (freq[tech] ?? 0) + 1
    }
  }
  const techEntries = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const techCount   = new Set(state.labsRegistry.flatMap(l => l.stack)).size

  const categories = (['opinion', 'research', 'essays', 'news'] as const).map(cat => ({
    cat,
    count: state.researchRegistry.filter(r => r.category === cat && r.published).length,
    total: state.researchRegistry.filter(r => r.category === cat).length,
  }))
  const maxCat = Math.max(...categories.map(c => c.count), 1)

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Tech Stack · Portfolio</span>
        <span className={cardBadge}>{techCount} technologies</span>
      </div>

      <div className={stackWrap}>
        {techEntries.map(([tech, count]) => (
          <span key={tech} className={stackBadge(count)}>
            {tech}
            <span className={stackCount}>×{count}</span>
          </span>
        ))}
        {state.labsRegistry.length === 0 && (
          <span className="font-mono text-[9px] text-white/20">No labs configured</span>
        )}
      </div>

      <div className="border-t border-white/6 mt-2">
        <div className="px-4 pt-2 pb-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/20">
          Research breakdown
        </div>
        {categories.map(({ cat, count, total }) => (
          <div key={cat} className={contentRow}>
            <span className={contentDot(CATEGORY_COLORS[cat] ?? 'bg-white/20')} />
            <span className={contentLabel}>{cat}</span>
            <div className={contentBar}>
              <div className="h-full rounded-full bg-white/20" style={{ width: `${(count / maxCat) * 100}%` }} />
            </div>
            <span className={contentCount}>{count}/{total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Toolkit Registry card ───────────────────────────────────────────────────

const tkSection = 'border-t border-white/5 last:border-0'
const tkHeader  = 'flex items-center justify-between px-4 py-1.5'
const tkSecLbl  = 'font-mono text-[8px] uppercase tracking-[0.18em] text-white/22'
const tkBadge   = 'font-mono text-[8px] text-white/35 tabular-nums'
const tkItem    = 'flex items-center gap-2 px-4 py-1.5'
const tkName    = 'flex-1 min-w-0 font-mono text-[9.5px] text-white/50 truncate'
const tkMeta    = 'font-mono text-[8.5px] text-white/25 shrink-0'
const tkDot     = (color: string) => `h-1.5 w-1.5 shrink-0 rounded-full ${color}`

function ToolkitRegistryCard() {
  const { state, dispatch } = useAdmin()

  const tools     = state.toolRegistry     ?? []
  const workflows = state.workflowRegistry ?? []
  const prompts   = state.promptRegistry   ?? []
  const agents    = state.agentRegistry    ?? []
  const mcps      = state.mcpRegistry      ?? []

  const sections = [
    {
      label: 'Tools',     color: tkDot('bg-sky-400'),
      items: tools.slice(0, 4).map(t => ({ name: t.name, meta: t.pricing })),
      total: tools.length, panel: 'showcase' as const,
    },
    {
      label: 'Workflows', color: tkDot('bg-violet-400'),
      items: workflows.slice(0, 4).map(w => ({ name: w.title, meta: w.type })),
      total: workflows.length, panel: 'showcase' as const,
    },
    {
      label: 'Prompts',   color: tkDot('bg-amber-400'),
      items: prompts.slice(0, 3).map(p => ({ name: p.title, meta: p.cat })),
      total: prompts.length, panel: 'ai' as const,
    },
    {
      label: 'Agents',    color: tkDot('bg-fuchsia-400'),
      items: agents.slice(0, 3).map(a => ({ name: a.title, meta: a.stack[0] ?? '' })),
      total: agents.length, panel: 'capabilities' as const,
    },
    {
      label: 'MCP Servers', color: tkDot('bg-emerald-400'),
      items: mcps.slice(0, 3).map(m => ({ name: m.name, meta: `${m.toolCount} tools` })),
      total: mcps.length, panel: 'capabilities' as const,
    },
  ]

  const totalItems = tools.length + workflows.length + prompts.length + agents.length + mcps.length

  return (
    <div className={card}>
      <div className={cardHeader}>
        <span className={cardTitle}>Toolkit Registry</span>
        <span className={cardBadge}>{totalItems} items</span>
      </div>

      {sections.map(sec => (
        <div key={sec.label} className={tkSection}>
          <div className={tkHeader}>
            <div className="flex items-center gap-1.5">
              <span className={sec.color} />
              <span className={tkSecLbl}>{sec.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={tkBadge}>{sec.total}</span>
              {sec.total > 0 && (
                <button
                  onClick={() => dispatch({ type: 'SET_PANEL', payload: sec.panel })}
                  className="font-mono text-[7.5px] text-white/22 hover:text-white/50 transition-colors"
                >
                  →
                </button>
              )}
            </div>
          </div>
          {sec.items.length > 0 ? (
            sec.items.map((item, i) => (
              <div key={i} className={tkItem}>
                <span className={tkName}>{item.name}</span>
                {item.meta && <span className={tkMeta}>{item.meta}</span>}
              </div>
            ))
          ) : (
            <div className="px-4 pb-1.5 font-mono text-[8.5px] text-white/15">None configured</div>
          )}
          {sec.total > sec.items.length && (
            <div className="px-4 pb-1 font-mono text-[7.5px] text-white/20">+{sec.total - sec.items.length} more</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Combined 3-column export ─────────────────────────────────────────────────

export function SkillsStackCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SkillsMatrixCard />
      <TechStackCard />
      <ToolkitRegistryCard />
    </div>
  )
}
