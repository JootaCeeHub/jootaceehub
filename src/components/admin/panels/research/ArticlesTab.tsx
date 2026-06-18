'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { ResearchCategory, ResearchEntry } from '@/lib/admin/types'
import { ARTICLE_CATEGORIES, CAT_COLORS } from './utils'
import { TagChips } from './TagChips'
import { CmsStatusSelector, PreviewLink } from '@/components/admin/panels/cms/CmsStatusBadge'

export function ArticlesTab() {
  const { state, dispatch } = useAdmin()
  const [filter, setFilter] = useState<ResearchCategory | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = filter === 'all' ? state.researchRegistry : state.researchRegistry.filter((r) => r.category === filter)
  const published = state.researchRegistry.filter((r) => r.published).length

  const remove = (slug: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    dispatch({ type: 'SET_RESEARCH_REGISTRY', payload: state.researchRegistry.filter((r) => r.slug !== slug) })
  }

  function upd(slug: string, data: Partial<ResearchEntry>) {
    dispatch({ type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data } })
  }

  void published

  return (
    <div className="space-y-4">
      {/* Category breakdown */}
      <div className="grid grid-cols-4 gap-2">
        {ARTICLE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
          const count = state.researchRegistry.filter((r) => r.category === cat.id).length
          const pub = state.researchRegistry.filter((r) => r.category === cat.id && r.published).length
          return (
            <div key={cat.id} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 text-center">
              <div className="text-[16px] font-semibold tabular-nums" style={{ color: cat.color }}>{pub}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/50">{cat.label}</div>
              <div className="font-mono text-[8px] text-white/20">{count} total</div>
            </div>
          )
        })}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-1.5">
        {ARTICLE_CATEGORIES.map((cat) => {
          const count = cat.id === 'all' ? state.researchRegistry.length : state.researchRegistry.filter((r) => r.category === cat.id).length
          const active = filter === cat.id
          return (
            <button key={cat.id} onClick={() => setFilter(cat.id)} className={`rounded-lg border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${active ? 'bg-white/5 border-white/20' : 'border-white/8 text-white/30 hover:border-white/15 hover:text-white/55'}`} style={active ? { color: cat.color, borderColor: `${cat.color}40` } : undefined}>
              {cat.label} <span className="opacity-50">({count})</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        {filtered.map((article) => {
          const catColor = CAT_COLORS[article.category]
          const isOpen = expanded === article.slug
          return (
            <div key={article.slug} className={`rounded-xl border overflow-hidden transition-all ${article.published ? 'border-white/8 bg-white/[0.02]' : 'border-white/5 bg-white/[0.01] opacity-70'}`}>
              <button onClick={() => setExpanded(isOpen ? null : article.slug)} className="flex w-full items-center gap-4 px-4 py-3 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider" style={{ color: catColor, borderColor: `${catColor}30` }}>{article.category}</span>
                    <span className="font-mono text-[9px] text-white/25">{article.readTime}min</span>
                    {article.featured && <span className="rounded border border-amber-400/25 bg-amber-400/8 px-1.5 py-0.5 font-mono text-[8px] text-amber-400/80">Featured</span>}
                    {article.externalUrl && <span className="rounded border border-blue-400/20 px-1.5 py-0.5 font-mono text-[8px] text-blue-400/60">↗ externo</span>}
                  </div>
                  <h3 className="text-[12px] font-medium text-white/75 truncate">{article.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[8px] uppercase ${article.published ? 'border-emerald-400/25 text-emerald-400 bg-emerald-400/8' : 'border-white/10 text-white/30'}`}>{article.published ? 'Published' : 'Draft'}</span>
                  <span className="text-[9px] text-white/20">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/6 px-4 py-3 space-y-3">
                  {/* CMS Status Row */}
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                    <CmsStatusSelector contentType="research" contentId={article.slug} current={article.cmsStatus ?? (article.published ? 'published' : 'draft')} />
                    <PreviewLink contentType="research" contentId={article.slug} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => upd(article.slug, { published: !article.published })} className={`rounded-lg border px-2.5 py-1 font-mono text-[9px] transition-colors ${article.published ? 'border-emerald-400/25 text-emerald-400 bg-emerald-400/8 hover:bg-emerald-400/15' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                      {article.published ? '● Published' : '○ Draft'}
                    </button>
                    <button onClick={() => upd(article.slug, { featured: !article.featured })} className={`rounded-lg border px-2.5 py-1 font-mono text-[9px] transition-colors ${article.featured ? 'border-amber-400/25 text-amber-400 bg-amber-400/8' : 'border-white/10 text-white/30 hover:border-white/20'}`}>
                      {article.featured ? '★ Featured' : '☆ Feature'}
                    </button>
                    <select value={article.category} onChange={(e) => upd(article.slug, { category: e.target.value as ResearchCategory })} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 font-mono text-[9px] text-white/50 outline-none focus:border-white/20">
                      {ARTICLE_CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id} className="bg-[#0a0a14]">{c.label}</option>)}
                    </select>
                    <button onClick={() => remove(article.slug)} className="ml-auto rounded-lg border border-red-400/15 px-2.5 py-1 font-mono text-[9px] text-red-400/40 hover:border-red-400/30 hover:text-red-400/80 transition-colors">Eliminar</button>
                  </div>

                  <div className="space-y-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Título</div>
                    <input value={article.title} onChange={(e) => upd(article.slug, { title: e.target.value })} className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-emerald-400/25 transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Extracto</div>
                    <textarea value={article.excerpt} onChange={(e) => upd(article.slug, { excerpt: e.target.value })} rows={2} className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-emerald-400/25 transition-colors resize-none" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">Contenido (Markdown)</div>
                    <textarea value={article.body ?? ''} onChange={(e) => upd(article.slug, { body: e.target.value })} rows={8} placeholder="# Escribe aquí en markdown…" className="w-full rounded-lg border border-white/8 bg-black/10 px-3 py-2 font-mono text-[10px] text-white/55 placeholder-white/20 outline-none focus:border-emerald-400/25 transition-colors resize-y leading-relaxed" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">URL externa</div>
                    <input value={article.externalUrl ?? ''} onChange={(e) => upd(article.slug, { externalUrl: e.target.value })} placeholder="https://…" className="w-full rounded-lg border border-white/8 bg-black/20 px-3 py-1.5 text-[11px] text-white/65 placeholder-white/20 outline-none focus:border-emerald-400/25 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <TagChips tags={article.tags} />
                    <span className="shrink-0 font-mono text-[8.5px] text-white/15">{article.slug}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <div className="rounded-xl border border-white/5 bg-white/[0.01] py-8 text-center"><div className="text-[11px] text-white/20 max-w-xs mx-auto leading-relaxed">No hay artículos en esta categoría</div></div>}
      </div>
    </div>
  )
}
