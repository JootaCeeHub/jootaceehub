'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Search, X, ChevronRight, ChevronDown, Zap,
  Shield, AlertTriangle, CheckCircle, Info, Copy,
  Terminal, BookOpen, ExternalLink, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import {
  SKILL_LIBRARY, SKILL_CATEGORIES, SKILL_CATEGORY_META, SKILL_RISK_META,
  searchSkills, getSkillsByCategory,
  type SkillEntry, type SkillCategory,
} from '@/lib/ai/skill-library'
import { FULL_SKILL_CATALOG, FULL_SKILL_COUNT, type QuickSkill } from '@/lib/ai/full-catalog'
import type { AgentProfile, AgentSkillRef } from '@/lib/ai/types'

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: SkillEntry['risk'] }) {
  const meta = SKILL_RISK_META[risk]
  const Icon = risk === 'safe' ? CheckCircle : risk === 'critical' ? AlertTriangle : risk === 'moderate' ? Shield : Info
  return (
    <span
      className="flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider"
      style={{ borderColor: meta.color + '30', color: meta.color, background: meta.color + '15' }}
    >
      <Icon size={7} />
      {meta.label}
    </span>
  )
}

function CategoryPill({ category, active, onClick }: { category: SkillCategory; active: boolean; onClick: () => void }) {
  const meta = SKILL_CATEGORY_META[category]
  const count = getSkillsByCategory(category).length
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[9px] transition-all',
        active ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 text-white/40 hover:text-white/70'
      )}
      style={active ? { borderColor: meta.color + '40', background: meta.color + '15', color: meta.color } : {}}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      <span
        className="rounded-full px-1 text-[7px]"
        style={{ background: active ? meta.color + '30' : '#ffffff10', color: active ? meta.color : '#ffffff40' }}
      >
        {count}
      </span>
    </button>
  )
}

function CapabilityLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[10px] text-white/60">
      <ChevronRight size={8} className="mt-0.5 shrink-0 text-white/30" />
      <span>{text}</span>
    </div>
  )
}

function UseCaseLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[10px] text-white/60">
      <Zap size={8} className="mt-0.5 shrink-0 text-emerald-400/60" />
      <span>{text}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill Card
