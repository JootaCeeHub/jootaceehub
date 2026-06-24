'use client'

import { useState, useMemo } from 'react'
import {
  Plus, Trash2, Check, ChevronDown, ChevronUp, Copy,
  Zap, Star, Edit3, X, Terminal, BookOpen, Search,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import type { AgentProfile, AgentCategory, AgentSkillRef } from '@/lib/ai/types'
import {
  SKILL_LIBRARY, SKILL_CATEGORY_META, searchSkills,
  type SkillCategory,
} from '@/lib/ai/skill-library'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<AgentCategory, { label: string; color: string }> = {
  engineering: { label: 'Engineering',  color: '#06b6d4' },
  content:     { label: 'Content',      color: '#f59e0b' },
  seo:         { label: 'SEO / AEO',    color: '#34d399' },
  devops:      { label: 'DevOps',       color: '#f97316' },
  security:    { label: 'Security',     color: '#ef4444' },
  design:      { label: 'Design / A11y',color: '#60a5fa' },
  analysis:    { label: 'Analysis',     color: '#fbbf24' },
  ai:          { label: 'AI / Agents',  color: '#8b5cf6' },
  custom:      { label: 'Custom',       color: '#6b7280' },
}

const CATEGORIES = Object.keys(CATEGORY_META) as AgentCategory[]

// ── Skill category to agent category color mapping ────────────────────────────

function skillCategoryColor(cat: SkillCategory): string {
  return SKILL_CATEGORY_META[cat]?.color ?? '#6b7280'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryBadge({ cat }: { cat: AgentCategory }) {
  const meta = CATEGORY_META[cat]
  return (
    <span
      className="rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider"
      style={{ borderColor: meta.color + '30', color: meta.color + 'cc', background: meta.color + '12' }}
    >
      {meta.label}
    </span>
  )
}

// Reserved for future inline chip use
function _SkillChip({ skill, onRemove }: { skill: AgentSkillRef; onRemove?: () => void }) {
  const sourceColor = skill.source === 'global' ? '#a78bfa' : skill.source === 'builtin' ? '#06b6d4' : '#34d399'
  return (
    <div
      className="flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[7.5px] text-white/50 transition-colors"
      style={{ borderColor: sourceColor + '25', background: sourceColor + '0a' }}
    >
      <span style={{ color: sourceColor + 'cc' }}>{skill.label}</span>
      {onRemove && (
        <button onClick={onRemove} className="text-white/20 hover:text-white/60 transition-colors">
          <X className="h-2 w-2" />
        </button>
      )}
    </div>
  )
}

// ── Profile card ──────────────────────────────────────────────────────────────

interface CardProps {
  profile:    AgentProfile
  isActive:   boolean
  llmLabel:   string
  onUpdate:   (data: Partial<AgentProfile>) => void
  onRemove:   () => void
  onActivate: () => void
  onUse:      () => void
}

function ProfileCard({ profile, isActive, llmLabel, onUpdate, onRemove, onActivate, onUse }: CardProps) {
  const [open,       setOpen]       = useState(false)
  const [editPrompt, setEditPrompt] = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [addingSkill,setAddingSkill]= useState(false)

  function copyPrompt() {
    navigator.clipboard.writeText(profile.systemPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function toggleSkill(id: string) {
    onUpdate({ skills: profile.skills.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s) })
  }

  function removeSkill(id: string) {
    onUpdate({ skills: profile.skills.filter(s => s.id !== id) })
  }

  const [skillSearch, setSkillSearch] = useState('')

  function addGlobalSkill(id: string) {
    const entry = SKILL_LIBRARY.find(s => s.id === id)
    if (!entry || profile.skills.some(s => s.id === id)) return
    onUpdate({ skills: [...profile.skills, { id, name: id, label: entry.name, source: 'global' as const, enabled: true }] })
    setAddingSkill(false)
    setSkillSearch('')
  }

  const activeSkills = profile.skills.filter(s => s.enabled)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border transition-all',
        profile.enabled ? 'border-white/10 bg-white/[0.025]' : 'border-white/5 bg-white/[0.01] opacity-60',
        isActive && 'ring-1',
      )}
      style={isActive ? { outline: `1px solid ${profile.color}40` } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: profile.color + '18', border: `1px solid ${profile.color}30` }}
        >
          {profile.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10.5px] font-medium text-white/75">{profile.name}</span>
            {isActive && (
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-cyan-400">activo</span>
            )}
            {profile.isBuiltin && (
              <span className="rounded-full border border-white/10 px-1.5 py-0.5 font-mono text-[7px] text-white/25">built-in</span>
            )}
            <CategoryBadge cat={profile.category} />
          </div>
          <div className="mt-0.5 font-mono text-[8.5px] text-white/35 truncate">{profile.description}</div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {activeSkills.slice(0, 4).map(s => (
              <span key={s.id} className="rounded-full border border-violet-400/15 bg-violet-400/6 px-1.5 py-0.5 font-mono text-[7px] text-violet-400/60">
                {s.label}
              </span>
            ))}
            {activeSkills.length > 4 && (
              <span className="font-mono text-[7px] text-white/25">+{activeSkills.length - 4} más</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Stats */}
          {profile.useCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 font-mono text-[8px] text-white/25">
              <Zap className="h-2.5 w-2.5" />{profile.useCount}
            </div>
          )}

          {/* Enable toggle */}
          <button
            onClick={() => onUpdate({ enabled: !profile.enabled })}
            className={cn('relative h-[18px] w-8 rounded-full transition-colors', profile.enabled ? 'bg-cyan-400/30' : 'bg-white/10')}
          >
            <span className={cn('absolute top-[3px] h-3 w-3 rounded-full transition-transform', profile.enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30')} />
          </button>

          {/* Use / activate */}
          <button
            onClick={() => { onActivate(); onUse() }}
            className={cn(
              'rounded-lg border px-2.5 py-1 font-mono text-[8.5px] transition-colors',
              isActive
                ? 'border-cyan-400/20 bg-cyan-400/6 text-cyan-400/50 cursor-default'
                : 'border-cyan-400/20 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15 cursor-pointer',
            )}
          >
            {isActive ? 'Activo' : 'Activar'}
          </button>

          {/* Expand */}
          <button onClick={() => setOpen(v => !v)} className="rounded-lg border border-white/8 p-1 text-white/30 hover:text-white/60 transition-colors">
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {open && (
        <div className="border-t border-white/8 bg-black/20 p-4 space-y-4">
          {/* LLM Profile selector */}
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">Modelo LLM</label>
            <select
              className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 outline-none focus:border-white/20 transition-colors"
              value={profile.llmProfileId}
              onChange={e => onUpdate({ llmProfileId: e.target.value })}
            >
              <option value={profile.llmProfileId}>{llmLabel}</option>
              <option disabled>── Cambiar en LLM tab ──</option>
            </select>
            <div className="mt-1 font-mono text-[7.5px] text-white/20">Configurar modelos en la pestaña LLM ◈</div>
          </div>

          {/* Skills manager */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-[8.5px] uppercase tracking-wider text-white/30">
                Skills activos ({activeSkills.length}/{profile.skills.length})
              </label>
              <button
                onClick={() => setAddingSkill(v => !v)}
                className="flex items-center gap-1 font-mono text-[8px] text-violet-400/60 hover:text-violet-400 transition-colors"
              >
                <Plus className="h-2.5 w-2.5" />Añadir skill
              </button>
            </div>

            {/* Skill chips */}
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(s => (
                <div
                  key={s.id}
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[7.5px] transition-opacity',
                    !s.enabled && 'opacity-40',
                  )}
                  style={{ borderColor: (s.source === 'global' ? '#a78bfa' : '#06b6d4') + '25' }}
                >
                  <button onClick={() => toggleSkill(s.id)} className="text-white/40 hover:text-white/70 transition-colors" title={s.enabled ? 'Desactivar' : 'Activar'}>
                    <span style={{ color: s.enabled ? (s.source === 'global' ? '#a78bfacc' : '#06b6d4cc') : undefined }}>
                      {s.label}
                    </span>
                  </button>
                  <button onClick={() => removeSkill(s.id)} className="text-white/15 hover:text-red-400/60 transition-colors">
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add skill picker — powered by SKILL_LIBRARY */}
            {addingSkill && (
              <div className="mt-2 rounded-xl border border-white/8 bg-black/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">
                    Skills disponibles — {SKILL_LIBRARY.length} en catálogo
                  </div>
                  <button onClick={() => { setAddingSkill(false); setSkillSearch('') }} className="text-white/20 hover:text-white/50">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {/* Search within picker */}
                <div className="relative mb-2">
                  <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/25" />
                  <input
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    placeholder="Buscar skill…"
                    className="w-full rounded-lg border border-white/8 bg-white/[0.02] pl-6 pr-2 py-1 font-mono text-[8.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: 'thin' }}>
                  {(skillSearch.trim() ? searchSkills(skillSearch) : SKILL_LIBRARY)
                    .filter(s => !profile.skills.some(ps => ps.id === s.id))
                    .map(s => {
                      const catMeta = SKILL_CATEGORY_META[s.category]
                      return (
                        <button
                          key={s.id}
                          onClick={() => addGlobalSkill(s.id)}
                          className="flex w-full items-start gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          <span className="mt-0.5 text-[9px]">{catMeta.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-[9px] text-white/60">{s.name}</div>
                            <div className="truncate text-[7.5px] text-white/30">{s.description.slice(0, 60)}…</div>
                          </div>
                          <span
                            className="shrink-0 self-start rounded-full border px-1.5 py-0.5 font-mono text-[7px]"
                            style={{ borderColor: skillCategoryColor(s.category) + '30', color: skillCategoryColor(s.category) + 'aa' }}
                          >
                            {catMeta.label}
                          </span>
                        </button>
                      )
                    })
                  }
                </div>
              </div>
            )}
          </div>

          {/* System prompt editor */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-mono text-[8.5px] uppercase tracking-wider text-white/30">System Prompt</label>
              <div className="flex items-center gap-2">
                <button onClick={copyPrompt} className="flex items-center gap-1 font-mono text-[8px] text-white/30 hover:text-white/60 transition-colors">
                  {copied ? <><Check className="h-2.5 w-2.5 text-emerald-400" /><span className="text-emerald-400">Copiado</span></> : <><Copy className="h-2.5 w-2.5" />Copiar</>}
                </button>
                <button onClick={() => setEditPrompt(v => !v)} className="flex items-center gap-1 font-mono text-[8px] text-white/30 hover:text-white/60 transition-colors">
                  <Edit3 className="h-2.5 w-2.5" />{editPrompt ? 'Vista previa' : 'Editar'}
                </button>
              </div>
            </div>
            {editPrompt ? (
              <textarea
                rows={8}
                className="w-full resize-y rounded-xl border border-white/8 bg-black/20 p-3 font-mono text-[9px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors leading-relaxed"
                value={profile.systemPrompt}
                onChange={e => onUpdate({ systemPrompt: e.target.value })}
              />
            ) : (
              <div className="max-h-32 overflow-y-auto rounded-xl border border-white/8 bg-black/30 p-3 font-mono text-[8.5px] text-white/40 leading-relaxed whitespace-pre-wrap" style={{ scrollbarWidth: 'thin' }}>
                {profile.systemPrompt}
              </div>
            )}
          </div>

          {/* Context files */}
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1">Archivos de contexto</label>
            <div className="space-y-1">
              {profile.contextFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 rounded-lg border border-white/6 bg-white/[0.02] px-2.5 py-1 font-mono text-[8.5px] text-white/40 truncate">{f}</span>
                  <button
                    onClick={() => onUpdate({ contextFiles: profile.contextFiles.filter((_, j) => j !== i) })}
                    className="text-white/15 hover:text-red-400/60 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Añadir ruta de archivo…"
                className="w-full rounded-lg border border-white/6 bg-black/20 px-2.5 py-1 font-mono text-[8.5px] text-white/40 placeholder-white/15 outline-none focus:border-white/20 transition-colors"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    onUpdate({ contextFiles: [...profile.contextFiles, e.currentTarget.value] })
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>

          {/* CLI command hint */}
          <div className="rounded-xl border border-white/6 bg-black/30 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <Terminal className="h-3 w-3 text-white/25" />
              <span className="font-mono text-[8px] uppercase tracking-wider text-white/25">Comando de referencia</span>
            </div>
            <div className="font-mono text-[8.5px] text-white/40 break-all">
              {activeSkills.length > 0
                ? `# Activar en Claude Code:\n# ${activeSkills.map(s => `/${s.name}`).join('  ')}`
                : '# Sin skills activos — añade skills para ver los comandos'
              }
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-mono text-[8.5px] uppercase tracking-wider text-white/30 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.tags.map(tag => (
                <span key={tag} className="rounded-full border border-white/8 bg-white/[0.02] px-2 py-0.5 font-mono text-[7.5px] text-white/30">{tag}</span>
              ))}
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/6">
            <button
              onClick={() => { onActivate(); onUse() }}
              disabled={isActive}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[9px] transition-colors',
                isActive
                  ? 'border-cyan-400/15 text-cyan-400/40 cursor-default'
                  : 'border-cyan-400/25 bg-cyan-400/8 text-cyan-400 hover:bg-cyan-400/15 cursor-pointer',
              )}
            >
              <Star className="h-3 w-3" />{isActive ? 'Perfil activo' : 'Activar perfil'}
            </button>
            {!profile.isBuiltin && (
              <button
                onClick={onRemove}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-400/12 px-3 py-1.5 font-mono text-[9px] text-red-400/50 hover:border-red-400/25 hover:text-red-400/80 transition-colors"
              >
                <Trash2 className="h-3 w-3" />Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── New profile form ──────────────────────────────────────────────────────────

function NewProfileForm({ onAdd }: { onAdd: (p: AgentProfile) => void }) {
  const [open,    setOpen]    = useState(false)
  const [name,    setName]    = useState('')
  const [emoji,   setEmoji]   = useState('🤖')
  const [cat,     setCat]     = useState<AgentCategory>('custom')
  const [desc,    setDesc]    = useState('')

  function create() {
    if (!name) return
    const p: AgentProfile = {
      id:             crypto.randomUUID(),
      name,
      description:    desc,
      emoji,
      color:          CATEGORY_META[cat].color,
      category:       cat,
      llmProfileId:   'gemini-flash',
      skills:         [],
      systemPrompt:   `Eres el ${name} de JOOTACEEHUB.\n\n[Añade aquí las instrucciones específicas del perfil]`,
      contextFiles:   ['/home/jootacee/Documentos/PROYECTOS/JOOTACEEHUB/CLAUDE.md'],
      cliCommand:     '',
      enabled:        true,
      isBuiltin:      false,
      useCount:       0,
      lastUsed:       null,
      tags:           [cat],
    }
    onAdd(p)
    setName(''); setDesc(''); setEmoji('🤖'); setCat('custom')
    setOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 px-4 py-2.5 font-mono text-[9.5px] text-white/35 transition-colors hover:bg-white/[0.03] hover:text-white/55"
      >
        <Plus className="h-3 w-3" />Crear perfil de agente personalizado
      </button>
      {open && (
        <div className="border-t border-white/8 p-4 space-y-3 bg-violet-400/[0.02]">
          <div className="grid grid-cols-[48px_1fr] gap-2">
            <input
              type="text" maxLength={2} placeholder="🤖"
              className="rounded-lg border border-white/8 bg-black/20 px-2 py-1.5 font-mono text-lg text-center outline-none focus:border-white/20 transition-colors"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
            />
            <input
              type="text" placeholder="Nombre del perfil"
              className="rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn('rounded-lg border py-1 font-mono text-[7.5px] transition-colors', cat === c ? 'border-cyan-400/30 text-cyan-300' : 'border-white/8 text-white/30 hover:border-white/20')}
                style={cat === c ? { borderColor: CATEGORY_META[c].color + '40', color: CATEGORY_META[c].color } : {}}
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="Descripción breve"
            className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={create} disabled={!name} className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 font-mono text-[9px] text-emerald-400 hover:bg-emerald-400/15 transition-colors disabled:opacity-30">
              <Check className="h-3 w-3" />Crear perfil
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg border border-white/8 px-3 py-1.5 font-mono text-[9px] text-white/30 hover:text-white/55 transition-colors">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Summary ───────────────────────────────────────────────────────────────────

function Summary({ profiles, activeId }: { profiles: AgentProfile[]; activeId: string | null }) {
  const active   = profiles.find(p => p.id === activeId)
  const enabled  = profiles.filter(p => p.enabled).length
  const totalUse = profiles.reduce((s, p) => s + p.useCount, 0)
  const byCat    = CATEGORIES.map(c => ({ cat: c, count: profiles.filter(p => p.category === c && p.enabled).length })).filter(x => x.count > 0)

  return (
    <div className="space-y-3">
      {/* Active profile highlight */}
      {active && (
        <div
          className="flex items-center gap-3 rounded-xl border p-3"
          style={{ borderColor: active.color + '30', background: active.color + '08' }}
        >
          <div className="text-2xl">{active.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-medium text-white/70">{active.name}</span>
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-1.5 py-0.5 font-mono text-[7px] uppercase text-cyan-400">activo</span>
            </div>
            <div className="font-mono text-[8.5px] text-white/35 mt-0.5">{active.description}</div>
            <div className="mt-1 flex items-center gap-3 font-mono text-[7.5px] text-white/25">
              <span>{active.skills.filter(s => s.enabled).length} skills</span>
              <span>LLM: {active.llmProfileId}</span>
              {active.useCount > 0 && <span><Zap className="inline h-2 w-2 mr-0.5" />{active.useCount} usos</span>}
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total perfiles', value: String(profiles.length) },
          { label: 'Habilitados',    value: String(enabled) },
          { label: 'Total usos',     value: String(totalUse) },
          { label: 'Categorías',     value: String(byCat.length) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2 text-center">
            <div className="font-mono text-[7.5px] text-white/25 uppercase tracking-wider">{label}</div>
            <div className="font-mono text-[14px] font-medium text-white/50 mt-0.5">{value}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="flex flex-wrap gap-1.5">
        {byCat.map(({ cat, count }) => (
          <div key={cat} className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.02] px-2.5 py-1">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_META[cat].color }} />
            <span className="font-mono text-[8px] text-white/40">{CATEGORY_META[cat].label}</span>
            <span className="font-mono text-[7.5px] text-white/25">{count}</span>
          </div>
        ))}
      </div>

      {/* Skills catalog info */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-400/10 bg-blue-400/[0.03] px-3 py-2.5">
        <BookOpen className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-400/50" />
        <div className="font-mono text-[8.5px] text-white/40 leading-relaxed">
          <span className="text-white/55">{SKILL_LIBRARY.length} skills curadas</span> en catálogo — de 1265 disponibles en{' '}
          <code className="text-blue-400/60">~/.claude/skills/</code> — con metadata completa: capabilities, use cases, notas de stack.{' '}
          Explorar en la pestaña <span className="text-white/55">Biblioteca ◈</span>.
        </div>
      </div>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function AgentProfilesTab() {
  const { state, dispatch } = useAdmin()
  const [filterCat, setFilterCat] = useState<AgentCategory | 'all'>('all')
  const [search,    setSearch]    = useState('')

  const rawProfiles = state.aiConfig.agentProfiles
  const profiles    = useMemo(() => (rawProfiles ?? []) as AgentProfile[], [rawProfiles])
  const activeId    = state.aiConfig.activeAgentProfileId ?? null
  const llmProfiles = state.aiConfig.profiles

  const filtered = useMemo(() => {
    let list = profiles
    if (filterCat !== 'all') list = list.filter(p => p.category === filterCat)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.skills.some(s => s.label.toLowerCase().includes(q))
      )
    }
    return list
  }, [profiles, filterCat, search])

  function update(id: string, data: Partial<AgentProfile>) {
    dispatch({ type: 'AGENT_PROFILE_UPDATE', payload: { id, data } })
  }

  function remove(id: string) {
    dispatch({ type: 'AGENT_PROFILE_REMOVE', payload: id })
  }

  function setActive(id: string) {
    dispatch({ type: 'AGENT_PROFILE_SET_ACTIVE', payload: id })
  }

  function incrementUse(id: string) {
    dispatch({ type: 'AGENT_PROFILE_INCREMENT_USE', payload: id })
  }

  function addProfile(p: AgentProfile) {
    dispatch({ type: 'AGENT_PROFILE_ADD', payload: p })
  }

  const usedCats = useMemo(() => {
    const cats = new Set(profiles.map(p => p.category))
    return CATEGORIES.filter(c => cats.has(c))
  }, [profiles])

  return (
    <div className="space-y-4">

      <Summary profiles={profiles} activeId={activeId} />

      {/* Filter toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Buscar perfil, skill, tag…"
          className="flex-1 min-w-36 rounded-xl border border-white/8 bg-white/[0.02] py-1.5 pl-3 font-mono text-[9.5px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button
          onClick={() => setFilterCat('all')}
          className={cn('rounded-full border px-2.5 py-1 font-mono text-[8px] transition-colors', filterCat === 'all' ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400' : 'border-white/8 text-white/30 hover:border-white/20')}
        >
          Todos ({profiles.length})
        </button>
        {usedCats.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn('rounded-full border px-2.5 py-1 font-mono text-[8px] transition-colors')}
            style={filterCat === cat
              ? { borderColor: CATEGORY_META[cat].color + '40', background: CATEGORY_META[cat].color + '12', color: CATEGORY_META[cat].color }
              : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
            }
          >
            {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Profile cards */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/6 py-8 text-center font-mono text-[10px] text-white/20">
            No hay perfiles con ese filtro.
          </div>
        )}
        {filtered.map(profile => {
          const llm = llmProfiles.find((p: { id: string; label: string }) => p.id === profile.llmProfileId)
          return (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeId}
              llmLabel={llm?.label ?? profile.llmProfileId}
              onUpdate={data => update(profile.id, data)}
              onRemove={() => remove(profile.id)}
              onActivate={() => setActive(profile.id)}
              onUse={() => incrementUse(profile.id)}
            />
          )
        })}
      </div>

      <NewProfileForm onAdd={addProfile} />
    </div>
  )
}
