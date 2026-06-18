'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, RefreshCw, ExternalLink, Filter, Grid3x3, List, Globe, AlertCircle } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { cn } from '@/lib/utils'
import type { IntelligenceFeed, FeedCategory } from '@/lib/admin/types'
import { defaultIntelligenceConfig } from '@/lib/admin/defaults/intelligence'
import { CATEGORY_META, EONET_CATEGORY_CONTEXT } from '@/lib/intelligence/categories'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HNStory {
  id: number
  title: string
  url?: string
  by: string
  score: number
  time: number
  descendants?: number
  type: string
}

interface FeedItem {
  id: string
  feedId: string
  feedName: string
  feedColor: string
  feedIcon: string
  title: string
  description?: string
  url: string
  source: string
  score?: number
  comments?: number
  tags?: string[]
  publishedAt: Date
  category: FeedCategory
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_KEY = 'jootacee-command-v2'

// ─── Data loading ─────────────────────────────────────────────────────────────

function loadAdminFeeds(): IntelligenceFeed[] {
  if (typeof window === 'undefined') return defaultIntelligenceConfig.feeds
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return defaultIntelligenceConfig.feeds
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const feeds = (parsed?.intelligenceConfig as { feeds?: IntelligenceFeed[] })?.feeds
    return Array.isArray(feeds) && feeds.length > 0 ? feeds : defaultIntelligenceConfig.feeds
  } catch {
    return defaultIntelligenceConfig.feeds
  }
}

// ─── Feed fetchers (all free, no API key, CORS-OK) ────────────────────────────

function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  return fn().catch(() => [])
}


async function fetchHN(limit = 20): Promise<FeedItem[]> {
  const idsRes  = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  const ids: number[] = await idsRes.json()
  const stories = await Promise.allSettled(
    ids.slice(0, limit).map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json() as Promise<HNStory>)
    )
  )
  return stories
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === 'fulfilled' && r.value?.type === 'story')
    .map(r => r.value)
    .filter(s => s.title)
    .map(s => {
      const host = s.url ? (() => { try { return new URL(s.url!).hostname.replace('www.', '') } catch { return 'ycombinator.com' } })() : 'ycombinator.com'
      return {
        id: `hn-${s.id}`,
        feedId: 'hackernews', feedName: 'Hacker News', feedColor: '#ff6600', feedIcon: '🟠',
        title: s.title,
        description: `Trending on Hacker News with ${s.score ?? 0} points and ${s.descendants ?? 0} comments. Shared by ${s.by}.`,
        url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
        source: host,
        score: s.score, comments: s.descendants ?? 0,
        publishedAt: new Date(s.time * 1000), category: 'tech' as FeedCategory,
      }
    })
}

async function fetchDevTo(limit = 15): Promise<FeedItem[]> {
  const res  = await fetch(`https://dev.to/api/articles?per_page=${limit}&top=1`)
  const data = await res.json() as Array<{
    id: number; title: string; url: string; description: string;
    published_at: string; positive_reactions_count: number;
    comments_count: number; tag_list: string[]; reading_time_minutes: number; user: { name: string }
  }>
  return data.map(a => ({
    id: `devto-${a.id}`,
    feedId: 'devto', feedName: 'DEV Community', feedColor: '#0a0a0a', feedIcon: '👩‍💻',
    title: a.title,
    description: a.description ? a.description.slice(0, 160).trim() + (a.description.length > 160 ? '…' : '') : undefined,
    url: a.url,
    source: 'dev.to',
    score: a.positive_reactions_count, comments: a.comments_count,
    tags: a.tag_list?.slice(0, 3),
    publishedAt: new Date(a.published_at), category: 'tech' as FeedCategory,
  }))
}

