'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RemovalItem {
  id: string
  title: string
  desc: string
  files: string[]
  detail: string
}

const REMOVAL_ITEMS: RemovalItem[] = [
  {
    id: 'supabase-dir',
    title: 'src/lib/supabase/ — 4 files deleted',
    desc: 'Core Supabase module: client, auth, context, SQL types',
    files: [
      'src/lib/supabase/client.ts (deleted)',
      'src/lib/supabase/auth.ts (deleted)',
      'src/lib/supabase/context.tsx (deleted)',
      'src/lib/supabase/types.ts (deleted)',
    ],
    detail: 'Deleted the entire @supabase/supabase-js wrapper. The SupabaseAuthProvider that previously wrapped the admin layout is gone. createClient() with placeholder URL fallback is no longer needed.',
  },
  {
    id: 'supabase-login',
    title: 'SupabaseLoginForm.tsx — deleted',
    desc: 'Supabase email/password login form removed from admin',
    files: [
      'src/components/admin/SupabaseLoginForm.tsx (deleted)',
    ],
    detail: 'The form called signInWithEmail() and resetPassword() from @/lib/supabase/auth. Auth is now Google OAuth or password gate.',
  },
  {
    id: 'auth-gate',
    title: 'AdminAuthGate — supabase mode removed',
    desc: 'Removed supabase mode. Auth modes: google | password | open',
    files: [
      'src/lib/auth/strategy.ts — AuthMode = \'google\' | \'password\' | \'open\'',
      'src/components/admin/AdminAuthGate.tsx — supabase branch deleted',
      'src/app/admin/layout.tsx — SupabaseAuthProvider wrapper removed',
    ],
    detail: 'AuthMode union narrowed from 4 to 3 variants. NEXT_PUBLIC_SUPABASE_URL no longer gates anything.',
  },
  {
    id: 'cms-posts',
    title: 'src/lib/cms/posts.ts — rewritten (Git-First stubs)',
    desc: 'Types defined locally. All write ops return VPS requirement message.',
    files: [
      'src/lib/cms/posts.ts — local JournalPostRow, PostStatus, PostCategory',
      'src/hooks/usePosts.ts — removed useSupabaseAuth dependency',
      'src/hooks/usePosts.test.ts — rewritten without supabase mocks',
    ],
    detail: 'listPosts() returns empty array (content is in src/content/articles/). Write ops (createPost, updatePost, etc.) return "VPS API required" message. author_id defaults to \'admin\' instead of user.id.',
  },
  {
    id: 'cms-media',
    title: 'src/lib/cms/media.ts — rewritten (VPS API)',
    desc: 'listMedia, uploadMedia, deleteMediaAsset delegate to src/lib/api/media.ts',
    files: [
      'src/lib/cms/media.ts — VPS API wrapper',
      'src/hooks/useMediaLibrary.ts — removed useSupabaseAuth, removed saveAsset',
      'src/components/admin/panels/MediaLibraryPanel.tsx — cloudinary_url → original_url',
      'src/components/cms/MediaUploader.tsx — removed cloudinary_public_id field',
    ],
    detail: 'MediaAssetRow defined locally. listMedia() maps VPS MediaFileMeta → MediaAssetRow. Images display via original_url from VPS CDN.',
  },
  {
    id: 'cms-related-tags',
    title: 'src/lib/cms/related.ts + tags.ts — fixed',
    desc: 'Removed JournalPostRow import from supabase/types. Tags read from static JSON.',
    files: [
      'src/lib/cms/related.ts — imports JournalPostRow from ./posts',
      'src/lib/cms/tags.ts — reads src/content/taxonomies/tags.json',
      'src/components/cms/RelatedPosts.tsx — imports from @/lib/cms/posts',
      'src/hooks/useRelatedPosts.ts — static useMemo, no supabase query',
      'src/hooks/useRelatedPosts.test.ts — rewritten (synchronous, no loading state)',
    ],
    detail: 'useRelatedPosts now accepts a candidates array and derives related posts synchronously via useMemo. No more .from(journal_posts).select(*) query.',
  },
  {
    id: 'newsletter',
    title: 'src/lib/newsletter/subscribe.ts — Supabase removed',
    desc: 'Direct Resend API only. No subscriber DB.',
    files: [
      'src/lib/newsletter/subscribe.ts — Resend-only, optimistic success without Resend',
      'src/lib/newsletter/subscribe.test.ts — rewritten without supabase mock',
    ],
    detail: 'If NEXT_PUBLIC_RESEND_API_KEY is absent, subscribe() returns optimistic success (dev/demo mode). No duplicate-check DB; Resend handles deduplication.',
  },
  {
    id: 'state-sync',
    title: 'useAdminStateSync — Supabase sync removed',
    desc: 'No-op hook. Persistence is localStorage + IndexedDB (store.tsx).',
    files: [
      'src/hooks/useAdminStateSync.ts — empty no-op function',
      'src/hooks/useAdminStateSync.test.ts — 2 simple tests (mount + returns undefined)',
    ],
    detail: 'Previously synced AdminState to Supabase admin_config table on every save. Now persistence is fully local: localStorage primary + IndexedDB backup (both handled in store.tsx automatically).',
  },
  {
    id: 'test-setup',
    title: 'src/test/setup.ts — Supabase mock removed',
    desc: 'Global vi.mock(@/lib/supabase/client) removed.',
    files: [
      'src/test/setup.ts — supabase mock block deleted',
    ],
    detail: 'The global mock that stubbed supabase.from().select().eq() etc. is no longer needed since no production code imports from @/lib/supabase/.',
  },
  {
    id: 'npm-package',
    title: '@supabase/supabase-js — uninstalled',
    desc: 'npm uninstall @supabase/supabase-js. Bundle impact ~280 KB removed.',
    files: [
      'package.json — @supabase/supabase-js removed',
      'package-lock.json — lock entries removed',
      '.env.example — NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY removed',
    ],
    detail: '@supabase/supabase-js + its transitive deps (realtime-js, postgrest-js, storage-js, functions-js, auth-js, websocket, etc.) are no longer in the bundle. Estimated gzip savings: ~80–120 KB.',
  },
]

