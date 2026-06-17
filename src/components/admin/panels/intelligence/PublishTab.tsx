'use client'

import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'
import type { FeedCategory } from '@/lib/admin/types'

const PUBLISHED_PAGES = ['home', 'research', 'resources', 'about', 'contact', 'labs', 'journal'] as const

function truncateUrl(url: string, max = 36): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    const short = u.hostname + (u.pathname !== '/' ? u.pathname : '')
    return short.length > max ? short.slice(0, max) + '…' : short
  } catch {
    return url.slice(0, max) + (url.length > max ? '…' : '')
  }
}

const CATEGORY_COLORS: Partial<Record<FeedCategory, string>> = {
  osint:        'border-amber-400/40 bg-amber-400/10 text-amber-300',
  conflict:     'border-rose-400/40 bg-rose-400/10 text-rose-300',
  security:     'border-red-400/40 bg-red-400/10 text-red-300',
  cyber:        'border-pink-400/40 bg-pink-400/10 text-pink-300',
  disaster:     'border-orange-400/40 bg-orange-400/10 text-orange-300',
  aviation:     'border-sky-400/40 bg-sky-400/10 text-sky-300',
  energy:       'border-yellow-400/40 bg-yellow-400/10 text-yellow-300',
  markets:      'border-green-400/40 bg-green-400/10 text-green-300',
  finance:      'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  climate:      'border-teal-400/40 bg-teal-400/10 text-teal-300',
  humanitarian: 'border-lime-400/40 bg-lime-400/10 text-lime-300',
  ai:           'border-violet-400/40 bg-violet-400/10 text-violet-300',
  tech:         'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
  research:     'border-blue-400/40 bg-blue-400/10 text-blue-300',
  news:         'border-indigo-400/40 bg-indigo-400/10 text-indigo-300',
  social:       'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300',
  opendata:     'border-purple-400/40 bg-purple-400/10 text-purple-300',
  tool:         'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
  resource:     'border-blue-400/40 bg-blue-400/10 text-blue-300',
  reference:    'border-indigo-400/40 bg-indigo-400/10 text-indigo-300',
  community:    'border-pink-400/40 bg-pink-400/10 text-pink-300',
  newsletter:   'border-amber-400/40 bg-amber-400/10 text-amber-300',
  video:        'border-orange-400/40 bg-orange-400/10 text-orange-300',
  podcast:      'border-purple-400/40 bg-purple-400/10 text-purple-300',
  database:     'border-green-400/40 bg-green-400/10 text-green-300',
}

export function PublishTab({ publishableCount }: { publishableCount: number }) {
  const { state, dispatch } = useAdmin()
  const { intelligence } = state

  const publishableFeeds = intelligence.feeds.filter((f) => f.publishable ?? false)

  const assignedPagesCount = new Set(
    publishableFeeds.flatMap((f) => f.publishedPages ?? [])
  ).size

  const groupedByPage = (() => {
    const map = new Map<string, typeof publishableFeeds>()
    map.set('unassigned', [])
    for (const page of PUBLISHED_PAGES) map.set(page, [])

    for (const feed of publishableFeeds) {
      const pages = feed.publishedPages ?? []
      if (pages.length === 0) {
        map.get('unassigned')!.push(feed)
      } else {
        for (const page of pages) {
          if (!map.has(page)) map.set(page, [])
          map.get(page)!.push(feed)
        }
      }
    }
    for (const [key, feeds] of Array.from(map.entries())) {
      if (feeds.length === 0) map.delete(key)
    }
    return map
  })()

  function toggleFeedPage(feedId: string, page: string, currentPages: string[]) {
    const next = currentPages.includes(page)
      ? currentPages.filter((p) => p !== page)
      : [...currentPages, page]
    dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id: feedId, data: { publishedPages: next } } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">
            {publishableCount} publishable source{publishableCount !== 1 ? 's' : ''} · assigned to {assignedPagesCount} page{assignedPagesCount !== 1 ? 's' : ''}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
            Mark feeds as publishable in the Sources tab (☆), then assign them to pages below.
          </div>
        </div>
      </div>

      {publishableFeeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-12 text-center gap-2">
          <div className="text-2xl">☆</div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/40">No publishable feeds</div>
          <div className="font-mono text-[9px] text-muted-foreground/25">
            Open the Sources tab and click the ☆ star on feeds to mark them as publishable
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedByPage.entries()).map(([page, feeds]) => (
            <div key={page} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-primary">{page}</span>
                <span className="font-mono text-[9px] text-muted-foreground/50">{feeds.length} feed{feeds.length !== 1 ? 's' : ''}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="font-mono text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                    onClick={() => {
                      for (const f of publishableFeeds) {
                        const pages = f.publishedPages ?? []
                        if (!pages.includes(page) && page !== 'unassigned') {
                          dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id: f.id, data: { publishedPages: [...pages, page] } } })
                        }
                      }
                    }}
                  >
                    Select all
                  </button>
                  <button
                    className="font-mono text-[9px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
                    onClick={() => {
                      for (const f of publishableFeeds) {
                        const pages = (f.publishedPages ?? []).filter((p) => p !== page)
                        dispatch({ type: 'INTELLIGENCE_UPDATE_FEED', payload: { id: f.id, data: { publishedPages: pages } } })
                      }
                    }}
                  >
                    Clear all
                  </button>
                </div>
              </div>

              {feeds.map((feed) => {
                const currentPages = feed.publishedPages ?? []
                const tags = feed.tags ?? []
                return (
                  <div key={feed.id} className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/20 px-4 py-3 hover:border-border/50 transition-colors">
                    <span className="shrink-0 text-base">{feed.icon}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[12px] font-medium text-foreground">{feed.name}</div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-widest', CATEGORY_COLORS[feed.category] ?? 'border-border/30 bg-card/40 text-muted-foreground')}>{feed.category}</span>
                        <span className={cn('rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest', feed.plan === 'free' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : feed.plan === 'freemium' ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-rose-400/40 bg-rose-400/10 text-rose-300')}>{feed.plan}</span>
                        {(feed.website || feed.url) && (
                          <a href={feed.website ?? feed.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-primary/60 hover:text-primary truncate transition-colors">
                            {truncateUrl(feed.website ?? feed.url, 32)}
                          </a>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag) => <span key={tag} className="rounded-full border border-border/20 bg-card/30 px-1.5 py-0.5 font-mono text-[7px] text-muted-foreground/40">#{tag}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {PUBLISHED_PAGES.map((pg) => (
                        <button
                          key={pg}
                          className={cn('cursor-pointer rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider transition-colors', currentPages.includes(pg) ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-border/20 bg-card/40 text-muted-foreground/40 hover:border-border/40 hover:text-muted-foreground/60')}
                          onClick={() => toggleFeedPage(feed.id, pg, currentPages)}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
