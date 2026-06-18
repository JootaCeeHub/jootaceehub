'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { ProjectEntry, ResearchEntry, TrackedSourceType } from '@/lib/admin/types'
import {
  inp, area, F, Tog,
  STATUS_COL_PROJ, CAT_COL, SOURCE_TYPE_COL,
} from './primitives'

// ─── Projects editor (full CRUD) ──────────────────────────────────────────────

export function ProjectsEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const projects = state.projectsRegistry ?? []

  const upd = (id: string, data: Partial<ProjectEntry>) =>
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, data } })
  const rem = (id: string) => dispatch({ type: 'REMOVE_PROJECT', payload: id })
  const add = () => dispatch({
    type: 'ADD_PROJECT',
    payload: {
      id: crypto.randomUUID(), slug: `project-${Date.now()}`,
      title: 'Nuevo proyecto', tagline: '', category: 'ai', status: 'wip',
      featured: false, published: false, description: '',
      techStack: [], tags: [], screenshots: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      relatedResearch: [], relatedResources: [], accent: '#60a5fa',
    },
  })

  const total = projects.length
  const pub   = projects.filter(p => p.published).length
  const feat  = projects.filter(p => p.featured).length
  const live  = projects.filter(p => p.status === 'live').length

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Total',      v: total, c: '#94a3b8' },
          { l: 'Live',       v: live,  c: '#34d399' },
          { l: 'Publicados', v: pub,   c: '#60a5fa' },
          { l: 'Destacados', v: feat,  c: '#fbbf24' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-base font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="space-y-1.5">
        {projects.map(p => {
          const isExp = expanded === p.id
          const sc = STATUS_COL_PROJ[p.status] ?? '#94a3b8'
          return (
            <div key={p.id} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              {/* Row header */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sc }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/80 truncate">{p.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: sc, borderColor: `${sc}30`, background: `${sc}10` }}>{p.status}</span>
                    <span className="font-mono text-[7px] rounded border border-white/10 px-1.5 py-0.5 text-white/30 shrink-0">{p.category}</span>
                  </div>
                  <div className="text-[9px] text-white/35 truncate">{p.tagline || p.description}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(p.id, { published: !p.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      p.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {p.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(p.id, { featured: !p.featured })} title="Destacado"
                    className={cn('rounded p-1 transition-colors', p.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : p.id)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                  <button onClick={() => rem(p.id)} className="rounded p-1 text-white/15 hover:text-red-400 transition-colors">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Expanded form */}
              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={p.title} onChange={e => upd(p.id, { title: e.target.value })} />
                    </F>
                    <F l="Tagline">
                      <input className={inp} value={p.tagline} onChange={e => upd(p.id, { tagline: e.target.value })} />
                    </F>
                  </div>
                  <F l="Descripción">
                    <textarea rows={2} className={area} value={p.description} onChange={e => upd(p.id, { description: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Status">
                      <select className={cn(inp, 'cursor-pointer')} value={p.status}
                        onChange={e => upd(p.id, { status: e.target.value as ProjectEntry['status'] })}>
                        <option value="live">live</option>
                        <option value="beta">beta</option>
                        <option value="wip">wip</option>
                        <option value="archived">archived</option>
                      </select>
                    </F>
                    <F l="Categoría">
                      <select className={cn(inp, 'cursor-pointer')} value={p.category}
                        onChange={e => upd(p.id, { category: e.target.value as ProjectEntry['category'] })}>
                        {['ai','web','automation','infrastructure','tool','research','other'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </F>
                  </div>
                  <F l="Tech Stack (coma)">
                    <input className={inp} value={p.techStack.join(', ')}
                      onChange={e => upd(p.id, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Repo URL">
                      <input className={inp} value={p.repoUrl ?? ''} onChange={e => upd(p.id, { repoUrl: e.target.value })} />
                    </F>
                    <F l="Live URL">
                      <input className={inp} value={p.liveUrl ?? ''} onChange={e => upd(p.id, { liveUrl: e.target.value })} />
                    </F>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado" on={p.published} toggle={() => upd(p.id, { published: !p.published })} />
                    <Tog label="Destacado" on={p.featured}  toggle={() => upd(p.id, { featured: !p.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Añadir proyecto
      </button>
    </div>
  )
}

// ─── Research editor (full CRUD) ──────────────────────────────────────────────

export function ResearchEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState('all')
  const articles = state.researchRegistry ?? []

  const upd = (slug: string, data: Partial<ResearchEntry>) =>
    dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data } })
  const add = () => dispatch({
    type: 'ADD_RESEARCH_ENTRY',
    payload: {
      slug: `article-${Date.now()}`, title: 'Nuevo artículo',
      category: 'opinion', excerpt: '', tags: [], readTime: 5,
      published: false, featured: false,
    },
  })

  const cats = ['all', 'opinion', 'research', 'essays', 'news']
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter)
  const pub  = articles.filter(a => a.published).length
  const feat = articles.filter(a => a.featured).length

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { l: 'Total',      v: articles.length, c: '#94a3b8' },
          { l: 'Publicados', v: pub,              c: '#34d399' },
          { l: 'Destacados', v: feat,             c: '#fbbf24' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {cats.map(c => {
          const cc = CAT_COL[c] ?? '#94a3b8'
          return (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn('rounded-lg border px-2 py-0.5 font-mono text-[8px] transition-all',
                catFilter === c ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 text-white/25 hover:text-white/50')}
              style={catFilter === c && c !== 'all' ? { borderColor: `${cc}30`, color: cc, background: `${cc}10` } : {}}>
              {c === 'all' ? `todos (${articles.length})` : `${c} (${articles.filter(a => a.category === c).length})`}
            </button>
          )
        })}
      </div>

      {/* Article list */}
      <div className="space-y-1.5">
        {filtered.map(a => {
          const isExp = expanded === a.slug
          const cc    = CAT_COL[a.category] ?? '#94a3b8'
          return (
            <div key={a.slug} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/75 truncate">{a.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{a.readTime}min</span>
                  </div>
                  <div className="text-[9px] text-white/30 truncate">{a.excerpt}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(a.slug, { published: !a.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      a.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {a.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(a.slug, { featured: !a.featured })}
                    className={cn('rounded p-1 transition-colors', a.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : a.slug)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={a.title} onChange={e => upd(a.slug, { title: e.target.value })} />
                    </F>
                    <F l="Categoría">
                      <select className={cn(inp, 'cursor-pointer')} value={a.category}
                        onChange={e => upd(a.slug, { category: e.target.value as ResearchEntry['category'] })}>
                        <option value="opinion">opinion</option>
                        <option value="research">research</option>
                        <option value="essays">essays</option>
                        <option value="news">news</option>
                      </select>
                    </F>
                  </div>
                  <F l="Excerpt">
                    <textarea rows={2} className={area} value={a.excerpt} onChange={e => upd(a.slug, { excerpt: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Tags (coma)">
                      <input className={inp} value={a.tags.join(', ')}
                        onChange={e => upd(a.slug, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <F l="Lectura (min)">
                      <input type="number" className={inp} value={a.readTime}
                        onChange={e => upd(a.slug, { readTime: parseInt(e.target.value) || 1 })} />
                    </F>
                  </div>
                  <F l="URL Externa (opcional)">
                    <input className={inp} value={a.externalUrl ?? ''}
                      onChange={e => upd(a.slug, { externalUrl: e.target.value || undefined })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado" on={a.published} toggle={() => upd(a.slug, { published: !a.published })} />
                    <Tog label="Destacado" on={a.featured}  toggle={() => upd(a.slug, { featured: !a.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Añadir artículo
      </button>
    </div>
  )
}

// ─── Journal page editor (publication management) ─────────────────────────────

export function JournalPageEditor() {
  const { state, dispatch } = useAdmin()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState('all')
  const articles = state.researchRegistry ?? []

  const upd = (slug: string, data: Partial<ResearchEntry>) =>
    dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data } })
  const add = () => dispatch({
    type: 'ADD_RESEARCH_ENTRY',
    payload: {
      slug: `article-${Date.now()}`, title: 'Nuevo artículo',
      category: 'opinion', excerpt: '', tags: [], readTime: 5,
      published: false, featured: false,
    },
  })

  const featuredList = articles.filter(a => a.featured)
  const cats = ['all', 'opinion', 'research', 'essays', 'news']
  const filtered = catFilter === 'all' ? articles : articles.filter(a => a.category === catFilter)

  return (
    <div className="space-y-3">
      {/* Publication stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { l: 'Total',      v: articles.length,                          c: '#94a3b8' },
          { l: 'Publicados', v: articles.filter(a => a.published).length, c: '#34d399' },
          { l: 'Destacados', v: featuredList.length,                      c: '#fbbf24' },
          { l: 'Borradores', v: articles.filter(a => !a.published).length,c: '#fb923c' },
        ].map(s => (
          <div key={s.l} className="rounded-lg border border-white/8 bg-white/2 py-2 text-center">
            <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8px] text-white/30">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Featured article indicator */}
      {featuredList.length > 0 && (
        <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2 space-y-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-amber-400/60">Artículos destacados en portada</p>
          {featuredList.map(a => {
            const cc = CAT_COL[a.category] ?? '#94a3b8'
            return (
              <div key={a.slug} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="flex-1 text-[10px] text-white/65 truncate">{a.title}</span>
                <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border"
                  style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                <span className="font-mono text-[7px] text-white/25">{a.readTime}min</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {cats.map(c => {
          const cc = CAT_COL[c] ?? '#94a3b8'
          return (
            <button key={c} onClick={() => setCatFilter(c)}
              className={cn('rounded-lg border px-2 py-0.5 font-mono text-[8px] transition-all',
                catFilter === c ? 'border-white/20 bg-white/8 text-white/70' : 'border-white/8 text-white/25 hover:text-white/50')}
              style={catFilter === c && c !== 'all' ? { borderColor: `${cc}30`, color: cc, background: `${cc}10` } : {}}>
              {c === 'all' ? `todos (${articles.length})` : `${c} (${articles.filter(a => a.category === c).length})`}
            </button>
          )
        })}
      </div>

      {/* Article list */}
      <div className="space-y-1.5">
        {filtered.map(a => {
          const isExp = expanded === a.slug
          const cc    = CAT_COL[a.category] ?? '#94a3b8'
          return (
            <div key={a.slug} className={cn('rounded-xl border overflow-hidden transition-all',
              isExp ? 'border-white/15 bg-white/[0.03]' : 'border-white/8 bg-white/[0.015]')}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', a.published ? 'bg-emerald-400' : 'bg-white/20')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium text-white/75 truncate">{a.title}</span>
                    <span className="font-mono text-[7px] rounded px-1.5 py-0.5 border shrink-0"
                      style={{ color: cc, borderColor: `${cc}30`, background: `${cc}10` }}>{a.category}</span>
                    <span className="font-mono text-[7px] text-white/25 shrink-0">{a.readTime}min</span>
                  </div>
                  <div className="text-[9px] text-white/30 truncate">{a.excerpt}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => upd(a.slug, { published: !a.published })}
                    className={cn('rounded border px-1.5 py-0.5 font-mono text-[8px] transition-all',
                      a.published
                        ? 'border-emerald-400/25 bg-emerald-400/8 text-emerald-400/70'
                        : 'border-white/10 text-white/25 hover:border-white/20')}>
                    {a.published ? 'PUB' : 'DRAFT'}
                  </button>
                  <button onClick={() => upd(a.slug, { featured: !a.featured })}
                    title="Destacar en portada"
                    className={cn('rounded p-1 transition-colors', a.featured ? 'text-amber-400' : 'text-white/20 hover:text-white/50')}>
                    <Star size={10} />
                  </button>
                  <button onClick={() => setExpanded(isExp ? null : a.slug)}
                    className={cn('rounded p-1 transition-colors', isExp ? 'text-cyan-400/70' : 'text-white/30 hover:text-white/60')}>
                    <ChevronDown size={11} className={cn('transition-transform', isExp && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {isExp && (
                <div className="border-t border-white/6 px-3 py-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Título">
                      <input className={inp} value={a.title} onChange={e => upd(a.slug, { title: e.target.value })} />
                    </F>
                    <F l="Slug">
                      <input className={cn(inp, 'opacity-40 cursor-not-allowed')} value={a.slug} readOnly />
                    </F>
                  </div>
                  <F l="Categoría">
                    <select className={cn(inp, 'cursor-pointer')} value={a.category}
                      onChange={e => upd(a.slug, { category: e.target.value as ResearchEntry['category'] })}>
                      <option value="opinion">opinion</option>
                      <option value="research">research</option>
                      <option value="essays">essays</option>
                      <option value="news">news</option>
                    </select>
                  </F>
                  <F l="Excerpt">
                    <textarea rows={2} className={area} value={a.excerpt} onChange={e => upd(a.slug, { excerpt: e.target.value })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <F l="Tags (coma)">
                      <input className={inp} value={a.tags.join(', ')}
                        onChange={e => upd(a.slug, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
                    </F>
                    <F l="Lectura (min)">
                      <input type="number" className={inp} value={a.readTime}
                        onChange={e => upd(a.slug, { readTime: parseInt(e.target.value) || 1 })} />
                    </F>
                  </div>
                  <F l="URL Externa (opcional)">
                    <input className={inp} value={a.externalUrl ?? ''}
                      onChange={e => upd(a.slug, { externalUrl: e.target.value || undefined })} />
                  </F>
                  <div className="grid grid-cols-2 gap-2">
                    <Tog label="Publicado"       on={a.published} toggle={() => upd(a.slug, { published: !a.published })} />
                    <Tog label="Destacar portada" on={a.featured}  toggle={() => upd(a.slug, { featured: !a.featured })}  />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={add}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/15 py-2 text-[10px] text-cyan-400/40 hover:text-cyan-400/70 hover:border-cyan-400/30 transition-all">
        <Plus size={11} /> Nuevo artículo
      </button>
    </div>
  )
}

