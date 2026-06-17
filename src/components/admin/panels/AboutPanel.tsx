'use client'

import { useState, useRef } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import type { TimelineEntry } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'skills' | 'timeline'

const TIMELINE_TYPES: TimelineEntry['type'][] = ['work', 'project', 'certification', 'education', 'milestone']

const emptyEntry = (): Omit<TimelineEntry, 'id'> => ({
  year: '', title: '', org: '', description: '', type: 'work',
})

export default function AboutPanel() {
  const { state, dispatch } = useAdmin()
  const t = useTranslations('admin')
  const about = state.aboutConfig

  const [tab, setTab] = useState<Tab>('profile')

  // ── Profile form local state ─────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    headline: about.headline,
    bio: about.bio,
    location: about.location,
    availability: about.availability,
  })

  // ── Skills/tags local state ──────────────────────────────────────────────────
  const [skillInput, setSkillInput] = useState('')
  const [toolInput, setToolInput]   = useState('')
  const [certInput, setCertInput]   = useState('')
  const [collabInput, setCollabInput] = useState('')

  // ── Timeline form state ──────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [entryDraft, setEntryDraft]   = useState(emptyEntry())
  const idRef = useRef(0)

  const genId = () => `tl-${Date.now()}-${idRef.current++}`

  // ── Profile handlers ─────────────────────────────────────────────────────────
  function saveProfile() {
    dispatch({ type: 'UPDATE_ABOUT', payload: profile })
  }

  // ── Tag handlers ─────────────────────────────────────────────────────────────
  function addTag(field: 'skills' | 'tools' | 'certifications' | 'collaborationTypes', value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = about[field] as string[]
    if (current.includes(trimmed)) return
    dispatch({ type: 'UPDATE_ABOUT', payload: { [field]: [...current, trimmed] } })
  }

  function removeTag(field: 'skills' | 'tools' | 'certifications' | 'collaborationTypes', value: string) {
    const current = about[field] as string[]
    dispatch({ type: 'UPDATE_ABOUT', payload: { [field]: current.filter((v) => v !== value) } })
  }

  // ── Timeline handlers ────────────────────────────────────────────────────────
  function startAdd() {
    setEditingId(null)
    setEntryDraft(emptyEntry())
    setShowAddForm(true)
  }

  function startEdit(entry: TimelineEntry) {
    setEditingId(entry.id)
    setEntryDraft({ year: entry.year, title: entry.title, org: entry.org, description: entry.description, type: entry.type })
    setShowAddForm(true)
  }

  function cancelForm() {
    setShowAddForm(false)
    setEditingId(null)
    setEntryDraft(emptyEntry())
  }

  function saveForm() {
    if (!entryDraft.title.trim()) return
    if (editingId) {
      dispatch({ type: 'ABOUT_UPDATE_TIMELINE', payload: { id: editingId, data: entryDraft } })
    } else {
      dispatch({ type: 'ABOUT_ADD_TIMELINE', payload: { id: genId(), ...entryDraft } })
    }
    cancelForm()
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile',  label: 'Profile' },
    { id: 'skills',   label: 'Skills & Tools' },
    { id: 'timeline', label: 'Timeline' },
  ]

  // Shared field classes
  const inputCls = 'w-full rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors'
  const textareaCls = 'w-full rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors resize-none'
  const selectCls = 'w-full rounded-xl border border-border/30 bg-card/30 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/30 transition-colors'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60">{t('about.label') as string || 'About'}</div>
        <h2 className="text-2xl font-semibold text-foreground">About Config</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage biography, skills, and professional timeline</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/30 bg-card/20 p-1">
        {TABS.map((tb) => (
          <button key={tb.id} className={cn(
            'flex-1 rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200',
            tab === tb.id
              ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )} onClick={() => setTab(tb.id)}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ─── Profile Tab ──────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 mb-3">Identity</div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Headline</label>
            <input
              className={inputCls}
              value={profile.headline}
              onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
              placeholder="AI Systems Architect"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Bio</label>
            <textarea
              className={textareaCls}
              rows={5}
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short professional biography..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Location</label>
              <input
                className={inputCls}
                value={profile.location}
                onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                placeholder="Remote"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Availability</label>
              <select
                className={selectCls}
                value={profile.availability}
                onChange={(e) => setProfile((p) => ({ ...p, availability: e.target.value as typeof profile.availability }))}
              >
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Availability preview */}
          <div>
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider border',
              profile.availability === 'available'   ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' :
              profile.availability === 'limited'     ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' :
                                                       'border-rose-400/30 bg-rose-400/10 text-rose-300'
            )}>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                profile.availability === 'available' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                profile.availability === 'limited'   ? 'bg-amber-400' : 'bg-rose-400'
              )} />
              {profile.availability}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="rounded-xl border border-primary/30 bg-primary/10 px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={saveProfile}>Save Profile</button>
          </div>
        </div>
      )}

      {/* ─── Skills Tab ───────────────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <div className="space-y-4">
          {/* Skills */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 mb-3">Technical Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {about.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1 rounded-full border border-border/30 bg-card/40 px-2.5 py-1 font-mono text-[9px] text-muted-foreground/70">
                  {skill}
                  <span className="ml-0.5 text-muted-foreground/40 hover:text-rose-400 cursor-pointer transition-colors" onClick={() => removeTag('skills', skill)}>✕</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className={inputCls + ' flex-1'}
                placeholder="Add skill…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addTag('skills', skillInput); setSkillInput('') } }}
              />
              <button className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={() => { addTag('skills', skillInput); setSkillInput('') }}>Add</button>
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 mb-3">Tools &amp; Platforms</div>
            <div className="flex flex-wrap gap-1.5">
              {about.tools.map((tool) => (
                <span key={tool} className="flex items-center gap-1 rounded-full border border-border/30 bg-card/40 px-2.5 py-1 font-mono text-[9px] text-muted-foreground/70">
                  {tool}
                  <span className="ml-0.5 text-muted-foreground/40 hover:text-rose-400 cursor-pointer transition-colors" onClick={() => removeTag('tools', tool)}>✕</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className={inputCls + ' flex-1'}
                placeholder="Add tool…"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addTag('tools', toolInput); setToolInput('') } }}
              />
              <button className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={() => { addTag('tools', toolInput); setToolInput('') }}>Add</button>
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 mb-3">Certifications</div>
            <div className="flex flex-wrap gap-1.5">
              {about.certifications.length === 0 && (
                <span className="font-mono text-[10px] text-muted-foreground/40">None added</span>
              )}
              {about.certifications.map((cert) => (
                <span key={cert} className="flex items-center gap-1 rounded-full border border-border/30 bg-card/40 px-2.5 py-1 font-mono text-[9px] text-muted-foreground/70">
                  {cert}
                  <span className="ml-0.5 text-muted-foreground/40 hover:text-rose-400 cursor-pointer transition-colors" onClick={() => removeTag('certifications', cert)}>✕</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className={inputCls + ' flex-1'}
                placeholder="Add certification…"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addTag('certifications', certInput); setCertInput('') } }}
              />
              <button className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={() => { addTag('certifications', certInput); setCertInput('') }}>Add</button>
            </div>
          </div>

          {/* Collaboration Types */}
          <div className="rounded-xl border border-border/40 bg-card/25 p-5 space-y-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/60 mb-3">Collaboration Types</div>
            <div className="flex flex-wrap gap-1.5">
              {about.collaborationTypes.map((ct) => (
                <span key={ct} className="flex items-center gap-1 rounded-full border border-border/30 bg-card/40 px-2.5 py-1 font-mono text-[9px] text-muted-foreground/70">
                  {ct}
                  <span className="ml-0.5 text-muted-foreground/40 hover:text-rose-400 cursor-pointer transition-colors" onClick={() => removeTag('collaborationTypes', ct)}>✕</span>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className={inputCls + ' flex-1'}
                placeholder="e.g. AI Systems, Consulting…"
                value={collabInput}
                onChange={(e) => setCollabInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { addTag('collaborationTypes', collabInput); setCollabInput('') } }}
              />
              <button className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={() => { addTag('collaborationTypes', collabInput); setCollabInput('') }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Timeline Tab ─────────────────────────────────────────────────────── */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          {/* Add / Edit form */}
          {showAddForm && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary/70">{editingId ? 'Edit Entry' : 'New Timeline Entry'}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Year</label>
                  <input
                    className={inputCls}
                    placeholder="2024"
                    value={entryDraft.year}
                    onChange={(e) => setEntryDraft((d) => ({ ...d, year: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Type</label>
                  <select
                    className={selectCls}
                    value={entryDraft.type}
                    onChange={(e) => setEntryDraft((d) => ({ ...d, type: e.target.value as TimelineEntry['type'] }))}
                  >
                    {TIMELINE_TYPES.map((tt) => (
                      <option key={tt} value={tt}>{tt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Title</label>
                <input
                  className={inputCls}
                  placeholder="Role / Project / Certificate…"
                  value={entryDraft.title}
                  onChange={(e) => setEntryDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Organization</label>
                <input
                  className={inputCls}
                  placeholder="Company / Institution / Self"
                  value={entryDraft.org}
                  onChange={(e) => setEntryDraft((d) => ({ ...d, org: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Description</label>
                <textarea
                  className={textareaCls}
                  rows={2}
                  placeholder="Short description…"
                  value={entryDraft.description}
                  onChange={(e) => setEntryDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15 transition-colors cursor-pointer" onClick={saveForm}>
                  {editingId ? 'Update' : 'Add Entry'}
                </button>
                <button className="rounded-xl border border-border/30 bg-card/30 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={cancelForm}>Cancel</button>
              </div>
            </div>
          )}

          {/* Timeline list */}
          {about.timeline.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-10 gap-2">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/40">No timeline entries yet</div>
            </div>
          ) : (
            <div className="space-y-2">
              {[...about.timeline]
                .sort((a, b) => Number(b.year) - Number(a.year))
                .map((entry) => (
                  <div key={entry.id} className="group rounded-xl border border-border/30 bg-card/20 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-primary/60 tabular-nums shrink-0 mt-0.5">{entry.year}</span>
                        <span className={cn(
                          'rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest',
                          entry.type === 'work'          ? 'border-cyan-400/30 bg-cyan-400/8 text-cyan-300' :
                          entry.type === 'project'       ? 'border-violet-400/30 bg-violet-400/8 text-violet-300' :
                          entry.type === 'certification' ? 'border-amber-400/30 bg-amber-400/8 text-amber-300' :
                          entry.type === 'education'     ? 'border-blue-400/30 bg-blue-400/8 text-blue-300' :
                                                           'border-emerald-400/30 bg-emerald-400/8 text-emerald-300'
                        )}>{entry.type}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button className="rounded-lg border border-border/30 bg-card/60 px-1.5 py-1 font-mono text-[8px] text-muted-foreground/60 hover:text-foreground hover:border-border/50 transition-colors cursor-pointer" onClick={() => startEdit(entry)}>✎</button>
                        <button className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-1.5 py-1 font-mono text-[8px] text-rose-400/50 hover:text-rose-300 hover:border-rose-400/30 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'ABOUT_REMOVE_TIMELINE', payload: entry.id })}>✕</button>
                      </div>
                    </div>
                    <div className="text-[12px] font-medium text-foreground leading-tight">{entry.title}</div>
                    {entry.org && <div className="text-[10px] text-muted-foreground/60">{entry.org}</div>}
                    {entry.description && <div className="text-[10px] text-muted-foreground/50 mt-1 leading-relaxed">{entry.description}</div>}
                  </div>
                ))}
            </div>
          )}

          {!showAddForm && (
            <button className="w-full rounded-xl border border-dashed border-primary/20 bg-primary/5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-primary/60 hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-colors cursor-pointer" onClick={startAdd}>+ Add Timeline Entry</button>
          )}
        </div>
      )}
    </div>
  )
}
