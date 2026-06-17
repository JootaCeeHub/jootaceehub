'use client'

import React from 'react'
import type { JournalPostRow } from '@/lib/supabase/types'

export interface RelatedPostsProps {
  posts: JournalPostRow[]
  loading?: boolean
  onSelect?: (post: JournalPostRow) => void
  showTitle?: boolean
}

export function RelatedPosts({
  posts,
  loading = false,
  onSelect,
  showTitle = true,
}: RelatedPostsProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-white/4" />)}
      </div>
    )
  }

  if (posts.length === 0) {
    return showTitle ? (
      <div>
        {showTitle && <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-3">Related Articles</p>}
        <p className="text-[10px] text-white/20 italic">No related articles found</p>
      </div>
    ) : null
  }

  return (
    <div className="space-y-3">
      {showTitle && <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-3">Related Articles</p>}
      {posts.map((post) => (
        <div
          key={post.id}
          className="group flex flex-col gap-1 rounded-xl border border-white/6 bg-white/2 p-3.5 cursor-pointer hover:border-rose-500/20 hover:bg-white/4 transition-all"
          onClick={() => onSelect?.(post)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect?.(post)}
        >
          <span className="text-[9px] font-medium uppercase tracking-wider text-rose-400/60">{post.category}</span>
          <p className="text-xs font-medium text-white/70 group-hover:text-white line-clamp-2 transition-colors leading-snug">{post.title}</p>
          <div className="flex items-center gap-2 text-[9px] text-white/25 font-mono">
            <span>{post.read_time} min</span>
            {post.published_at && (
              <>
                <span>·</span>
                <span suppressHydrationWarning>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </>
            )}
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/8 px-1.5 py-0.5 text-[9px] text-white/30">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
