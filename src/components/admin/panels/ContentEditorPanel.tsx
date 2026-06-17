'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { getPost } from '@/lib/cms/posts'
import type { JournalPostRow, PostCategory } from '@/lib/cms/posts'
import { usePosts } from '@/hooks/usePosts'
import { useAdmin } from '@/lib/admin/store'
import MarkdownEditor from '@/components/cms/MarkdownEditor'
import { TableOfContents } from '@/components/cms/TableOfContents'
import { extractToc } from '@/lib/cms/toc'

const CATEGORIES: PostCategory[] = ['opinion', 'research', 'news', 'essays', 'tutorial']

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    published: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20',
    draft:     'bg-amber-500/10 text-amber-400/80 border-amber-500/12',
    archived:  'bg-white/5 text-white/30 border-white/8',
  }
  return `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[status] ?? map.draft}`
}

export default function ContentEditorPanel() {
  const { state, dispatch } = useAdmin()
  const postId = (state as { editingPostId?: string }).editingPostId

  const [post, setPost] = useState<JournalPostRow | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingPost, setLoadingPost] = useState(false)

  // Editable fields
  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState<PostCategory>('essays')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags]       = useState<string[]>([])
  const [coverUrl, setCoverUrl] = useState('')

  const { savePost, publish, unpublish } = usePosts()

  const toc = useMemo(() => extractToc(content), [content])

  // Load post on mount / postId change
  useEffect(() => {
    if (!postId) return
    setLoadingPost(true)
    getPost(postId).then(({ post: p, error: e }) => {
      setLoadingPost(false)
      if (e) { setLoadError(e); return }
      if (p) {
        setPost(p)
        setTitle(p.title)
        setContent(p.content)
        setExcerpt(p.excerpt ?? '')
        setCategory(p.category)
        setTags(p.tags ?? [])
        setCoverUrl(p.cover_image_url ?? '')
      }
    })
  }, [postId])

  const handleAutosave = useCallback(async (val: string) => {
    if (!post) return
    await savePost(post.id, {
      title,
      content: val,
      excerpt: excerpt || null,
      category,
      tags,
      cover_image_url: coverUrl || null,
    })
  }, [post, title, excerpt, category, tags, coverUrl, savePost])

  const handlePublishToggle = useCallback(async () => {
    if (!post) return
    // Save latest first
    await savePost(post.id, { title, content, excerpt: excerpt || null, category, tags, cover_image_url: coverUrl || null })
    if (post.status === 'published') {
      await unpublish(post.id)
      setPost((p) => p ? { ...p, status: 'draft' } : p)
    } else {
      await publish(post.id)
      setPost((p) => p ? { ...p, status: 'published' } : p)
    }
  }, [post, title, content, excerpt, category, tags, coverUrl, savePost, publish, unpublish])

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (!tag || tags.includes(tag)) return
    setTags((prev) => [...prev, tag])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  if (!postId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full">
        <p className="text-sm text-white/30">No post selected. Go back to Posts and open one.</p>
      </div>
    )
  }

  if (loadingPost) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-rose-400" />
      </div>
    )
  }

  if (loadError || !post) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full">
        <p className="text-sm text-red-400">{loadError ?? 'Post not found'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/8 bg-[#0a0f1a] px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/6 transition-colors"
          onClick={() => dispatch({ type: 'SET_PANEL', payload: 'posts' })}
        >
          ← Posts
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => savePost(post.id, { title })}
          placeholder="Post title…"
          className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-white/20 outline-none"
        />

        <span className={statusBadgeClass(post.status)}>{post.status}</span>

        {post.status === 'published' ? (
          <button type="button" className="rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/25 transition-colors" onClick={handlePublishToggle}>
            Unpublish
          </button>
        ) : (
          <button type="button" className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 transition-colors disabled:opacity-50" onClick={handlePublishToggle}>
            Publish
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-none overflow-y-auto border-r border-white/6 bg-white/1 p-4 space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Category</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PostCategory)}
              onBlur={() => savePost(post.id, { category })}
              className="w-full rounded-lg border border-white/10 bg-[#0e1520] px-2.5 py-1.5 text-xs text-white outline-none focus:border-rose-500/40 transition-colors cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Excerpt</p>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              onBlur={() => savePost(post.id, { excerpt: excerpt || null })}
              placeholder="Short description…"
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Tags</p>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              onBlur={addTag}
              placeholder="Add tag + Enter"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-rose-500/40 transition-colors"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-white/6 border border-white/10 px-2 py-0.5 text-[10px] text-white/60">
                    {tag}
                    <button type="button" className="text-white/30 hover:text-red-400 transition-colors cursor-pointer" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Cover image URL</p>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              onBlur={() => savePost(post.id, { cover_image_url: coverUrl || null })}
              placeholder="https://…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-rose-500/40 transition-colors"
            />
            {coverUrl && (
              <div className="relative mt-2 overflow-hidden rounded-lg border border-white/8 aspect-video bg-white/3 flex items-center justify-center text-white/15 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white/60 hover:text-white cursor-pointer transition-colors"
                  onClick={() => { setCoverUrl(''); savePost(post.id, { cover_image_url: null }) }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {toc.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Contents ({toc.length})</p>
              <TableOfContents items={toc} />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">Meta</p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/25">Created</span>
              <span className="font-mono text-white/50">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/25">Updated</span>
              <span className="font-mono text-white/50">{new Date(post.updated_at).toLocaleDateString()}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/25">Published</span>
                <span className="font-mono text-white/50">{new Date(post.published_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Markdown editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onAutosave={handleAutosave}
            autosaveMs={2000}
            minHeight={500}
          />
        </div>
      </div>
    </div>
  )
}
