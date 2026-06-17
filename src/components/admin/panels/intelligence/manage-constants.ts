import type { FeedCategory, IntelligenceFeed } from '@/lib/admin/types'

export const PUBLISHED_PAGES = ['home', 'research', 'resources', 'about', 'contact', 'labs', 'journal'] as const

export function blankFeed(): Omit<IntelligenceFeed, 'id'> {
  return {
    name: '', category: 'news', type: 'rss', plan: 'free',
    description: '', url: '', docsUrl: '', apiKey: '',
    enabled: true, connected: false, lastSync: null, itemCount: 0,
    icon: '📡', color: '#6366f1',
    tags: [], website: '', language: '', notes: '',
    publishable: false, publishedPages: [],
  }
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)     return 'just now'
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export const CATEGORY_LIST = ['news','tech','finance','research','social','opendata','ai','osint','conflict','security','aviation','cyber','disaster','energy','markets','climate','humanitarian','tool','resource','reference','community','newsletter','video','podcast','database']

export const CATEGORY_COLORS: Partial<Record<FeedCategory, string>> = {
  osint:    'border-amber-400/40 bg-amber-400/10 text-amber-300',
  conflict: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  security: 'border-red-400/40 bg-red-400/10 text-red-300',
  cyber:    'border-pink-400/40 bg-pink-400/10 text-pink-300',
  ai:       'border-violet-400/40 bg-violet-400/10 text-violet-300',
  tech:     'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
  research: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
  news:     'border-indigo-400/40 bg-indigo-400/10 text-indigo-300',
  tool:     'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
  resource: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
}
