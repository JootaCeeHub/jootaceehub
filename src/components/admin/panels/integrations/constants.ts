import { FileText, Globe, Database, Archive, FolderOpen, GitBranch, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { SourceType, SourceStatus, SocialPlatformId, SocialStat } from '@/lib/admin/types'

export type LucideIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>

export const TYPE_ICONS: Record<SourceType, LucideIcon> = {
  'github-repo': GitBranch,
  'file':        FileText,
  'url':         Globe,
  'database':    Database,
  'archive':     Archive,
  'folder':      FolderOpen,
}

export const STATUS_ICONS: Record<SourceStatus, LucideIcon> = {
  pending:  Loader2,
  indexing: Loader2,
  ready:    CheckCircle2,
  error:    AlertCircle,
}

export function formatBytes(n: number): string {
  if (n === 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export type Tab = 'sources' | 'github' | 'files' | 'links' | 'platforms' | 'deploy'

export interface PlatformMeta {
  id: SocialPlatformId
  name: string
  emoji: string
  accent: string
  category: 'social' | 'developer' | 'content' | 'video' | 'audio' | 'design' | 'community' | 'monetization'
  handlePlaceholder: string
  urlTemplate: (handle: string) => string
  hasPublicApi: boolean
  apiLabel?: string
  apiPlaceholder?: string
  fetchStats?: (handle: string, apiKey: string) => Promise<SocialStat[]>
}

export const PLATFORM_CATEGORIES: Record<PlatformMeta['category'], { label: string; color: string }> = {
  social:       { label: 'Social Networks',         color: '#38bdf8' },
  developer:    { label: 'Developer Platforms',     color: '#a78bfa' },
  content:      { label: 'Writing & Newsletters',   color: '#34d399' },
  video:        { label: 'Video & Streaming',       color: '#f87171' },
  audio:        { label: 'Audio & Podcasts',        color: '#1db954' },
  design:       { label: 'Design & Creative',       color: '#fb923c' },
  community:    { label: 'Community & Messaging',   color: '#22d3ee' },
  monetization: { label: 'Monetization & Products', color: '#facc15' },
}

export const PLATFORM_META: PlatformMeta[] = [
  // ─── Social ───────────────────────────────────────────────────────────────
  {
    id: 'linkedin', name: 'LinkedIn', emoji: '🔗', accent: '#0a66c2', category: 'social',
    handlePlaceholder: 'tu-nombre', urlTemplate: (h) => `https://linkedin.com/in/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'twitter', name: 'Twitter / X', emoji: '𝕏', accent: '#1d9bf0', category: 'social',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://x.com/${h.replace('@', '')}`,
    hasPublicApi: false, apiLabel: 'Bearer Token (opcional)', apiPlaceholder: 'AAAA…',
  },
  {
    id: 'instagram', name: 'Instagram', emoji: '📸', accent: '#e1306c', category: 'social',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://instagram.com/${h.replace('@', '')}`,
    hasPublicApi: false,
  },
  {
    id: 'tiktok', name: 'TikTok', emoji: '🎵', accent: '#ff0050', category: 'social',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://tiktok.com/@${h.replace('@', '')}`,
    hasPublicApi: false,
  },
  {
    id: 'bluesky', name: 'Bluesky', emoji: '🦋', accent: '#0085ff', category: 'social',
    handlePlaceholder: 'handle.bsky.social', urlTemplate: (h) => `https://bsky.app/profile/${h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`)
        if (!res.ok) return []
        const d = await res.json() as { followersCount?: number; postsCount?: number }
        return [
          ...(d.followersCount !== undefined ? [{ label: 'Followers', value: d.followersCount.toLocaleString() }] : []),
          ...(d.postsCount     !== undefined ? [{ label: 'Posts',     value: d.postsCount.toLocaleString() }]     : []),
        ]
      } catch { return [] }
    },
  },
  {
    id: 'mastodon', name: 'Mastodon', emoji: '🐘', accent: '#6364ff', category: 'social',
    handlePlaceholder: '@user@mastodon.social', urlTemplate: (h) => {
      const clean = h.replace(/^@/, ''), parts = clean.split('@')
      return `https://${parts[1] ?? 'mastodon.social'}/@${parts[0]}`
    },
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const clean = handle.replace(/^@/, ''), [user, instance = 'mastodon.social'] = clean.split('@')
        const res = await fetch(`https://${instance}/api/v1/accounts/lookup?acct=${user}`)
        if (!res.ok) return []
        const d = await res.json() as { followers_count?: number; statuses_count?: number }
        return [
          ...(d.followers_count !== undefined ? [{ label: 'Followers', value: d.followers_count.toLocaleString() }] : []),
          ...(d.statuses_count  !== undefined ? [{ label: 'Posts',     value: d.statuses_count.toLocaleString() }]  : []),
        ]
      } catch { return [] }
    },
  },
  {
    id: 'reddit', name: 'Reddit', emoji: '🟥', accent: '#ff4500', category: 'social',
    handlePlaceholder: 'u/username', urlTemplate: (h) => `https://reddit.com/user/${h.replace('u/', '')}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const user = handle.replace('u/', '').replace('/u/', '')
        const res = await fetch(`https://www.reddit.com/user/${user}/about.json`, { headers: { 'User-Agent': 'jootacee-dashboard/1.0' } })
        if (!res.ok) return []
        const d = await res.json() as { data?: { total_karma?: number; link_karma?: number } }
        const data = d.data ?? {}
        return data.total_karma !== undefined ? [{ label: 'Karma', value: data.total_karma.toLocaleString() }] : []
      } catch { return [] }
    },
  },
  {
    id: 'facebook', name: 'Facebook', emoji: '👤', accent: '#1877f2', category: 'social',
    handlePlaceholder: 'page-or-profile', urlTemplate: (h) => `https://facebook.com/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'threads', name: 'Threads', emoji: '🧵', accent: '#101010', category: 'social',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://threads.net/@${h.replace('@', '')}`,
    hasPublicApi: false,
  },

  // ─── Video / Streaming ────────────────────────────────────────────────────
  {
    id: 'youtube', name: 'YouTube', emoji: '▶️', accent: '#ff0000', category: 'video',
    handlePlaceholder: '@channel', urlTemplate: (h) => `https://youtube.com/${h}`,
    hasPublicApi: true, apiLabel: 'API Key (YouTube Data v3)', apiPlaceholder: 'AIza…',
    async fetchStats(handle, apiKey) {
      if (!apiKey) return []
      try {
        const q = handle.startsWith('@') ? `forHandle=${handle}` : `id=${handle}`
        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&${q}&key=${apiKey}`)
        if (!res.ok) return []
        const d = await res.json() as { items?: Array<{ statistics: { subscriberCount: string; videoCount: string; viewCount: string } }> }
        const stats = d.items?.[0]?.statistics
        if (!stats) return []
        return [
          { label: 'Subscribers', value: Number(stats.subscriberCount).toLocaleString() },
          { label: 'Videos',      value: Number(stats.videoCount).toLocaleString()      },
          { label: 'Views',       value: Number(stats.viewCount).toLocaleString()        },
        ]
      } catch { return [] }
    },
  },
  {
    id: 'twitch', name: 'Twitch', emoji: '🟣', accent: '#9146ff', category: 'video',
    handlePlaceholder: 'channel-name', urlTemplate: (h) => `https://twitch.tv/${h}`,
    hasPublicApi: true, apiLabel: 'Client-ID (Twitch Developer)', apiPlaceholder: 'xxxxxxxx…',
  },
  {
    id: 'vimeo', name: 'Vimeo', emoji: '🎬', accent: '#1ab7ea', category: 'video',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://vimeo.com/${h}`,
    hasPublicApi: false,
  },

  // ─── Developer Platforms ─────────────────────────────────────────────────
  {
    id: 'devto', name: 'Dev.to', emoji: '👩‍💻', accent: '#3b49df', category: 'developer',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://dev.to/${h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const res = await fetch(`https://dev.to/api/articles?username=${handle}&per_page=1000`)
        if (!res.ok) return []
        const arr = await res.json() as Array<{ positive_reactions_count: number }>
        const totalReactions = arr.reduce((s, a) => s + a.positive_reactions_count, 0)
        return [
          { label: 'Articles',  value: arr.length.toLocaleString()    },
          { label: 'Reactions', value: totalReactions.toLocaleString() },
        ]
      } catch { return [] }
    },
  },
  {
    id: 'hashnode', name: 'Hashnode', emoji: '📝', accent: '#2962ff', category: 'developer',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://hashnode.com/@${h.replace('@', '')}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const user = handle.replace('@', '')
        const res = await fetch('https://gql.hashnode.com/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `{ user(username: "${user}") { numFollowers } }` }),
        })
        if (!res.ok) return []
        const d = await res.json() as { data?: { user?: { numFollowers?: number } } }
        const n = d.data?.user?.numFollowers
        return n !== undefined ? [{ label: 'Followers', value: n.toLocaleString() }] : []
      } catch { return [] }
    },
  },
  {
    id: 'stackoverflow', name: 'Stack Overflow', emoji: '🟠', accent: '#f48024', category: 'developer',
    handlePlaceholder: 'user-id or display-name', urlTemplate: (h) => `https://stackoverflow.com/users/${h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const isId = /^\d+$/.test(handle)
        const url = isId
          ? `https://api.stackexchange.com/2.3/users/${handle}?site=stackoverflow`
          : `https://api.stackexchange.com/2.3/users?order=desc&sort=reputation&inname=${encodeURIComponent(handle)}&site=stackoverflow&pagesize=1`
        const res = await fetch(url)
        if (!res.ok) return []
        const d = await res.json() as { items?: Array<{ reputation: number; badge_counts: { gold: number } }> }
        const user = d.items?.[0]
        if (!user) return []
        return [
          { label: 'Reputation',  value: user.reputation.toLocaleString() },
          { label: 'Gold badges', value: user.badge_counts.gold           },
        ]
      } catch { return [] }
    },
  },
  {
    id: 'gitlab', name: 'GitLab', emoji: '🦊', accent: '#fc6d26', category: 'developer',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://gitlab.com/${h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const res = await fetch(`https://gitlab.com/api/v4/users?username=${handle}`)
        if (!res.ok) return []
        const d = await res.json() as Array<{ public_repos_count?: number; followers?: number }>
        const user = d[0]
        if (!user) return []
        return [
          ...(user.public_repos_count !== undefined ? [{ label: 'Repos',     value: user.public_repos_count.toLocaleString() }] : []),
          ...(user.followers          !== undefined ? [{ label: 'Followers', value: user.followers.toLocaleString() }]           : []),
        ]
      } catch { return [] }
    },
  },
  {
    id: 'huggingface', name: 'Hugging Face', emoji: '🤗', accent: '#ff9d00', category: 'developer',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://huggingface.co/${h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const res = await fetch(`https://huggingface.co/api/users/${handle}/overview`)
        if (!res.ok) return []
        const d = await res.json() as { numModels?: number; numDatasets?: number; numSpaces?: number }
        return [
          ...(d.numModels   !== undefined ? [{ label: 'Models',   value: d.numModels   }] : []),
          ...(d.numDatasets !== undefined ? [{ label: 'Datasets', value: d.numDatasets }] : []),
          ...(d.numSpaces   !== undefined ? [{ label: 'Spaces',   value: d.numSpaces   }] : []),
        ]
      } catch { return [] }
    },
  },
  {
    id: 'npm_org', name: 'npm', emoji: '📦', accent: '#cb3837', category: 'developer',
    handlePlaceholder: '@org-or-username', urlTemplate: (h) => `https://npmjs.com/${h.startsWith('@') ? h : '~' + h}`,
    hasPublicApi: true,
    async fetchStats(handle) {
      try {
        const user = handle.replace('@', '')
        const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=maintainer:${user}&size=0`)
        if (!res.ok) return []
        const d = await res.json() as { total?: number }
        return d.total !== undefined ? [{ label: 'Packages', value: d.total.toLocaleString() }] : []
      } catch { return [] }
    },
  },

  // ─── Design / Creative ────────────────────────────────────────────────────
  {
    id: 'behance', name: 'Behance', emoji: '🎨', accent: '#1769ff', category: 'design',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://behance.net/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'dribbble', name: 'Dribbble', emoji: '🏀', accent: '#ea4c89', category: 'design',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://dribbble.com/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'figma', name: 'Figma', emoji: '🎯', accent: '#f24e1e', category: 'design',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://figma.com/@${h}`,
    hasPublicApi: false, apiLabel: 'Personal Access Token', apiPlaceholder: 'figd_…',
  },

  // ─── Writing / Newsletter ─────────────────────────────────────────────────
  {
    id: 'medium', name: 'Medium', emoji: '✍️', accent: '#00ab6c', category: 'content',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://medium.com/@${h.replace('@', '')}`,
    hasPublicApi: false,
  },
  {
    id: 'substack', name: 'Substack', emoji: '📧', accent: '#ff6719', category: 'content',
    handlePlaceholder: 'newsletter', urlTemplate: (h) => `https://${h}.substack.com`,
    hasPublicApi: false,
  },
  {
    id: 'beehiiv', name: 'Beehiiv', emoji: '🐝', accent: '#f5a623', category: 'content',
    handlePlaceholder: 'publication-slug', urlTemplate: (h) => `https://${h}.beehiiv.com`,
    hasPublicApi: false,
  },

  // ─── Audio / Podcast ──────────────────────────────────────────────────────
  {
    id: 'spotify', name: 'Spotify', emoji: '🎵', accent: '#1db954', category: 'audio',
    handlePlaceholder: 'artist-id or show-id', urlTemplate: (h) => `https://open.spotify.com/artist/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'soundcloud', name: 'SoundCloud', emoji: '🎙️', accent: '#ff5500', category: 'audio',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://soundcloud.com/${h}`,
    hasPublicApi: false,
  },

  // ─── Community / Messaging ────────────────────────────────────────────────
  {
    id: 'telegram', name: 'Telegram', emoji: '✈️', accent: '#24a1de', category: 'community',
    handlePlaceholder: '@channel', urlTemplate: (h) => `https://t.me/${h.replace('@', '')}`,
    hasPublicApi: false,
  },
  {
    id: 'discord', name: 'Discord', emoji: '💬', accent: '#5865f2', category: 'community',
    handlePlaceholder: 'invite-code', urlTemplate: (h) => `https://discord.gg/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'notion', name: 'Notion', emoji: '📓', accent: '#ffffff', category: 'community',
    handlePlaceholder: 'page-id', urlTemplate: (h) => `https://notion.so/${h}`,
    hasPublicApi: false, apiLabel: 'Integration Token', apiPlaceholder: 'secret_…',
  },

  // ─── Monetization / Products ──────────────────────────────────────────────
  {
    id: 'producthunt', name: 'Product Hunt', emoji: '🐱', accent: '#da552f', category: 'monetization',
    handlePlaceholder: '@handle', urlTemplate: (h) => `https://producthunt.com/@${h.replace('@', '')}`,
    hasPublicApi: false,
  },
  {
    id: 'gumroad', name: 'Gumroad', emoji: '🛒', accent: '#ff90e8', category: 'monetization',
    handlePlaceholder: 'store-handle', urlTemplate: (h) => `https://app.gumroad.com/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'kofi', name: 'Ko-fi', emoji: '☕', accent: '#ff5e5b', category: 'monetization',
    handlePlaceholder: 'username', urlTemplate: (h) => `https://ko-fi.com/${h}`,
    hasPublicApi: false,
  },
  {
    id: 'patreon', name: 'Patreon', emoji: '🎭', accent: '#ff424d', category: 'monetization',
    handlePlaceholder: 'creator-name', urlTemplate: (h) => `https://patreon.com/${h}`,
    hasPublicApi: false,
  },
]
