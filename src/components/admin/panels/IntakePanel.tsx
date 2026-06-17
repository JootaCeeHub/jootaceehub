'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'
import type {
  AdminPanel, EntryType,
  ProjectEntry, ResearchEntry, CuratedLink, DriveResource,
  TrackedSource, LabEntry, DataSource, IntelligenceFeed,
} from '@/lib/admin/types'
import {
  ENTRY_TYPES, makeDefaults, slugify, uid, extractDomain, parseTags,
  type IntakeForm,
} from './intake/constants'
import { FormFields } from './intake/FormFields'

export default function IntakePanel() {
  const { state, dispatch } = useAdmin()
  const [selectedType, setSelectedType] = useState<EntryType>('project')
  const [form, setForm]     = useState<IntakeForm>(makeDefaults())
  const [success, setSuccess] = useState<{ label: string; panel: AdminPanel } | null>(null)

  useEffect(() => {
    if (state.intakeType) {
      setSelectedType(state.intakeType)
      setForm(makeDefaults())
      setSuccess(null)
      dispatch({ type: 'SET_INTAKE_TYPE', payload: null })
    }
  }, [state.intakeType, dispatch])

  const currentType = ENTRY_TYPES.find(t => t.id === selectedType)!

  const set = useCallback(<K extends keyof IntakeForm>(k: K, v: IntakeForm[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'title' && selectedType === 'lab') next.labKey = slugify(v as string)
      return next
    })
  }, [selectedType])

  const switchType = useCallback((type: EntryType) => {
    setSelectedType(type)
    setForm(makeDefaults())
    setSuccess(null)
  }, [])

  const isValid = useMemo(() => {
    if (!form.title.trim()) return false
    if ((selectedType === 'resource' || selectedType === 'source' || selectedType === 'github-showcase' || selectedType === 'intel-source') && !form.url.trim()) return false
    if (selectedType === 'drive' && !form.driveUrl.trim()) return false
    return true
  }, [selectedType, form.title, form.url, form.driveUrl])

  const handleSubmit = useCallback(() => {
    const now = new Date().toISOString()
    switch (selectedType) {
      case 'project': {
        const entry: ProjectEntry = {
          id: uid(), slug: slugify(form.title), title: form.title, tagline: form.tagline,
          category: form.projectCategory, status: form.projectStatus, featured: form.featured,
          published: form.published, description: form.description, body: '',
          techStack: parseTags(form.techStack), tags: parseTags(form.tags),
          repoUrl: form.repoUrl || undefined, liveUrl: form.liveUrl || undefined,
          screenshots: [], accent: form.accent, createdAt: now, updatedAt: now,
        }
        dispatch({ type: 'ADD_PROJECT', payload: entry })
        break
      }
      case 'research': {
        const entry: ResearchEntry = {
          slug: slugify(form.title), title: form.title, category: form.researchCategory,
          excerpt: form.excerpt || form.tagline, body: form.body || undefined,
          externalUrl: form.externalUrl || undefined, tags: parseTags(form.tags),
          readTime: form.readTime, published: form.published, featured: form.featured, createdAt: now,
        }
        dispatch({ type: 'ADD_RESEARCH_ENTRY', payload: entry })
        break
      }
      case 'resource': {
        const entry: CuratedLink = {
          id: uid(), url: form.url, title: form.title, description: form.description,
          category: form.linkCategory, tags: parseTags(form.tags), domain: extractDomain(form.url),
          published: form.published, featured: form.featured, addedAt: now,
        }
        dispatch({ type: 'ADD_CURATED_LINK', payload: entry })
        break
      }
      case 'drive': {
        const entry: DriveResource = {
          id: uid(), driveUrl: form.driveUrl, title: form.title, description: form.description,
          resourceType: form.resourceType, tags: parseTags(form.tags), published: form.published, addedAt: now,
        }
        dispatch({ type: 'ADD_DRIVE_RESOURCE', payload: entry })
        break
      }
      case 'source': {
        const entry: TrackedSource = {
          id: uid(), name: form.title, url: form.url, sourceType: form.sourceType,
          description: form.description, active: form.active, addedAt: now,
        }
        dispatch({ type: 'ADD_TRACKED_SOURCE', payload: entry })
        break
      }
      case 'lab': {
        const entry: LabEntry = {
          key: form.labKey || slugify(form.title), name: form.title, tagline: form.tagline,
          status: form.labStatus, description: form.description, stack: parseTags(form.stack),
          metrics: [], accent: form.labAccent, visible: form.labVisible,
        }
        dispatch({ type: 'ADD_LAB_ENTRY', payload: entry })
        break
      }
      case 'github-showcase': {
        const entry: DataSource = {
          id: uid(), type: 'github-repo', name: form.title, description: form.description,
          url: form.url, content: '', fileTree: [], metadata: {},
          status: 'pending', addedAt: now, byteSize: 0,
        }
        dispatch({ type: 'SOURCES_ADD', payload: entry })
        break
      }
      case 'intel-source': {
        const entry: IntelligenceFeed = {
          id: uid(), name: form.title, category: form.feedCategory, type: form.feedType,
          plan: form.feedPlan, description: form.description, url: form.url,
          docsUrl: form.feedDocsUrl, apiKey: form.feedApiKey,
          enabled: true, connected: false, lastSync: null, itemCount: 0,
          icon: form.feedIcon, color: form.feedColor, tags: parseTags(form.tags),
        }
        dispatch({ type: 'INTELLIGENCE_ADD_FEED', payload: entry })
        break
      }
    }
    setSuccess({ label: currentType.label, panel: currentType.targetPanel })
    setForm(makeDefaults())
    setTimeout(() => setSuccess(null), 5000)
  }, [selectedType, form, currentType, dispatch])

  const recentEntries = useMemo(() => {
    const items: { type: EntryType; label: string; sub: string; color: string }[] = [
      ...state.projectsRegistry.slice(-4).reverse().map(p => ({ type: 'project'  as EntryType, label: p.title, sub: p.status,       color: '#a78bfa' })),
      ...state.researchRegistry.slice(-4).reverse().map(r => ({ type: 'research' as EntryType, label: r.title, sub: r.category,     color: '#34d399' })),
      ...state.curatedLinks.slice(-4).reverse().map(l    => ({ type: 'resource'  as EntryType, label: l.title, sub: l.category,     color: '#38bdf8' })),
      ...state.driveResources.slice(-4).reverse().map(d  => ({ type: 'drive'     as EntryType, label: d.title, sub: d.resourceType, color: '#fb923c' })),
      ...state.trackedSources.slice(-4).reverse().map(s  => ({ type: 'source'    as EntryType, label: s.name,  sub: s.sourceType,   color: '#f472b6' })),
      ...state.labsRegistry.slice(-4).reverse().map(l    => ({ type: 'lab'       as EntryType, label: l.name,  sub: l.status,       color: '#f59e0b' })),
    ]
    return items.slice(0, 10)
  }, [state.projectsRegistry, state.researchRegistry, state.curatedLinks, state.driveResources, state.trackedSources, state.labsRegistry])

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-violet-400/60">Studio · Content Intake</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">New Entry</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">Select type · complete fields · submit to destination</p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ENTRY_TYPES.map((type) => {
          const Icon   = type.icon
          const active = selectedType === type.id
          return (
            <button
              key={type.id}
              onClick={() => switchType(type.id)}
              className={cn(
                'group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-3 text-center transition-all',
                active ? 'border-white/20 bg-white/[0.04] shadow-sm' : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.03]'
              )}
              style={active ? { borderColor: `${type.color}35`, background: `${type.color}08` } : {}}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors" style={{ background: `${type.color}18` }}>
                <span style={{ color: active ? type.color : undefined }}>
                  <Icon className="h-3.5 w-3.5 text-white/40 transition-colors group-hover:text-white/60" />
                </span>
              </div>
              <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors" style={active ? { color: type.color } : {}}>
                {type.label}
              </span>
              <span className="font-mono text-[7.5px] leading-snug text-white/22 transition-colors">{type.desc}</span>
              {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full" style={{ background: type.color }} />}
            </button>
          )
        })}
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2.5 overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] px-4 py-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="flex-1 font-mono text-[10px] text-emerald-400/90">{success.label} added — saved to state</span>
          <button onClick={() => dispatch({ type: 'SET_PANEL', payload: success.panel })} className="shrink-0 font-mono text-[9px] text-emerald-400/60 hover:text-emerald-400 transition-colors">
            View in {success.panel} →
          </button>
        </div>
      )}

      {/* Form */}
      <FormFields
        selectedType={selectedType}
        form={form}
        set={set}
        isValid={isValid}
        handleSubmit={handleSubmit}
        currentType={currentType}
      />

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Recent Entries</span>
            <span className="font-mono text-[9px] text-white/20">{recentEntries.length} items</span>
          </div>
          <div className="divide-y divide-white/5">
            {recentEntries.map((entry, i) => {
              const typeDef = ENTRY_TYPES.find(t => t.id === entry.type)!
              const Icon    = typeDef.icon
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ background: `${entry.color}15` }}>
                    <span style={{ color: entry.color }}><Icon className="h-3 w-3" /></span>
                  </div>
                  <span className="flex-1 min-w-0 font-mono text-[10px] text-white/60 truncate">{entry.label}</span>
                  <span className="shrink-0 rounded border border-white/10 bg-white/4 px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider text-white/28">{entry.sub}</span>
                  <button onClick={() => dispatch({ type: 'SET_PANEL', payload: typeDef.targetPanel })} className="shrink-0 font-mono text-[9px] text-white/22 hover:text-white/55 transition-colors">
                    View →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Registry summary */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {([
          { label: 'Projects', count: state.projectsRegistry.length, panel: 'projects'     as const, color: '#a78bfa' },
          { label: 'Articles', count: state.researchRegistry.length,  panel: 'research'     as const, color: '#34d399' },
          { label: 'Links',    count: state.curatedLinks.length,       panel: 'intelligence' as const, color: '#38bdf8' },
          { label: 'Drive',    count: state.driveResources.length,     panel: 'intelligence' as const, color: '#fb923c' },
          { label: 'Sources',  count: state.trackedSources.length,     panel: 'intelligence' as const, color: '#f472b6' },
          { label: 'Labs',     count: state.labsRegistry.length,       panel: 'labs'         as const, color: '#f59e0b' },
        ] as const).map((item) => (
          <button
            key={item.label}
            onClick={() => dispatch({ type: 'SET_PANEL', payload: item.panel })}
            className="flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02] py-3 transition-all hover:border-white/15 hover:bg-white/[0.035]"
          >
            <span className="font-mono text-[18px] font-bold tabular-nums leading-none" style={{ color: item.color }}>{item.count}</span>
            <span className="font-mono text-[7.5px] uppercase tracking-widest text-white/25">{item.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