async function fetchArxiv(limit = 10): Promise<FeedItem[]> {
  const query = 'cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL'
  const res   = await fetch(`https://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`)
  const text  = await res.text()
  const doc   = new DOMParser().parseFromString(text, 'text/xml')
  const entries = Array.from(doc.querySelectorAll('entry'))
  return entries.map((e, i) => {
    const title    = e.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const summary  = e.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const link     = e.querySelector('link[title="html"]')?.getAttribute('href') ?? e.querySelector('id')?.textContent ?? ''
    const published = e.querySelector('published')?.textContent ?? ''
    const id       = e.querySelector('id')?.textContent ?? `arxiv-${i}`
    const authors  = Array.from(e.querySelectorAll('author name')).map(a => a.textContent?.trim()).filter(Boolean).slice(0, 2).join(', ')
    const desc     = summary ? summary.slice(0, 180).trim() + (summary.length > 180 ? '…' : '') : undefined
    return {
      id: `arxiv-${id.split('/').pop()}`,
      feedId: 'arxiv', feedName: 'arXiv', feedColor: '#b31b1b', feedIcon: '📄',
      title, description: desc,
      tags: authors ? [`By ${authors}`] : undefined,
      url: link, source: 'arxiv.org',
      publishedAt: new Date(published), category: 'research' as FeedCategory,
    }
  }).filter(i => i.title)
}

async function fetchUSGS(): Promise<FeedItem[]> {
  const res  = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson')
  const data = await res.json() as {
    features: Array<{
      id: string
      properties: { mag: number; place: string; time: number; url: string; felt: number | null; alert: string | null; significance: number; type: string }
      geometry: { coordinates: [number, number, number] }
    }>
  }
  return data.features.slice(0, 12).map(f => {
    const p = f.properties
    const depth = f.geometry.coordinates[2]
    const parts: string[] = [`Magnitude ${p.mag.toFixed(1)} ${p.type ?? 'earthquake'} near ${p.place}.`]
    if (depth !== undefined) parts.push(`Depth: ${depth.toFixed(0)} km.`)
    if (p.felt) parts.push(`Felt by ~${p.felt.toLocaleString()} people.`)
    if (p.alert) parts.push(`USGS alert level: ${p.alert.toUpperCase()}.`)
    return {
      id: `usgs-${f.id}`,
      feedId: 'usgs_quakes', feedName: 'USGS Earthquakes', feedColor: '#f59e0b', feedIcon: '🌍',
      title: `M${p.mag.toFixed(1)} — ${p.place}`,
      description: parts.join(' '),
      url: p.url,
      source: 'earthquake.usgs.gov',
      publishedAt: new Date(p.time), category: 'disaster' as FeedCategory,
    }
  })
}

async function fetchNASAEONET(): Promise<FeedItem[]> {
  const res  = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=15&days=14')
  const data = await res.json() as {
    events: Array<{
      id: string; title: string; description: string | null; link: string
      categories: Array<{ id: string; title: string }>
      geometry: Array<{ date: string; type: string; coordinates: number[] | number[][][] }>
    }>
  }
  return data.events.map(e => {
    const catId  = e.categories[0]?.id ?? ''
    const catTitle = e.categories[0]?.title ?? 'Natural Event'
    const ctx    = EONET_CATEGORY_CONTEXT[catId]
    const geo    = e.geometry?.[0]
    const lastSeen = geo?.date ? new Date(geo.date) : new Date()
    // Build coordinates string if point type
    let coordStr = ''
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates) && typeof geo.coordinates[0] === 'number') {
      const [lon, lat] = geo.coordinates as number[]
      coordStr = ` Coordinates: ${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}.`
    }
    const description = e.description
      ? e.description.slice(0, 180).trim()
      : ctx
        ? `${ctx.emoji} ${ctx.desc}${coordStr}`
        : `Active ${catTitle.toLowerCase()} event tracked by NASA Earth Observatory.${coordStr}`
    return {
      id: `eonet-${e.id}`,
      feedId: 'nasa_eonet', feedName: 'NASA EONET', feedColor: '#0b3d91', feedIcon: '🛰️',
      title: e.title,
      description,
      url: e.link,
      source: 'eonet.gsfc.nasa.gov',
      tags: [catTitle],
      publishedAt: lastSeen, category: (ctx?.cat ?? 'disaster') as FeedCategory,
    }
  })
}

