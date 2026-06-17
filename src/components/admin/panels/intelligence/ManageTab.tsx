'use client'

import { useState } from 'react'
import { useAdmin } from '@/lib/admin/store'
import type { IntelligenceFeed } from '@/lib/admin/types'
import { blankFeed, slugify } from './manage-constants'
import { FeedViewPanel } from './FeedViewPanel'
import { FeedForm } from './FeedForm'
import { FeedListPanel } from './FeedListPanel'

export function ManageTab() {
  const { dispatch } = useAdmin()

  // Navigation state
  const [viewingFeedId, setViewingFeedId]   = useState<string | null>(null)
  const [editingFeedId, setEditingFeedId]   = useState<string | null>(null)
  const [manageSearch,  setManageSearch]    = useState('')
  const [copiedId,      setCopiedId]        = useState<string | null>(null)

  // Edit form state
  const [editDraft,    setEditDraft]    = useState<Omit<IntelligenceFeed, 'id'>>(blankFeed())
  const [editTagInput, setEditTagInput] = useState('')

  // Add form state
  const [newFeed,     setNewFeed]     = useState<Omit<IntelligenceFeed, 'id'>>(blankFeed())
  const [newFeedId,   setNewFeedId]   = useState('')
  const [newTagInput, setNewTagInput] = useState('')
  const [addError,    setAddError]    = useState('')

  // ── URL copy helper ──────────────────────────────────────────────────────
  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url).catch(() => undefined)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // ── View / Edit navigation ───────────────────────────────────────────────
  function startView(feed: IntelligenceFeed) {
    setViewingFeedId(feed.id)
    setEditingFeedId(null)
    setEditDraft(blankFeed())
    setEditTagInput('')
  }

  function startEdit(feed: IntelligenceFeed) {
    const { id, ...rest } = feed
    setEditingFeedId(id)
    setViewingFeedId(null)
    setEditDraft(rest)
    setEditTagInput('')
  }

  function cancelEdit() {
    const prevId = editingFeedId
    setEditingFeedId(null)
    setEditDraft(blankFeed())
    setEditTagInput('')
    setViewingFeedId(prevId)
  }

  // ── Edit actions ─────────────────────────────────────────────────────────
  function handleSaveEdit() {
    if (!editingFeedId) return
    const prevId = editingFeedId
    dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id: editingFeedId, data: editDraft } })
    setEditingFeedId(null)
    setEditDraft(blankFeed())
    setEditTagInput('')
    setViewingFeedId(prevId)
  }

  function editTagAdd() {
    const tag = editTagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || (editDraft.tags ?? []).includes(tag)) { setEditTagInput(''); return }
    setEditDraft((p) => ({ ...p, tags: [...(p.tags ?? []), tag] }))
    setEditTagInput('')
  }

  // ── Add actions ──────────────────────────────────────────────────────────
  function handleAddFeed() {
    setAddError('')
    const id = newFeedId.trim() || slugify(newFeed.name)
    if (!id) { setAddError('Feed ID is required'); return }
    if (!newFeed.name.trim()) { setAddError('Feed name is required'); return }
    if (!newFeed.url.trim())  { setAddError('Feed URL is required'); return }
    dispatch({ type: 'INTELLIGENCE_ADD_FEED', payload: { ...newFeed, id } })
    setNewFeed(blankFeed())
    setNewFeedId('')
    setNewTagInput('')
  }

  function newTagAdd() {
    const tag = newTagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || (newFeed.tags ?? []).includes(tag)) { setNewTagInput(''); return }
    setNewFeed((p) => ({ ...p, tags: [...(p.tags ?? []), tag] }))
    setNewTagInput('')
  }

  const isViewing  = viewingFeedId !== null && editingFeedId === null
  const isEditing  = editingFeedId !== null

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ── Left: View / Edit / Add ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary/60">
          {isEditing ? 'Editing Feed' : isViewing ? 'Feed Details' : 'Add Custom Feed'}
        </div>

        {isViewing && (
          <FeedViewPanel
            feedId={viewingFeedId}
            copiedId={copiedId}
            onCopyUrl={copyUrl}
            onEdit={startEdit}
            onClose={() => setViewingFeedId(null)}
          />
        )}

        <div style={{ display: isViewing ? 'none' : undefined }} className="rounded-xl border border-border/40 bg-card/20 p-4">
          {isEditing ? (
            <FeedForm
              mode="edit"
              draft={editDraft}
              onChange={(u) => setEditDraft((p) => ({ ...p, ...u }))}
              tagInput={editTagInput}
              onTagInput={setEditTagInput}
              onAddTag={editTagAdd}
              onRemoveTag={(tag) => setEditDraft((p) => ({ ...p, tags: (p.tags ?? []).filter((t) => t !== tag) }))}
              onTogglePage={(page) => {
                const pages = editDraft.publishedPages ?? []
                setEditDraft((p) => ({ ...p, publishedPages: pages.includes(page) ? pages.filter((pg) => pg !== page) : [...pages, page] }))
              }}
              onSubmit={handleSaveEdit}
              onCancel={cancelEdit}
            />
          ) : (
            <FeedForm
              mode="add"
              draft={newFeed}
              onChange={(u) => setNewFeed((p) => ({ ...p, ...u }))}
              tagInput={newTagInput}
              onTagInput={setNewTagInput}
              onAddTag={newTagAdd}
              onRemoveTag={(tag) => setNewFeed((p) => ({ ...p, tags: (p.tags ?? []).filter((t) => t !== tag) }))}
              onTogglePage={(page) => {
                const pages = newFeed.publishedPages ?? []
                setNewFeed((p) => ({ ...p, publishedPages: pages.includes(page) ? pages.filter((pg) => pg !== page) : [...pages, page] }))
              }}
              feedId={newFeedId}
              onFeedId={setNewFeedId}
              onSubmit={handleAddFeed}
              error={addError}
            />
          )}
        </div>
      </div>

      {/* ── Right: Feed List ───────────────────────────────────────────────── */}
      <FeedListPanel
        editingFeedId={editingFeedId}
        viewingFeedId={viewingFeedId}
        search={manageSearch}
        onSearchChange={setManageSearch}
        onView={startView}
        onEdit={startEdit}
        onRemove={(id) => dispatch({ type: 'INTELLIGENCE_REMOVE_FEED', payload: id })}
      />
    </div>
  )
}
