'use client'

import { useEffect, useState } from 'react'
import type { GitHubIntelligence, RepositoryCard, GitHubActivityPoint } from '@/lib/github/types'
import type { GitHubIntegration } from '@/lib/admin/types'

const ADMIN_KEY       = 'jootacee-command-v2'
const GITHUB_USERNAME = 'jootaceehub'
const STATIC_JSON_URL = '/data/github.json'
const STATIC_TTL_MS   = 24 * 60 * 60 * 1000

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F1E05A', Python: '#3572A5',
  Rust: '#DEA584', Go: '#00ADD8', CSS: '#563D7C', HTML: '#E34C26',
  Shell: '#89E051', Ruby: '#701516', Java: '#B07219', 'C++': '#F34B7D',
  C: '#555555', Kotlin: '#A97BFF', Swift: '#F05138', Dart: '#00B4AB', MDX: '#F9AC00',
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const hrs = Math.floor(ms / 3_600_000)
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function readAdminGitHub(): GitHubIntegration | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const gh = (parsed?.integrations as { github?: GitHubIntegration })?.github
    if (gh?.connected && gh.accessToken && gh.repos?.length) return gh
  } catch { /* ignore */ }
  return null
}

function readConfiguredUsername(): string {
  if (typeof window === 'undefined') return GITHUB_USERNAME
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return GITHUB_USERNAME
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const username = (parsed?.githubConfig as { username?: string })?.username
    return username?.trim() || GITHUB_USERNAME
  } catch { return GITHUB_USERNAME }
}

async function buildFromAdminState(gh: GitHubIntegration): Promise<GitHubIntelligence> {
  const token = gh.accessToken
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // Fetch profile + events in parallel (uses token → no rate limit pressure)
  // Fetch events across multiple pages for better heatmap coverage
  const fetchEvents = async () => {
    const pages = await Promise.allSettled([
      fetch(`https://api.github.com/users/${gh.username}/events?per_page=100&page=1`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`https://api.github.com/users/${gh.username}/events?per_page=100&page=2`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`https://api.github.com/users/${gh.username}/events?per_page=100&page=3`, { headers }).then(r => r.ok ? r.json() : []),
    ])
    return pages.flatMap(p => p.status === 'fulfilled' ? (p.value as unknown[]) : [])
  }

  const [profileRes, eventsRes] = await Promise.allSettled([
    fetch(`https://api.github.com/user`, { headers }).then(r => r.ok ? r.json() : null),
    fetchEvents(),
  ])

  const profile = profileRes.status === 'fulfilled' ? profileRes.value as {
    login: string; name: string | null; bio: string | null; location: string | null;
    html_url: string; avatar_url: string; followers: number; following: number; public_repos: number
  } | null : null

  type GHEvent = { type: string; created_at: string; payload: { commits?: unknown[] } }
  const events: GHEvent[] = eventsRes.status === 'fulfilled' ? (eventsRes.value as GHEvent[]) ?? [] : []

  // Build activity
  const activityMap = new Map<string, number>()
  let commitsLast30d = 0
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3_600_000
  for (const ev of events) {
    if (ev.type !== 'PushEvent') continue
    const date  = ev.created_at.slice(0, 10)
    const count = ev.payload.commits?.length ?? 0
    activityMap.set(date, (activityMap.get(date) ?? 0) + count)
    if (new Date(ev.created_at).getTime() > thirtyDaysAgo) commitsLast30d += count
  }
  // Keep all dates (no slice) for full 26-week heatmap coverage
  const activity: GitHubActivityPoint[] = Array.from(activityMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, commits]) => ({ date, commits }))

  // Build repos from integration state (already fetched with auth)
  const repositories: RepositoryCard[] = gh.repos.slice(0, 10).map(r => ({
    name: r.name,
    description: r.description ?? '',
    stars: r.stars ?? 0,
    forks: r.forks ?? 0,
    language: r.language ?? 'Unknown',
    languageColor: LANG_COLORS[r.language ?? ''] ?? '#8B949E',
    status: 'active' as const,
    updatedAt: relTime(r.updatedAt),
    href: r.url,
    commitVelocity: '',
    isFork: false,
    topics: r.topics ?? [],
  }))

  const totalStars = gh.repos.reduce((s, r) => s + (r.stars ?? 0), 0)
  const totalForks = gh.repos.reduce((s, r) => s + (r.forks ?? 0), 0)

  return {
    revision:    `admin-${new Date().toISOString().slice(0, 10)}`,
    generatedAt: new Date().toISOString(),
    source:      'live',
    profile: profile ? {
      username:    profile.login,
      displayName: profile.name ?? profile.login,
      bio:         profile.bio ?? '',
      location:    profile.location ?? '',
      url:         profile.html_url,
      avatarUrl:   gh.avatarUrl || profile.avatar_url,
      followers:   profile.followers,
      following:   profile.following,
      publicRepos: profile.public_repos,
    } : {
      username:    gh.username,
      displayName: gh.username,
      bio:         '',
      location:    '',
      url:         `https://github.com/${gh.username}`,
      avatarUrl:   gh.avatarUrl,
      followers:   0,
      following:   0,
      publicRepos: gh.repos.length,
    },
    repositories,
    totalStars,
    totalForks,
    commitsLast30d,
    recentReleases: [],
    deployments:    [],
    activity,
  }
}

export function useGitHubIntelligence() {
  const [data,    setData]    = useState<GitHubIntelligence | null>(null)
  const [source,  setSource]  = useState<'static' | 'live' | 'fallback' | 'loading'>('loading')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // ── Step 0: Admin integration state (connected PAT — highest priority) ─
      const adminGh = readAdminGitHub()
      if (adminGh) {
        try {
          const intel = await buildFromAdminState(adminGh)
          if (!cancelled) { setData(intel); setSource('live'); setLoading(false) }
          return
        } catch { /* fall through */ }
      }

      // ── Step 1: Static pre-fetched JSON ─────────────────────────────────────
      try {
        const res = await fetch(STATIC_JSON_URL, { cache: 'no-store' })
        if (res.ok) {
          const json: GitHubIntelligence = await res.json()
          const age = Date.now() - new Date(json.generatedAt).getTime()
          if (!cancelled) { setData(json); setSource('static'); setLoading(false) }
          if (age < STATIC_TTL_MS) return
        }
      } catch { /* static file not available */ }

      // ── Step 2: Live public GitHub API ─────────────────────────────────────
      try {
        const { fetchGitHubIntelligence } = await import('@/lib/github/api')
        const live = await fetchGitHubIntelligence(readConfiguredUsername())
        if (!cancelled) { setData(live); setSource('live'); setLoading(false) }
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'GitHub API unavailable'
        setError(message)

        // ── Step 3: Mock fallback ────────────────────────────────────────────
        if (!data) {
          try {
            const { mockGitHubIntelligence } = await import('@/lib/github/mock')
            if (!cancelled) { setData(mockGitHubIntelligence); setSource('fallback') }
          } catch { /* ignore */ }
        }
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, source, loading, error }
}