const QUALITY_GATE = {
  typecheck: '0 errors',
  lint: '0 errors',
  tests: '416 passing (37 files)',
  build: '107 static pages',
  bundle: '~80–120 KB gzip savings (Supabase removed)',
}

export default function Phase5SupabaseTab() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="h-5 w-5 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Phase 5 — Supabase Elimination</h3>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Complete</span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          ADR-008 enforced: @supabase/supabase-js removed. Auth, posts, media, newsletter, and admin sync all migrated.
          Git is the canonical content source. VPS API handles writes.
        </p>
      </div>

      {/* Quality Gate */}
      <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Quality Gate at Close</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(QUALITY_GATE).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
              <div>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{key}</p>
                <p className="text-[11px] font-mono text-white/70">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Removal items */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40 px-1">
          {REMOVAL_ITEMS.length} removal items — all complete
        </p>
        {REMOVAL_ITEMS.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/6 bg-white/2 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-white/3 transition-colors"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80">{item.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{item.desc}</p>
              </div>
              {expanded === item.id
                ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-white/30 mt-0.5" />
                : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30 mt-0.5" />
              }
            </button>
            {expanded === item.id && (
              <div className="px-3.5 pb-3.5 space-y-3 border-t border-white/6 pt-3">
                <p className="text-[11px] text-white/50 leading-relaxed">{item.detail}</p>
                <div className="space-y-1">
                  {item.files.map((f) => (
                    <p key={f} className={cn(
                      'font-mono text-[10px]',
                      f.includes('(deleted)') ? 'text-red-400/70 line-through' : 'text-white/35'
                    )}>{f}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
