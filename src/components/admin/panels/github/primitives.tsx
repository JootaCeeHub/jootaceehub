'use client'

export type Tab = 'builder' | 'profile' | 'repos' | 'starred' | 'display' | 'export'

export const TABS: { id: Tab; label: string }[] = [
  { id: 'builder', label: '🏗 Página' },
  { id: 'profile', label: 'Perfil' },
  { id: 'repos',   label: 'Repos' },
  { id: 'starred', label: '⭐ Starred' },
  { id: 'display', label: 'Display' },
  { id: 'export',  label: 'Export' },
]

export interface LiveRepo {
  name:        string
  description: string
  language:    string | null
  stars:       number
  forks:       number
  topics:      string[]
  url:         string
  updatedAt:   string
  isPrivate:   boolean
  isFork:      boolean
}

export interface StarredRepo {
  name:        string
  owner:       string
  description: string
  language:    string | null
  stars:       number
  forks:       number
  topics:      string[]
  url:         string
  updatedAt:   string
}

export interface LiveProfile {
  login:       string
  name:        string | null
  bio:         string | null
  location:    string | null
  avatarUrl:   string
  followers:   number
  following:   number
  publicRepos: number
}

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f7df1e',
  Rust: '#dea584', Go: '#00ADD8', Shell: '#89e051',
  CSS: '#563d7c', HTML: '#e34c26', MDX: '#f9ac00', Other: '#9e9e9e',
}

// ─── GitHub public API helpers ────────────────────────────────────────────────

export async function fetchPublicRepos(username: string): Promise<LiveRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=owner`,
    { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  const raw = await res.json() as Array<{
    name: string; description: string | null; language: string | null;
    stargazers_count: number; forks_count: number; topics?: string[];
    html_url: string; updated_at: string; private: boolean; fork: boolean;
  }>
  return raw.map(r => ({
    name:        r.name,
    description: r.description ?? '',
    language:    r.language,
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    topics:      r.topics ?? [],
    url:         r.html_url,
    updatedAt:   r.updated_at,
    isPrivate:   r.private,
    isFork:      r.fork,
  }))
}

export async function fetchPublicProfile(username: string): Promise<LiveProfile> {
  const res = await fetch(
    `https://api.github.com/users/${username}`,
    { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  const u = await res.json() as {
    login: string; name: string | null; bio: string | null;
    location: string | null; avatar_url: string; followers: number; following: number; public_repos: number;
  }
  return { login: u.login, name: u.name, bio: u.bio, location: u.location, avatarUrl: u.avatar_url, followers: u.followers, following: u.following, publicRepos: u.public_repos }
}

type RawStarredItem = {
  name: string; owner: { login: string }; description: string | null; language: string | null;
  stargazers_count: number; forks_count: number; topics?: string[];
  html_url: string; updated_at: string;
}

export async function fetchStarredRepos(username: string): Promise<StarredRepo[]> {
  const all: StarredRepo[] = []
  let page = 1
  while (page <= 5) { // safety cap at 500 repos
    const res = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=100&sort=updated&page=${page}`,
      { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
    const raw = await res.json() as RawStarredItem[]
    all.push(...raw.map(r => ({
      name:        r.name,
      owner:       r.owner.login,
      description: r.description ?? '',
      language:    r.language,
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      topics:      r.topics ?? [],
      url:         r.html_url,
      updatedAt:   r.updated_at,
    })))
    if (raw.length < 100) break
    page++
  }
  return all
}

export function relTime(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'today'
  if (d < 7)   return `${d}d ago`
  if (d < 30)  return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

// ─── Shared Toggle component ──────────────────────────────────────────────────

import { cn } from '@/lib/utils'

export function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-white/70">{label}</div>
        {desc && <div className="text-[9px] text-white/30 mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)} className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
        value ? 'border-pink-400/40 bg-pink-400/20' : 'border-white/15 bg-white/5'
      )}>
        <span className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full transition-all',
          value ? 'left-[18px] bg-pink-400' : 'left-0.5 bg-white/30'
        )} />
      </button>
    </div>
  )
}