async function fetchReliefWeb(type: 'disasters' | 'reports' = 'disasters', limit = 10): Promise<FeedItem[]> {
  const endpoint = type === 'disasters' ? 'disasters' : 'reports'
  const fields = type === 'disasters'
    ? 'fields[include][]=name&fields[include][]=status&fields[include][]=country.name&fields[include][]=type.name&fields[include][]=date'
    : 'fields[include][]=title&fields[include][]=body-html&fields[include][]=date&fields[include][]=source.name&fields[include][]=theme.name'
  const res  = await fetch(`https://api.reliefweb.int/v1/${endpoint}?appname=intelligence-feed&limit=${limit}&sort[]=date:desc&${fields}`)
  const data = await res.json() as {
    data: Array<{
      id: number; href: string
      fields: {
        name?: string; title?: string; status?: string
        country?: Array<{ name: string }>
        type?: Array<{ name: string }>
        source?: Array<{ name: string }>
        theme?: Array<{ name: string }>
        date?: { created: string }
      }
    }>
  }
  return (data.data ?? []).map(r => {
    const f = r.fields
    const title = f.name ?? f.title ?? 'ReliefWeb Update'
    const countries = f.country?.map(c => c.name).slice(0, 3).join(', ')
    const types = f.type?.map(t => t.name).join(', ')
    const themes = f.theme?.map(t => t.name).slice(0, 2)
    const sources = f.source?.map(s => s.name).slice(0, 2).join(', ')
    let desc: string | undefined
    if (type === 'disasters') {
      const parts: string[] = []
      if (types) parts.push(`Type: ${types}.`)
      if (countries) parts.push(`Affected: ${countries}.`)
      if (f.status) parts.push(`Status: ${f.status}.`)
      desc = parts.length ? parts.join(' ') : undefined
    } else {
      if (sources) desc = `Published by ${sources}.${themes?.length ? ' Topics: ' + themes.join(', ') + '.' : ''}`
    }
    return {
      id: `rw-${type}-${r.id}`,
      feedId: type === 'disasters' ? 'reliefweb_disasters' : 'reliefweb_crisis',
      feedName: 'ReliefWeb', feedColor: '#e63329', feedIcon: '🆘',
      title, description: desc,
      tags: countries ? [countries] : undefined,
      url: r.href,
      source: 'reliefweb.int',
      publishedAt: new Date(f.date?.created ?? Date.now()),
      category: 'humanitarian' as FeedCategory,
    }
  })
}

async function fetchRansomware(limit = 10): Promise<FeedItem[]> {
  const res  = await fetch(`https://api.ransomware.live/recentvictims`)
  const data = await res.json() as Array<{
    id?: string; post_title?: string; victim?: string; group_name?: string
    discovered?: string; website?: string; description?: string; country?: string
  }>
  return data.slice(0, limit).map((r, i) => {
    const group  = r.group_name ?? 'Unknown group'
    const target = r.victim ?? r.post_title ?? 'Unknown target'
    const parts: string[] = [`Ransomware attack claimed by threat actor "${group}".`]
    if (r.country) parts.push(`Target location: ${r.country}.`)
    if (r.description) parts.push(r.description.slice(0, 120).trim() + (r.description.length > 120 ? '…' : ''))
    return {
      id: `rlive-${r.id ?? i}`,
      feedId: 'ransomware_live', feedName: 'Ransomware.live', feedColor: '#ef4444', feedIcon: '💀',
      title: `${group} → ${target}`,
      description: parts.join(' '),
      url: r.website ? `https://${r.website}` : 'https://ransomware.live',
      source: 'ransomware.live',
      tags: [group],
      publishedAt: new Date(r.discovered ?? Date.now()), category: 'cyber' as FeedCategory,
    }
  })
}

