'use client'

import React, { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import type { JournalPostRow, PostStatus } from '@/lib/cms/posts'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'

export default function PostsManagerPanel() {
  const { dispatch } = useAdmin()
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('')
  const [search, setSearch] = useState('')

  const { posts, total, loading, error, publish, unpublish, remove, refresh } = usePosts({
    status: statusFilter || undefined,
    search: search || undefined,
  })

  const draftCount    = posts.filter((p) => p.status === 'draft').length
  const publishedCount = posts.filter((p) => p.status === 'published').length
  const archivedCount  = posts.filter((p) => p.status === 'archived').length

  async function handleTogglePublish(post: JournalPostRow) {
    if (post.status === 'published') {
      await unpublish(post.id)
    } else {
      await publish(post.id)
    }
  }

  async function handleDelete(post: JournalPostRow) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    await remove(post.id)
  }

  function openEditor(post: JournalPostRow) {
    dispatch({ type: 'SET_PANEL', payload: 'content-editor' })
    dispatch({ type: 'SET_EDITING_POST_ID', payload: post.id })
  }

  return (
    <div className="flex h-full flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-white">Posts Manager</h2>
          <p className="text-xs text-white/40">{total} total entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={refresh} className="rounded px-2 py-1 text-[10px] text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors" title="Refresh">↻</button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="mx-6 mt-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs text-red-400">{error}</p>}

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-white/1 px-6 py-3">
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-rose-500/40 transition-colors"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PostStatus | '')}
          className="h-8 rounded-lg border border-white/10 bg-[#0e1520] px-2.5 text-xs text-white/70 outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 border-b border-white/5 px-6 py-2">
        <span className="flex items-center gap-1 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-white/30">Draft</span>
          <span className="text-white/60">{draftCount}</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-white/30">Published</span>
          <span className="text-white/60">{publishedCount}</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <span className="text-white/30">Archived</span>
          <span className="text-white/60">{archivedCount}</span>
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-rose-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="text-3xl opacity-30">📝</div>
            <p className="text-sm font-medium text-white/40">No posts yet</p>
            <p className="text-xs text-white/20">Create your first post to get started</p>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="sticky top-0 bg-[#080c14] z-10">
              <tr>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Title</th>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Slug</th>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Category</th>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Status</th>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Updated</th>
                <th className="border-b border-white/5 px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/4 hover:bg-white/2 transition-colors cursor-pointer group" onClick={() => openEditor(post)}>
                  <td className="px-4 py-3 text-xs">
                    <span className="max-w-[280px] truncate text-white/85 group-hover:text-white transition-colors">{post.title}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono text-[10px] text-white/25 max-w-[120px] truncate">{post.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="text-white/35">{post.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      post.status === 'published' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
                      post.status === 'draft' && 'bg-amber-500/12 text-amber-400/80 border-amber-500/15',
                      post.status === 'archived' && 'bg-white/5 text-white/30 border-white/8',
                      !['published', 'draft', 'archived'].includes(post.status) && 'bg-amber-500/12 text-amber-400/80 border-amber-500/15',
                    )}>{post.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="text-white/35">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-[10px] text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
                        onClick={() => handleTogglePublish(post)}
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? '↓ Unpublish' : '↑ Publish'}
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-[10px] text-red-400/40 hover:text-red-400 hover:bg-red-500/8 transition-colors"
                        onClick={() => handleDelete(post)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
