import type { GitHubIntelligence, RepositoryCard, GitHubActivityPoint } from './types'
import type { GHRepo, GHEvent, GHUser } from './api-types'

const CACHE_KEY = 'jootacee-github-v1'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript:  '#3178C6',
  JavaScript:  '#F1E05A',
  Python:      '#3572A5',
  Rust:        '#DEA584',
  Go:          '#00ADD8',
  CSS:         '#563D7C',
  HTML:        '#E34C26',
  Shell:       '#89E051',
  Ruby:        '#701516',
  Java:        '#B07219',
  'C++':       '#F34B7D',
  C:           '#555555',
  Kotlin:      '#A97BFF',
  Swift:       '#F05138',
  Dart:        '#00B4AB',
  MDX:         '#F9AC00',
}

interface CacheEntry {
  data: GitHubIntelligence
  cachedAt: number
}

function loadCache(): GitHubIntelligence | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.cachedAt > CACHE_TTL) return null
    return entry.data
  } catch {
    return null
  }
}

function saveCache(data: GitHubIntelligence): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, cachedAt: Date.now() } satisfies CacheEntry))
  } catch {}
}

async function ghFetch<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} for ${path}`)
  }
  return res.json() as Promise<T>
}

function relativeTime(isoString: string): string {
  const ms   = Date.now() - new Date(isoString).getTime()
  const hrs  = Math.floor(ms / 3_600_000)
  if (hrs < 1)  return 'just now'
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const wks  = Math.floor(days / 7)
  return `${wks} week${wks > 1 ? 's' : ''} ago`
}

export async function fetchGitHubIntelligence(username: string): Promise<GitHubIntelligence> {
  const cached = loadCache()
  if (cached) return cached

  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN

  const [profile, repos, events] = await Promise.all([
    ghFetch<GHUser>(`/users/${username}`, token),
    ghFetch<GHRepo[]>(`/users/${username}/repos?sort=updated&per_page=100&type=owner`, token),
    ghFetch<GHEvent[]>(`/users/${username}/events?per_page=100`, token),
  ])

  // Build activity from PushEvents (last 7 unique days)
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

  const activity: GitHubActivityPoint[] = Array.from(activityMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, commits]) => ({ date, commits }))

  const repositories: RepositoryCard[] = repos.slice(0, 5).map((r) => ({
    name:           r.name,
    description:    r.description ?? '',
    stars:          r.stargazers_count,
    forks:          r.forks_count,
    language:       r.language ?? 'Unknown',
    languageColor:  LANGUAGE_COLORS[r.language ?? ''] ?? '#8B949E',
    status:         'active' as const,
    updatedAt:      relativeTime(r.pushed_at ?? r.updated_at),
    href:           r.html_url,
    commitVelocity: '',
    isFork:         r.fork,
    topics:         r.topics,
  }))

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0)

  const data: GitHubIntelligence = {
    revision:       `live-${new Date().toISOString().slice(0, 10)}`,
    generatedAt:    new Date().toISOString(),
    source:         'live',
    profile: {
      username:    profile.login,
      displayName: profile.name ?? profile.login,
      bio:         profile.bio ?? '',
      location:    profile.location ?? '',
      url:         profile.html_url,
      avatarUrl:   profile.avatar_url,
      followers:   profile.followers,
      following:   profile.following,
      publicRepos: profile.public_repos,
    },
    repositories,
    totalStars,
    totalForks,
    commitsLast30d,
    recentReleases: [],
    deployments:    [],
    activity,
  }

  saveCache(data)
  return data
}