// RSS via public rss2json.com proxy (free tier, no key, CORS-OK)
async function fetchRSS(feedId: string, feedName: string, feedColor: string, feedIcon: string, rssUrl: string, category: FeedCategory, limit = 12): Promise<FeedItem[]> {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=${limit}`
  const res  = await fetch(url)
  const data = await res.json() as { status: string; items: Array<{ guid: string; title: string; link: string; pubDate: string; description?: string }> }
  if (data.status !== 'ok') return []
  return data.items.map((item, i) => {
    // Strip HTML tags from RSS description
    const rawDesc = item.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? ''
    const desc = rawDesc.length > 10 ? rawDesc.slice(0, 160) + (rawDesc.length > 160 ? '…' : '') : undefined
    return {
      id: `rss-${feedId}-${item.guid ?? i}`,
      feedId, feedName, feedColor, feedIcon,
      title: item.title,
      description: desc,
      url: item.link,
      source: (() => { try { return new URL(item.link).hostname.replace('www.', '') } catch { return feedName } })(),
      publishedAt: new Date(item.pubDate), category,
    }
  }).filter(i => i.title)
}

// ─── Multi-source refresh engine ──────────────────────────────────────────────

async function fetchAllFeeds(feeds: IntelligenceFeed[]): Promise<FeedItem[]> {
  const enabled = new Set(feeds.filter(f => f.enabled).map(f => f.id))
  const has = (id: string) => enabled.has(id) || feeds.length === 0

  const fetchers: Promise<FeedItem[]>[] = []

  if (has('hackernews'))        fetchers.push(safe(() => fetchHN(20)))
  if (has('devto'))             fetchers.push(safe(() => fetchDevTo(15)))
  if (has('arxiv'))             fetchers.push(safe(() => fetchArxiv(10)))
  if (has('usgs_quakes'))       fetchers.push(safe(() => fetchUSGS()))
  if (has('nasa_eonet'))        fetchers.push(safe(() => fetchNASAEONET()))
  if (has('reliefweb_disasters'))fetchers.push(safe(() => fetchReliefWeb('disasters', 8)))
  if (has('ransomware_live'))   fetchers.push(safe(() => fetchRansomware(8)))

  // RSS feeds via rss2json proxy
  if (has('bno_news_rss'))
    fetchers.push(safe(() => fetchRSS('bno_news_rss', 'BNO News', '#cc0000', '📡', 'https://bnonews.com/index.php/feed/', 'news')))
  if (has('who_news'))
    fetchers.push(safe(() => fetchRSS('who_news', 'WHO News', '#009EDB', '🏥', 'https://www.who.int/rss-feeds/news-english.xml', 'security')))
  if (has('reddit_rss'))
    fetchers.push(safe(() => fetchRSS('reddit_rss', 'Reddit /r/worldnews', '#ff4500', '🟥', 'https://www.reddit.com/r/worldnews/.rss', 'news', 12)))

  const results = await Promise.allSettled(fetchers)
  const all = results
    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)

  // Sort by newest first
  return all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/20 px-4 py-3 text-center">
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function FeedCard({ feed, onClick, selected }: { feed: IntelligenceFeed; onClick: () => void; selected: boolean }) {
  const catMeta = CATEGORY_META[feed.category] ?? { label: feed.category, icon: '◆', color: '#94a3b8' }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-200',
        selected
          ? 'border-primary/40 bg-primary/[0.06] ring-1 ring-primary/20'
          : 'border-border/20 bg-card/20 hover:border-border/40 hover:bg-card/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/30 text-xl flex-shrink-0"
          style={{ backgroundColor: feed.color + '18', borderColor: feed.color + '33' }}>
          {feed.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm leading-tight truncate">{feed.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase"
              style={{ borderColor: catMeta.color + '40', color: catMeta.color, backgroundColor: catMeta.color + '15' }}>
              {catMeta.icon} {catMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{feed.description}</p>

      {/* Footer */}
      {feed.tags && feed.tags.length > 0 && (
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-border/10">
          <div className="flex gap-1">
            {feed.tags.slice(0, 2).map(tag => (
              <span key={tag} className="rounded-full bg-card/40 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/50">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </motion.button>
  )
}

function FeedItemRow({ item, view }: { item: FeedItem; view: 'grid' | 'list' }) {
  const timeAgo = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000 // eslint-disable-line react-hooks/purity
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const catMeta = CATEGORY_META[item.category] ?? { label: item.category, icon: '◆', color: '#94a3b8' }

  if (view === 'list') {
    return (
      <motion.a
        href={item.url} target="_blank" rel="noopener noreferrer"
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        className="group flex items-start gap-3 rounded-xl border border-border/15 bg-card/15 px-4 py-3.5 hover:border-border/30 hover:bg-card/25 transition-all duration-150"
      >
        {/* Feed icon */}
        <span className="text-base flex-shrink-0 mt-0.5">{item.feedIcon}</span>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {item.title}
          </p>

          {/* Description */}
          {item.description && (
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed mt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Category badge */}
            <span
              className="rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide flex-shrink-0"
              style={{ borderColor: catMeta.color + '40', color: catMeta.color, backgroundColor: catMeta.color + '12' }}
            >
              {catMeta.icon} {catMeta.label}
            </span>
            {/* Tags */}
            {item.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="rounded-full bg-card/40 border border-border/20 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/50 max-w-[120px] truncate">
                {tag}
              </span>
            ))}
            <span className="font-mono text-[9px] text-muted-foreground/40">{item.source}</span>
            {item.score !== undefined && (
              <span className="font-mono text-[9px] text-amber-400/70">▲ {item.score}</span>
            )}
            {item.comments !== undefined && (
              <span className="font-mono text-[9px] text-muted-foreground/40">{item.comments} cmt</span>
            )}
            <span className="font-mono text-[9px] text-muted-foreground/30 ml-auto flex-shrink-0">{timeAgo(item.publishedAt)}</span>
          </div>
        </div>

        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/60 flex-shrink-0 mt-1 transition-colors" />
      </motion.a>
    )
  }

  return (
    <motion.a
      href={item.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group flex flex-col rounded-xl border border-border/15 bg-card/15 p-4 hover:border-border/30 hover:bg-card/25 transition-all duration-150"
    >
      {/* Top meta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{item.feedIcon}</span>
          <span
            className="rounded-full border px-1.5 py-0.5 font-mono text-[7px] uppercase"
            style={{ borderColor: catMeta.color + '40', color: catMeta.color, backgroundColor: catMeta.color + '12' }}
          >
            {catMeta.icon} {catMeta.label}
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/30">{timeAgo(item.publishedAt)}</span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
        {item.title}
      </p>

      {/* Description */}
      {item.description && (
        <p className="text-[11px] text-muted-foreground/55 leading-relaxed mt-1.5 line-clamp-3 flex-1">
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/10">
        <span className="font-mono text-[9px] text-muted-foreground/35 truncate">{item.source}</span>
        {item.tags?.[0] && (
          <span className="rounded-full bg-card/40 border border-border/20 px-1.5 py-0.5 font-mono text-[7px] text-muted-foreground/40 truncate max-w-[80px]">
            {item.tags[0]}
          </span>
        )}
        {item.score !== undefined && (
          <span className="font-mono text-[9px] text-amber-400/70">▲ {item.score}</span>
        )}
        <ExternalLink className="h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 ml-auto transition-colors" />
      </div>
    </motion.a>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const [feeds, setFeeds]           = useState<IntelligenceFeed[]>([])
  const [items, setItems]           = useState<FeedItem[]>([])
  const [loading, setLoading]       = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [search, setSearch]         = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null)
  const [view, setView]             = useState<'grid' | 'list'>('list')
  const [error, setError]           = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load admin feeds from localStorage
  useEffect(() => {
    setFeeds(loadAdminFeeds()) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  // Fetch live items
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allItems = await fetchAllFeeds(feeds)
      setItems(allItems)
      setLastRefresh(new Date())
    } catch {
      setError('Failed to fetch live items. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [feeds])

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (feeds.length === 0) return
    refresh() // eslint-disable-line react-hooks/set-state-in-effect
  }, [feeds, refresh])

  // Auto-refresh every 30 min
  useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    refreshTimerRef.current = setInterval(() => refresh(), 30 * 60 * 1000)
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current) }
  }, [refresh])

  // Derived data
  const enabledFeeds = feeds.filter(f => f.enabled)

  const categories = Array.from(new Set(enabledFeeds.map(f => f.category)))

  const filteredFeeds = enabledFeeds.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory
    const matchSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      (f.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const filteredItems = items.filter(item => {
    const matchFeed = !selectedFeedId || item.feedId === selectedFeedId
    const matchCat  = activeCategory === 'all' || item.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !search ||
      item.title.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      (item.tags?.some(t => t.toLowerCase().includes(q)) ?? false) ||
      item.source.toLowerCase().includes(q)
    return matchFeed && matchCat && matchSearch
  })

  const timeAgo = (d: Date) => {
    const s = (Date.now() - d.getTime()) / 1000 // eslint-disable-line react-hooks/purity
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
  }

  return (
    <DomainLayout>
      {/* Breadcrumb */}
      <DomainBreadcrumb />

      {/* Hero */}
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/60 mb-2">
          Ecosystem · Intelligence
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Intelligence Feed</h1>
        <p className="text-muted-foreground text-sm">
          Live intelligence from curated sources
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatBadge value={items.length}          label="Live Items"   color="#a78bfa" />
          <StatBadge value={categories.length}     label="Categories"   color="#38bdf8" />
          <StatBadge value={enabledFeeds.length}   label="Sources"      color="var(--primary)" />
          <StatBadge
            value={lastRefresh ? lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            label="Updated"
            color="#34d399"
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Search feeds, categories, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/30 bg-card/30 py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/20 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-border/50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          {lastRefresh ? timeAgo(lastRefresh) : 'Refresh'}
        </button>

        {/* View toggle */}
        <div className="flex rounded-xl border border-border/30 bg-card/20 p-0.5 gap-0.5">
          <button type="button" onClick={() => setView('list')}
            className={cn('rounded-lg p-2 transition-all', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <List className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setView('grid')}
            className={cn('rounded-lg p-2 transition-all', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <Grid3x3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all',
            activeCategory === 'all'
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border/25 bg-card/20 text-muted-foreground hover:border-border/50 hover:text-foreground'
          )}
        >
          + All ({enabledFeeds.length})
        </button>
        {categories.map(cat => {
          const meta = CATEGORY_META[cat] ?? { label: cat, icon: '◆', color: '#94a3b8' }
          const count = enabledFeeds.filter(f => f.category === cat).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all',
                activeCategory === cat
                  ? 'text-foreground'
                  : 'border-border/25 bg-card/20 text-muted-foreground hover:border-border/50 hover:text-foreground'
              )}
              style={activeCategory === cat ? {
                borderColor: meta.color + '60',
                backgroundColor: meta.color + '15',
                color: meta.color,
              } : {}}
            >
              {meta.icon} {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* Left: Feed sources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
              Sources
            </p>
            {selectedFeedId && (
              <button type="button" onClick={() => setSelectedFeedId(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <Filter className="h-2.5 w-2.5" /> Clear filter
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredFeeds.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border border-border/15 bg-card/10 p-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">No feeds match</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">Try adjusting the category or search</p>
                </motion.div>
              ) : (
                filteredFeeds.map((feed, i) => (
                  <motion.div
                    key={feed.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                  >
                    <FeedCard
                      feed={feed}
                      selected={selectedFeedId === feed.id}
                      onClick={() => setSelectedFeedId(prev => prev === feed.id ? null : feed.id)}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right: Live items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Live Feed
                {selectedFeedId && (
                  <span className="ml-1 text-primary/60">
                    · {feeds.find(f => f.id === selectedFeedId)?.name}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-primary/60">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                  Syncing…
                </span>
              )}
              {!loading && lastRefresh && (
                <span className="font-mono text-[9px] text-muted-foreground/30">
                  Updated {timeAgo(lastRefresh)}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          {filteredItems.length === 0 && !loading ? (
            <div className="rounded-xl border border-border/15 bg-card/10 p-10 text-center">
              {items.length === 0 ? (
                <>
                  <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No live items yet</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                    Connect Hacker News (free) or add API keys to fetch live content
                  </p>
                  <button
                    type="button"
                    onClick={refresh}
                    className="mt-4 flex items-center gap-2 rounded-xl border border-border/30 bg-card/20 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-all mx-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try fetching
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">No items match filters</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">Clear filters to see all {items.length} items</p>
                </>
              )}
            </div>
          ) : (
            <div className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                : 'space-y-2'
            )}>
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }}
                  >
                    <FeedItemRow item={item} view={view} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* HN attribution */}
          {items.some(i => i.feedId === 'hackernews') && (
            <p className="mt-4 text-center font-mono text-[9px] text-muted-foreground/25">
              Hacker News data via{' '}
              <a href="https://github.com/HackerNews/API" target="_blank" rel="noopener noreferrer"
                className="text-primary/40 hover:text-primary/70 transition-colors">
                official API
              </a>
              {' '}· no CORS proxy · real-time
            </p>
          )}
        </div>
      </div>
    </DomainLayout>
  )
}