// ─────────────────────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  expanded,
  onToggle,
  onAddToProfile,
  activeProfile,
  alreadyAdded,
}: {
  skill: SkillEntry
  expanded: boolean
  onToggle: () => void
  onAddToProfile: (skill: SkillEntry) => void
  activeProfile: AgentProfile | null
  alreadyAdded: boolean
}) {
  const catMeta = SKILL_CATEGORY_META[skill.category]
  const [copied, setCopied] = useState(false)

  function copySlashCommand() {
    navigator.clipboard.writeText(`/${skill.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        expanded ? 'border-white/15 bg-white/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      )}
      style={expanded ? { borderColor: catMeta.color + '25', background: catMeta.color + '08' } : {}}
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2.5 p-3 text-left"
      >
        <div
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded"
          style={{ background: catMeta.color + '20', color: catMeta.color }}
        >
          <span className="text-[11px]">{catMeta.emoji}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-[11px] font-medium text-white/85">{skill.name}</span>
            <RiskBadge risk={skill.risk} />
          </div>
          <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-relaxed text-white/45">
            {skill.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 ml-1">
          {activeProfile && (
            <button
              onClick={e => { e.stopPropagation(); onAddToProfile(skill) }}
              className={cn(
                'flex items-center gap-1 rounded border px-2 py-1 font-mono text-[8px] transition-all',
                alreadyAdded
                  ? 'border-emerald-500/30 text-emerald-400/60 cursor-default'
                  : 'border-white/10 text-white/40 hover:border-cyan-500/40 hover:text-cyan-400'
              )}
            >
              {alreadyAdded ? <CheckCircle size={8} /> : <Plus size={8} />}
              {alreadyAdded ? 'Added' : 'Add'}
            </button>
          )}
          {expanded ? (
            <ChevronDown size={12} className="text-white/30" />
          ) : (
            <ChevronRight size={12} className="text-white/20" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 px-3 pb-3 pt-2.5">
          <div className="grid gap-3 lg:grid-cols-2">
            {/* Capabilities */}
            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-white/30">
                <BookOpen size={8} />
                Capabilities
              </div>
              <div className="space-y-0.5">
                {skill.capabilities.map((c, i) => <CapabilityLine key={i} text={c} />)}
              </div>
            </div>

            {/* Use cases */}
            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-white/30">
                <Zap size={8} />
                Para este proyecto
              </div>
              <div className="space-y-0.5">
                {skill.useCases.map((u, i) => <UseCaseLine key={i} text={u} />)}
              </div>
            </div>
          </div>

          {/* JOOTACEEHUB notes */}
          {skill.jootaceeNotes && (
            <div className="mt-2.5 rounded border border-amber-500/20 bg-amber-500/5 p-2">
              <div className="mb-1 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-widest text-amber-400/70">
                <Info size={7} />
                Nota stack JOOTACEEHUB
              </div>
              <p className="text-[9px] leading-relaxed text-amber-300/60">{skill.jootaceeNotes}</p>
            </div>
          )}

          {/* Avoid when */}
          {skill.avoidWhen && skill.avoidWhen.length > 0 && (
            <div className="mt-2 rounded border border-red-500/15 bg-red-500/5 p-2">
              <div className="mb-1 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-widest text-red-400/60">
                <AlertTriangle size={7} />
                Evitar cuando
              </div>
              {skill.avoidWhen.map((a, i) => (
                <p key={i} className="text-[9px] text-red-300/50">{a}</p>
              ))}
            </div>
          )}

          {/* Footer: tags + CLI command */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {/* Tags */}
            {skill.tags.slice(0, 6).map(tag => (
              <span
                key={tag}
                className="rounded border border-white/5 px-1.5 py-0.5 font-mono text-[7.5px] text-white/30"
              >
                #{tag}
              </span>
            ))}

            <div className="ml-auto flex items-center gap-1.5">
              {/* Source */}
              <span className="text-[8px] text-white/20">
                {skill.source.startsWith('http') ? (
                  <span className="flex items-center gap-0.5">
                    <ExternalLink size={7} />
                    community
                  </span>
                ) : skill.source}
              </span>

              {/* CLI command */}
              <button
                onClick={copySlashCommand}
                className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 font-mono text-[8px] text-white/40 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
              >
                <Terminal size={8} />
                {copied ? 'Copiado!' : `/${skill.id}`}
                {!copied && <Copy size={7} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary bar
// ─────────────────────────────────────────────────────────────────────────────

function SummaryBar({ filtered, total }: { filtered: number; total: number }) {
  const byCategory = useMemo(() => {
    const counts: Partial<Record<SkillCategory, number>> = {}
    SKILL_LIBRARY.forEach(s => { counts[s.category] = (counts[s.category] ?? 0) + 1 })
    return counts
  }, [])

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10px] text-white/50">Skill Library JOOTACEEHUB</div>
        <div className="font-mono text-[10px] text-white/30">
          {filtered < total ? (
            <span><span className="text-cyan-400">{filtered}</span> / {total} skills</span>
          ) : (
            <span className="text-white/50">{total} skills · 11 categorías</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {SKILL_CATEGORIES.map(cat => {
          const meta = SKILL_CATEGORY_META[cat]
          const count = byCategory[cat] ?? 0
          return (
            <div
              key={cat}
              className="flex items-center gap-1 rounded border px-1.5 py-0.5"
              style={{ borderColor: meta.color + '20', background: meta.color + '0a' }}
            >
              <span className="text-[8px]">{meta.emoji}</span>
              <span className="font-mono text-[7.5px]" style={{ color: meta.color + 'aa' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick skill card (catalog mode — lightweight, no expansion)
// ─────────────────────────────────────────────────────────────────────────────

function QuickSkillCard({
  skill,
  onAdd,
  added,
  hasProfile,
}: {
  skill: QuickSkill
  onAdd: (id: string, name: string) => void
  added: boolean
  hasProfile: boolean
}) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:border-white/10 hover:bg-white/[0.04] transition-colors">
      <Terminal size={10} className="mt-0.5 shrink-0 text-white/25" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-white/80">{skill.name || skill.id}</span>
          <span
            className="rounded-full border px-1 py-0.5 font-mono text-[7px]"
            style={{ borderColor: '#6b728040', color: '#6b7280', background: '#6b728010' }}
          >
            {skill.category}
          </span>
          {skill.risk === 'critical' && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-1 py-0.5 font-mono text-[7px] text-red-400">!</span>
          )}
        </div>
        <p className="mt-0.5 text-[8px] leading-relaxed text-white/35 line-clamp-2">{skill.description || `/${skill.id}`}</p>
      </div>
      {hasProfile && (
        <button
          onClick={() => onAdd(skill.id, skill.name || skill.id)}
          disabled={added}
          className={cn(
            'shrink-0 rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
            added
              ? 'border-green-500/20 bg-green-500/10 text-green-400/60 cursor-default'
              : 'border-white/10 bg-white/5 text-white/50 hover:border-cyan-500/30 hover:text-cyan-400'
          )}
        >
          {added ? '✓' : '+'}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'curated' | 'catalog'

export default function SkillLibraryTab() {
  const { state, dispatch } = useAdmin()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [riskFilter, setRiskFilter] = useState<SkillEntry['risk'] | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('curated')
  const searchRef = useRef<HTMLInputElement>(null)

  const activeProfile = useMemo(() => {
    const id = state.aiConfig.activeAgentProfileId
    return id ? (state.aiConfig.agentProfiles ?? []).find(p => p.id === id) ?? null : null
  }, [state.aiConfig.activeAgentProfileId, state.aiConfig.agentProfiles])

  const addedSkillIds = useMemo(
    () => new Set(activeProfile?.skills.map(s => s.id) ?? []),
    [activeProfile]
  )

  const filteredCurated = useMemo(() => {
    let list = query.trim() ? searchSkills(query) : SKILL_LIBRARY
    if (selectedCategory) list = list.filter(s => s.category === selectedCategory)
    if (riskFilter !== 'all') list = list.filter(s => s.risk === riskFilter)
    return list
  }, [query, selectedCategory, riskFilter])

  const filteredCatalog = useMemo(() => {
    let list = FULL_SKILL_CATALOG
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(s =>
        s.id.includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.category.includes(q)
      )
    }
    if (selectedCategory) list = list.filter(s => s.category === selectedCategory)
    if (riskFilter !== 'all') list = list.filter(s => s.risk === riskFilter)
    return list
  }, [query, selectedCategory, riskFilter])

  function addToActiveProfile(skill: SkillEntry) {
    if (!activeProfile) return
    if (addedSkillIds.has(skill.id)) return
    const ref: AgentSkillRef = {
      id: skill.id,
      name: skill.id,
      label: skill.name,
      source: 'global',
      enabled: true,
    }
    dispatch({
      type: 'AGENT_PROFILE_UPDATE',
      payload: { id: activeProfile.id, data: { skills: [...activeProfile.skills, ref] } },
    })
  }

  function addCatalogSkillToProfile(id: string, name: string) {
    if (!activeProfile || addedSkillIds.has(id)) return
    const ref: AgentSkillRef = { id, name: id, label: name, source: 'global', enabled: true }
    dispatch({
      type: 'AGENT_PROFILE_UPDATE',
      payload: { id: activeProfile.id, data: { skills: [...activeProfile.skills, ref] } },
    })
  }

  function clearSearch() {
    setQuery('')
    searchRef.current?.focus()
  }

  const currentCount = viewMode === 'curated' ? filteredCurated.length : filteredCatalog.length
  const totalForView = viewMode === 'curated' ? SKILL_LIBRARY.length : FULL_SKILL_COUNT

  return (
    <div className="space-y-3">
      {/* Summary */}
      <SummaryBar filtered={currentCount} total={totalForView} />

      {/* View mode toggle */}
      <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-1.5">
        <button
          onClick={() => setViewMode('curated')}
          className={cn(
            'flex-1 rounded py-1.5 font-mono text-[9px] transition-all',
            viewMode === 'curated'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
              : 'text-white/35 hover:text-white/60'
          )}
        >
          ◈ Curadas ({SKILL_LIBRARY.length})
          <span className="ml-1 text-[7px] text-white/25">detalle completo</span>
        </button>
        <button
          onClick={() => setViewMode('catalog')}
          className={cn(
            'flex-1 rounded py-1.5 font-mono text-[9px] transition-all',
            viewMode === 'catalog'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
              : 'text-white/35 hover:text-white/60'
          )}
        >
          ◉ Catálogo completo ({FULL_SKILL_COUNT})
          <span className="ml-1 text-[7px] text-white/25">todas las skills</span>
        </button>
      </div>

      {/* Search + risk filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, capability, tag, use case…"
            className="w-full rounded-md border border-white/10 bg-white/5 pl-7 pr-8 py-1.5 font-mono text-[10px] text-white/80 placeholder-white/25 outline-none focus:border-cyan-500/40"
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={11} />
            </button>
          )}
        </div>

        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value as SkillEntry['risk'] | 'all')}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[10px] text-white/60 outline-none"
        >
          <option value="all">Riesgo: todos</option>
          <option value="safe">Safe</option>
          <option value="moderate">Moderate</option>
          <option value="critical">Critical</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[9px] transition-all',
            !selectedCategory ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 text-white/40 hover:text-white/60'
          )}
        >
          Todos
          <span className="rounded-full bg-white/10 px-1 text-[7px] text-white/50">{SKILL_LIBRARY.length}</span>
        </button>
        {SKILL_CATEGORIES.map(cat => (
          <CategoryPill
            key={cat}
            category={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          />
        ))}
      </div>

      {/* Active profile banner */}
      {activeProfile ? (
        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
          <span className="text-sm">{activeProfile.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] text-cyan-300">Perfil activo: {activeProfile.name}</div>
            <div className="text-[9px] text-cyan-300/50">
              Haz click en &quot;Add&quot; para agregar skills directamente — {activeProfile.skills.length} skills actuales
            </div>
          </div>
          <span className="font-mono text-[8px] text-cyan-300/40">{addedSkillIds.size} añadidos</span>
        </div>
      ) : (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-[9px] text-white/30">
          Activa un perfil de agente en la pestaña &quot;Perfiles&quot; para poder añadir skills directamente desde aquí.
        </div>
      )}

      {/* Skill list */}
      {currentCount === 0 ? (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 text-center">
          <Search size={20} className="mx-auto mb-2 text-white/20" />
          <p className="text-[10px] text-white/30">No se encontraron skills con esos criterios</p>
          <button onClick={clearSearch} className="mt-2 text-[9px] text-cyan-400/60 hover:text-cyan-400">
            Limpiar búsqueda
          </button>
        </div>
      ) : viewMode === 'curated' ? (
        <div className="space-y-1.5">
          {filteredCurated.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              expanded={expandedId === skill.id}
              onToggle={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
              onAddToProfile={addToActiveProfile}
              activeProfile={activeProfile}
              alreadyAdded={addedSkillIds.has(skill.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredCatalog.slice(0, 200).map(skill => (
            <QuickSkillCard
              key={skill.id}
              skill={skill}
              onAdd={addCatalogSkillToProfile}
              added={addedSkillIds.has(skill.id)}
              hasProfile={!!activeProfile}
            />
          ))}
          {filteredCatalog.length > 200 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-center font-mono text-[9px] text-white/30">
              Mostrando 200 / {filteredCatalog.length} — refina la búsqueda para ver más
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Curadas', value: SKILL_LIBRARY.length, color: '#06b6d4' },
            { label: 'Total catálogo', value: FULL_SKILL_COUNT, color: '#a78bfa' },
            { label: 'Safe', value: SKILL_LIBRARY.filter(s => s.risk === 'safe').length, color: '#34d399' },
            { label: 'Notas stack', value: SKILL_LIBRARY.filter(s => s.jootaceeNotes).length, color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-base font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[8px] uppercase tracking-widest text-white/30">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[8px] text-white/20">
            {SKILL_LIBRARY.length} curadas con detalle completo · {FULL_SKILL_COUNT - SKILL_LIBRARY.length} en catálogo básico
          </span>
          <span className="text-[7px] text-white/10">·</span>
          <span className="text-[8px] text-white/20">~/.claude/skills/ · Comandos con /skill-name</span>
        </div>
      </div>
    </div>
  )
}
