'use client'

import { useEffect, useMemo, useState } from 'react'
import { Code2, ExternalLink, GitFork, Star } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { BorderBeam } from '@/components/shared/BorderBeam'
import { cn } from '@/lib/utils'
import { useGitHubIntelligence } from '@/hooks/useGitHubIntelligence'
import type { GithubConfig, GithubRepoMeta } from '@/lib/admin/types'

const GITHUB_USERNAME  = 'jootaceehub'
const ADMIN_KEY        = 'jootacee-command-v2'

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F1E05A', Python: '#3572A5',
  Rust: '#DEA584', Go: '#00ADD8', CSS: '#563D7C', HTML: '#E34C26',
  Shell: '#89E051', Ruby: '#701516', Java: '#B07219', 'C++': '#F34B7D',
  C: '#555555', Kotlin: '#A97BFF', Swift: '#F05138', Dart: '#00B4AB',
  MDX: '#F9AC00', Vue: '#41B883', Svelte: '#FF3E00', SCSS: '#C6538C',
}

// GitHub dark theme contribution colors (exact match)
const CONTRIB_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Contribution graph types ─────────────────────────────────────────────────

interface ContributionDay {
  date:  string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContribWeek {
  days: (ContributionDay | null)[]
}

interface HeatmapData {
  weeks:       ContribWeek[]
  monthLabels: { month: string; col: number }[]
}

// ─── Starred repos type ───────────────────────────────────────────────────────

interface StarredRepo {
  id:          number
  name:        string
  owner:       string
  description: string
  language:    string | null
  stars:       number
  forks:       number
  url:         string
  topics:      string[]
  updatedAt:   string
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const DEFAULT_GC: Pick<GithubConfig,
  'statSlot4' | 'showStats' | 'showContributions' | 'showStarred' | 'showOwnRepos' |
  'showStarredCategories' | 'showTopics' | 'showForks' | 'showProfileCard' |
  'pageBadge' | 'pageHeadline' | 'pageSubheadline' |
  'ownReposTitle' | 'ownReposSubtitle' | 'ownReposLimit' |
  'starredTitle' | 'starredSubtitle' |
  'displayRepos' | 'repoMeta' | 'username'
> = {
  statSlot4: 'starred',
  showStats: true,
  showContributions: true,
  showStarred: true,
  showOwnRepos: true,
  showStarredCategories: true,
  showTopics: true,
  showForks: false,
  showProfileCard: true,
  pageBadge: 'Open Source',
  pageHeadline: 'GitHub',
  pageSubheadline: 'Open source projects, activity, and curated repositories.',
  ownReposTitle: 'My Repositories',
  ownReposSubtitle: 'Open source projects I maintain and develop.',
  ownReposLimit: 6,
  starredTitle: 'Repos Recomendados',
  starredSubtitle: 'Proyectos y herramientas que personalmente he marcado como favoritos.',
  displayRepos: [],
  repoMeta: {},
  username: GITHUB_USERNAME,
}

function readGithubPageConfig(): typeof DEFAULT_GC {
  if (typeof window === 'undefined') return DEFAULT_GC
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return DEFAULT_GC
    const gc = (JSON.parse(raw) as Record<string, unknown>)?.githubConfig as Partial<GithubConfig> | undefined
    if (!gc) return DEFAULT_GC
    return {
      statSlot4:             gc.statSlot4             ?? DEFAULT_GC.statSlot4,
      showStats:             gc.showStats             ?? DEFAULT_GC.showStats,
      showContributions:     gc.showContributions     ?? DEFAULT_GC.showContributions,
      showStarred:           gc.showStarred           ?? DEFAULT_GC.showStarred,
      showOwnRepos:          gc.showOwnRepos          ?? DEFAULT_GC.showOwnRepos,
      showStarredCategories: gc.showStarredCategories ?? DEFAULT_GC.showStarredCategories,
      showTopics:            gc.showTopics            ?? DEFAULT_GC.showTopics,
      showForks:             gc.showForks             ?? DEFAULT_GC.showForks,
      showProfileCard:       gc.showProfileCard       ?? DEFAULT_GC.showProfileCard,
      pageBadge:             gc.pageBadge             || DEFAULT_GC.pageBadge,
      pageHeadline:          gc.pageHeadline          || DEFAULT_GC.pageHeadline,
      pageSubheadline:       gc.pageSubheadline       || DEFAULT_GC.pageSubheadline,
      ownReposTitle:         gc.ownReposTitle         || DEFAULT_GC.ownReposTitle,
      ownReposSubtitle:      gc.ownReposSubtitle      || DEFAULT_GC.ownReposSubtitle,
      ownReposLimit:         gc.ownReposLimit         ?? DEFAULT_GC.ownReposLimit,
      starredTitle:          gc.starredTitle          || DEFAULT_GC.starredTitle,
      starredSubtitle:       gc.starredSubtitle       || DEFAULT_GC.starredSubtitle,
      displayRepos:          gc.displayRepos          ?? DEFAULT_GC.displayRepos,
      repoMeta:              gc.repoMeta              ?? DEFAULT_GC.repoMeta,
      username:              gc.username              || DEFAULT_GC.username,
    }
  } catch { return DEFAULT_GC }
}

async function fetchStarredCount(username: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/starred?per_page=1`,
      { headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
    )
    if (!res.ok) return 0
    const link = res.headers.get('link') ?? ''
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
    if (match) return parseInt(match[1], 10)
    const body = await res.json() as unknown[]
    return body.length
  } catch { return 0 }
}

async function fetchContributions(username: string): Promise<{ total: number; grid: HeatmapData }> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      { cache: 'no-store' }
    )
    if (!res.ok) return { total: 0, grid: { weeks: [], monthLabels: [] } }
    const json = await res.json() as { contributions: ContributionDay[] }
    const contributions = json.contributions ?? []
    const total = contributions.reduce((s, c) => s + c.count, 0)
    return { total, grid: buildWeeksGrid(contributions) }
  } catch {
    return { total: 0, grid: { weeks: [], monthLabels: [] } }
  }
}

function buildWeeksGrid(contributions: ContributionDay[]): HeatmapData {
  if (!contributions.length) return { weeks: [], monthLabels: [] }

  // GitHub weeks start on Sunday (day 0)
  const firstDate = new Date(contributions[0].date + 'T12:00:00Z')
  const startDow = firstDate.getUTCDay()

  // Pad start so first cell is always a Sunday
  const allDays: (ContributionDay | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...contributions,
  ]

  // Group into 7-day columns (weeks)
  const weeks: ContribWeek[] = []
  for (let i = 0; i < allDays.length; i += 7) {
    const days = allDays.slice(i, i + 7)
    while (days.length < 7) days.push(null)
    weeks.push({ days })
  }

  // Month labels: first column that has a day belonging to a new month
  const monthLabels: { month: string; col: number }[] = []
  let lastMonth = -1
  for (let wi = 0; wi < weeks.length; wi++) {
    const firstReal = weeks[wi].days.find(d => d !== null)
    if (!firstReal) continue
    const m = new Date(firstReal.date + 'T12:00:00Z').getUTCMonth()
    if (m !== lastMonth) {
      // Skip label if too close to previous (< 2 cols gap)
      const prev = monthLabels[monthLabels.length - 1]
      if (!prev || wi - prev.col >= 2) {
        monthLabels.push({ month: MONTHS[m], col: wi })
        lastMonth = m
      }
    }
  }

  return { weeks, monthLabels }
}

// ─── Category taxonomy ───────────────────────────────────────────────────────

const STAR_CATEGORIES = [
  { id: 'all',      label: 'All',            keywords: [] },
  { id: 'ai-ml',    label: 'AI / ML',        keywords: ['ai', 'llm', 'gpt', 'claude', 'openai', 'langchain', 'ollama', 'ml', 'nlp', 'transformer', 'machine-learning', 'deep-learning', 'rag', 'mcp', 'agent', 'chatbot', 'mistral', 'anthropic', 'embedding', 'vector', 'inference', 'diffusion', 'copilot', 'assistant', 'groq', 'gemini'] },
  { id: 'web-ui',   label: 'Web / UI',       keywords: ['react', 'nextjs', 'vue', 'svelte', 'astro', 'typescript', 'javascript', 'css', 'tailwind', 'ui', 'frontend', 'components', 'design-system', 'animation', 'framer', 'radix', 'shadcn', 'storybook', 'vite', 'remix', 'nuxt'] },
  { id: 'tools',    label: 'Tools & CLI',    keywords: ['cli', 'tool', 'utility', 'generator', 'automation', 'script', 'terminal', 'shell', 'devtool', 'productivity', 'workflow', 'plugin', 'extension'] },
  { id: 'infra',    label: 'Infra / DevOps', keywords: ['docker', 'kubernetes', 'k8s', 'terraform', 'devops', 'ci-cd', 'deployment', 'cloud', 'nginx', 'monitoring', 'observability', 'logging', 'helm', 'ansible', 'serverless', 'aws', 'gcp', 'azure', 'vercel', 'railway'] },
  { id: 'python',   label: 'Python',         keywords: ['python', 'fastapi', 'django', 'flask', 'pydantic', 'scipy', 'jupyter', 'notebook', 'pandas', 'numpy', 'pytorch', 'tensorflow'] },
  { id: 'rust-sys', label: 'Rust / Systems', keywords: ['rust', 'systems', 'embedded', 'performance', 'wasm', 'webassembly', 'low-level', 'compiler'] },
  { id: 'data',     label: 'Data & DB',      keywords: ['database', 'sql', 'redis', 'postgres', 'mongodb', 'analytics', 'data', 'etl', 'pipeline', 'visualization', 'supabase', 'drizzle', 'prisma', 'sqlite', 'kafka', 'clickhouse'] },
  { id: 'security', label: 'Security',       keywords: ['security', 'crypto', 'auth', 'oauth', 'jwt', 'pentest', 'encryption', 'vulnerability', 'firewall', 'ctf', 'hacking'] },
] as const

type StarCategoryId = typeof STAR_CATEGORIES[number]['id']

function classifyRepo(repo: StarredRepo): StarCategoryId {
  const haystack = [
    ...repo.topics,
    repo.language?.toLowerCase() ?? '',
    repo.name.toLowerCase(),
    repo.description.toLowerCase(),
  ].join(' ')

  // Skip 'all' (index 0) — it's a special tab
  for (const cat of STAR_CATEGORIES.slice(1)) {
    if (cat.keywords.some(kw => haystack.includes(kw))) return cat.id
  }
  return 'tools' // sensible fallback for unclassified repos
}

type RawGHRepo = {
  id: number; name: string; owner: { login: string }; description: string | null;
  language: string | null; stargazers_count: number; forks_count: number;
  html_url: string; topics?: string[]; updated_at: string;
}

async function fetchAllStarred(username: string): Promise<StarredRepo[]> {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const all: StarredRepo[] = []
  // Fetch up to 3 pages (300 repos) — covers ~200 starred repos comfortably
  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/starred?per_page=100&page=${page}&sort=updated`,
        { headers }
      )
      if (!res.ok) break
      const raw = await res.json() as RawGHRepo[]
      if (!raw.length) break
      all.push(...raw.map(r => ({
        id:          r.id,
        name:        r.name,
        owner:       r.owner.login,
        description: r.description ?? '',
        language:    r.language,
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        url:         r.html_url,
        topics:      r.topics ?? [],
        updatedAt:   r.updated_at,
      })))
      if (raw.length < 100) break // last page
    } catch { break }
  }
  return all
}

function relTimeStarred(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'today'
  if (d < 7)   return `${d}d ago`
  if (d < 30)  return `${Math.floor(d / 7)}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

// ─── Heatmap constants ────────────────────────────────────────────────────────

const CELL = 11
const GAP  = 3
const DAY_LABEL_W = 28
const DAY_LABELS  = ['', 'Mon', '', 'Wed', '', 'Fri', '']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GitHubPage() {
  // Read full github page config from admin localStorage once on mount
  const [gc] = useState(() => readGithubPageConfig())

  // Live GitHub profile (avatar, bio, followers) — only for the profile card
  const { data: ghData, loading: profileLoading, source } = useGitHubIntelligence()

  // ── Contribution heatmap (full year, real data) ──────────────────────────
  const [contribTotal,   setContribTotal]   = useState(0)
  const [heatmap,        setHeatmap]        = useState<HeatmapData>({ weeks: [], monthLabels: [] })
  const [contribLoading, setContribLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchContributions(GITHUB_USERNAME).then(({ total, grid }) => {
      if (!cancelled) { setContribTotal(total); setHeatmap(grid); setContribLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  // ── Starred repos (cards + count) ────────────────────────────────────────
  const [starred,        setStarred]        = useState<StarredRepo[]>([])
  const [starredLoading, setStarredLoading] = useState(true)
  const [starredCount,   setStarredCount]   = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState<StarCategoryId>('all')

  useEffect(() => {
    let cancelled = false
    // Fetch exact count (from Link header) and all paginated cards in parallel
    Promise.all([
      fetchStarredCount(GITHUB_USERNAME),
      fetchAllStarred(GITHUB_USERNAME),
    ]).then(([count, repos]) => {
      if (!cancelled) {
        setStarredCount(count)
        setStarred(repos)
        setStarredLoading(false)
      }
    }).catch(() => { if (!cancelled) setStarredLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ── Category counts + filtered list ──────────────────────────────────────
  const { categoryCounts, filteredStarred } = useMemo(() => {
    const counts: Partial<Record<StarCategoryId, number>> = { all: starred.length }
    for (const repo of starred) {
      const id = classifyRepo(repo)
      counts[id] = (counts[id] ?? 0) + 1
    }
    const filtered = activeCategory === 'all'
      ? starred
      : starred.filter(r => classifyRepo(r) === activeCategory)
    return { categoryCounts: counts, filteredStarred: filtered }
  }, [starred, activeCategory])

  // ── Curated repos from admin config ──────────────────────────────────────
  const curatedRepos = useMemo(() => {
    const limit = gc.ownReposLimit > 0 ? gc.ownReposLimit : gc.displayRepos.length
    return gc.displayRepos.slice(0, limit).map(slug => ({
      slug,
      meta: gc.repoMeta[slug] as GithubRepoMeta | undefined,
      url: `https://github.com/${gc.username}/${slug}`,
    }))
  }, [gc])

  // ── Stats row ────────────────────────────────────────────────────────────
  const profileStats = useMemo(() => {
    const slot4IsStarred = gc.statSlot4 === 'starred'
    return [
      { value: String(gc.displayRepos.length),                                               label: 'Repos' },
      { value: !contribLoading && contribTotal > 0 ? contribTotal.toLocaleString() : '…',   label: contribTotal > 0 ? 'Contributions (1y)' : 'Contributions' },
      { value: String(gc.displayRepos.reduce((s, r) => s + (gc.repoMeta[r]?.stars ?? 0), 0)), label: 'Stars earned' },
      slot4IsStarred
        ? { value: starredLoading ? '…' : (starredCount ?? starred.length).toLocaleString(), label: 'Repos starred' }
        : { value: String(gc.displayRepos.reduce((s, r) => s + (gc.repoMeta[r]?.forks ?? 0), 0)), label: 'Total forks' },
    ]
  }, [gc, contribTotal, contribLoading, starredLoading, starredCount, starred.length])

  // ── Language breakdown from curated repos ────────────────────────────────
  const languages = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of gc.displayRepos) {
      const lang = gc.repoMeta[r]?.language
      if (!lang || lang === 'Unknown') continue
      counts[lang] = (counts[lang] ?? 0) + 1
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    if (total === 0) return []
    return Object.entries(counts)
      .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100), color: LANG_COLORS[name] ?? '#8B949E' }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8)
  }, [gc])

  // ── Grid dimensions ───────────────────────────────────────────────────────
  const gridWidth = heatmap.weeks.length * (CELL + GAP) + DAY_LABEL_W

  return (
    <DomainLayout>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mb-12">
        <DomainBreadcrumb />

        {/* Profile card — 3 sections: profile | languages | stats */}
        {gc.showProfileCard && <div className="mt-6 mb-8 rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* ── Section 1: Avatar + profile info ─────────────────────── */}
            <div className="flex items-center gap-4 p-5 flex-[2] min-w-0">
              {profileLoading && !ghData?.profile ? (
                <>
                  <div className="h-14 w-14 shrink-0 rounded-full bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-white/5 animate-pulse" />
                    <div className="h-2.5 w-52 rounded bg-white/5 animate-pulse" />
                    <div className="h-2.5 w-36 rounded bg-white/5 animate-pulse" />
                  </div>
                </>
              ) : ghData?.profile ? (
                <>
                  {ghData.profile.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${ghData.profile.avatarUrl}${ghData.profile.avatarUrl.includes('?') ? '&' : '?'}s=112`}
                      alt={ghData.profile.displayName}
                      width={56}
                      height={56}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{ghData.profile.displayName}</span>
                      <span className="font-mono text-[11px] text-white/35">@{gc.username}</span>
                      {source === 'live' && (
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
                          ● live
                        </span>
                      )}
                    </div>
                    {ghData.profile.bio && (
                      <p className="mt-0.5 text-xs text-white/40 leading-relaxed line-clamp-1">{ghData.profile.bio}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-white/30">
                      {ghData.profile.location && <span>📍 {ghData.profile.location}</span>}
                      <span>{ghData.profile.followers} followers</span>
                      <span>{ghData.profile.following} following</span>
                      <span>{ghData.profile.publicRepos} repos</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* ── Divider ──────────────────────────────────────────────── */}
            <div className="hidden md:block w-px bg-white/6 my-3 shrink-0" />
            <div className="md:hidden h-px bg-white/6 mx-5" />

            {/* ── Section 2: Language breakdown ────────────────────────── */}
            <div className="flex flex-col justify-center gap-2.5 px-5 py-4 flex-[2] min-w-0">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/25">
                Languages
              </p>
              {languages.length === 0 ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/5 animate-pulse shrink-0" />
                      <div className="h-2 w-14 rounded bg-white/5 animate-pulse" />
                      <div className="flex-1 h-[3px] rounded-full bg-white/5 animate-pulse" />
                      <div className="h-2 w-5 rounded bg-white/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {languages.slice(0, 4).map(lang => (
                    <div key={lang.name} className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-mono text-[9px] text-white/50 w-[72px] shrink-0 truncate">
                        {lang.name}
                      </span>
                      <div className="flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden min-w-[32px]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
                        />
                      </div>
                      <span className="font-mono text-[8px] text-white/35 w-7 text-right shrink-0 tabular-nums">
                        {lang.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Divider ──────────────────────────────────────────────── */}
            <div className="hidden md:block w-px bg-white/6 my-3 shrink-0" />
            <div className="md:hidden h-px bg-white/6 mx-5" />

            {/* ── Section 3: 4 stat cells ───────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 flex-shrink-0">
              {profileStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn(
                    'flex flex-col items-center justify-center px-5 py-4 text-center transition-colors hover:bg-white/[0.02]',
                    i % 2 === 0 && i < 3 && 'border-r border-white/6',
                    i === 1               && 'border-r border-white/6',
                    i < 2                 && 'border-b md:border-b-0 border-white/6',
                  )}
                >
                  <span className={`text-2xl font-bold tabular-nums ${profileLoading ? 'text-white/20' : 'gradient-text'}`}>
                    {stat.value}
                  </span>
                  <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.13em] text-white/30 leading-tight text-center max-w-[72px]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>}

        {/* Badge + heading + description */}
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-beacon" />
          {gc.pageBadge}
        </span>
        <h1 className="mt-4 text-5xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">{gc.pageHeadline}.</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base text-muted-foreground leading-relaxed">
          {gc.pageSubheadline}
        </p>
      </div>

      {/* ── Contribution heatmap — fit-width card ─────────────────────────── */}
      {gc.showContributions && <ScrollReveal>
        <div className="mb-10 w-fit max-w-full">
          <div className="glass-strong rounded-2xl p-5 relative overflow-hidden">
            <BorderBeam duration={8} />

            {/* Header: two lines so count always fits */}
            <div className="mb-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Contribution Activity
              </p>
              {!contribLoading && contribTotal > 0 ? (
                <p className="mt-0.5 font-mono text-[10px] text-white/40">
                  {contribTotal.toLocaleString()} contributions in the last year
                </p>
              ) : contribLoading ? (
                <div className="mt-1 h-2.5 w-48 rounded bg-white/5 animate-pulse" />
              ) : null}
            </div>

            {/* Grid */}
            {contribLoading ? (
              <div className="overflow-x-auto">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(7, ${CELL}px)`,
                    gridAutoColumns: `${CELL}px`,
                    gridAutoFlow: 'column',
                    gap: `${GAP}px`,
                    width: 52 * (CELL + GAP),
                    marginLeft: DAY_LABEL_W,
                  }}
                >
                  {Array.from({ length: 52 * 7 }).map((_, i) => (
                    <span
                      key={i}
                      style={{ width: CELL, height: CELL, borderRadius: 2, display: 'block', backgroundColor: CONTRIB_COLORS[0] }}
                    />
                  ))}
                </div>
              </div>
            ) : heatmap.weeks.length > 0 ? (
              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'] }}>
                <div style={{ width: gridWidth, position: 'relative' }}>

                  {/* Month labels */}
                  <div style={{ paddingLeft: DAY_LABEL_W, position: 'relative', height: 18, marginBottom: 2 }}>
                    {heatmap.monthLabels.map(({ month, col }) => (
                      <span
                        key={`${month}-${col}`}
                        className="font-mono text-[9px] text-white/40"
                        style={{ position: 'absolute', left: col * (CELL + GAP) }}
                      >
                        {month}
                      </span>
                    ))}
                  </div>

                  {/* Day labels + week columns */}
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ width: DAY_LABEL_W, display: 'flex', flexDirection: 'column', gap: GAP, flexShrink: 0, paddingTop: 1 }}>
                      {DAY_LABELS.map((label, di) => (
                        <div key={di} style={{ height: CELL, lineHeight: `${CELL}px` }} className="font-mono text-[9px] text-white/30 text-right pr-2">
                          {label}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: GAP }}>
                      {heatmap.weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                          {week.days.map((day, di) => (
                            <span
                              key={di}
                              style={{
                                width:           CELL,
                                height:          CELL,
                                borderRadius:    2,
                                display:         'block',
                                backgroundColor: day === null ? 'transparent' : CONTRIB_COLORS[day.level],
                                transition:      'background-color 0.15s',
                              }}
                              title={
                                day
                                  ? day.count > 0
                                    ? `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`
                                    : `${day.date}: No contributions`
                                  : ''
                              }
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-3 flex items-center gap-1.5" style={{ paddingLeft: DAY_LABEL_W }}>
                    <span className="font-mono text-[9px] text-white/25">Less</span>
                    {CONTRIB_COLORS.map((color, l) => (
                      <span key={l} style={{ width: CELL, height: CELL, borderRadius: 2, display: 'inline-block', backgroundColor: color }} />
                    ))}
                    <span className="font-mono text-[9px] text-white/25">More</span>
                  </div>

                </div>
              </div>
            ) : null}
          </div>
        </div>
      </ScrollReveal>}


      {/* ── Curated own repos ─────────────────────────────────────────────── */}
      {gc.showOwnRepos && curatedRepos.length > 0 && (
        <ScrollReveal delay={0.1}>
          <div className="mb-10">
            <div className="mb-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-1">
                <Code2 className="inline-block h-3 w-3 mr-1.5 -mt-0.5" />
                @{gc.username}
              </p>
              <h2 className="text-xl font-semibold text-foreground">{gc.ownReposTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{gc.ownReposSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {curatedRepos.map(({ slug, meta, url }) => (
                <a
                  key={slug}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-card/50 hover:shadow-[0_0_18px_-6px_var(--primary)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[12px] font-semibold text-foreground/80 group-hover:text-primary transition-colors truncate">
                      {slug}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  {meta?.description && (
                    <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
                      {meta.description}
                    </p>
                  )}
                  {gc.showTopics && meta?.topics && meta.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {meta.topics.slice(0, 3).map(tp => (
                        <span key={tp} className="rounded-md border border-border/40 px-1.5 py-px font-mono text-[8px] text-muted-foreground/50">
                          #{tp}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      {meta?.language && meta.language !== 'Unknown' && (
                        <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/50">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: LANG_COLORS[meta.language] ?? '#8B949E' }} />
                          {meta.language}
                        </span>
                      )}
                      {(meta?.stars ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 font-mono text-[9px] text-amber-400/50">
                          <Star className="h-2.5 w-2.5 fill-amber-400/20" />
                          {(meta!.stars).toLocaleString()}
                        </span>
                      )}
                      {gc.showForks && (meta?.forks ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground/40">
                          <GitFork className="h-2.5 w-2.5" />{meta!.forks}
                        </span>
                      )}
                    </div>
                    {meta?.pinned && (
                      <span className="font-mono text-[8px] text-primary/50 border border-primary/20 rounded-full px-1.5 py-px">
                        pinned
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Starred / Curated repos */}
      {gc.showStarred && (starredLoading || starred.length > 0) && (
        <ScrollReveal delay={0.2}>
          <div className="mb-10">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-1">
                  Curated by @{GITHUB_USERNAME}
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  ⭐ {gc.starredTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {gc.starredSubtitle}
                </p>
              </div>
              {!starredLoading && starred.length > 0 && (
                <span className="font-mono text-[10px] text-muted-foreground/50">
                  {activeCategory === 'all'
                    ? `${(starredCount ?? starred.length).toLocaleString()} repos`
                    : `${filteredStarred.length} / ${(starredCount ?? starred.length).toLocaleString()} repos`}
                </span>
              )}
            </div>

            {/* ── Category tabs ───────────────────────────────────────────── */}
            {gc.showStarredCategories && !starredLoading && starred.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-1.5">
                {STAR_CATEGORIES.map(cat => {
                  const count = categoryCounts[cat.id] ?? 0
                  const active = activeCategory === cat.id
                  if (cat.id !== 'all' && count === 0) return null
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] transition-all duration-150',
                        active
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border/40 bg-card/20 text-muted-foreground/60 hover:border-border/60 hover:text-foreground/70'
                      )}
                    >
                      {cat.label}
                      <span className={cn(
                        'rounded-full px-1.5 py-px text-[8px] tabular-nums',
                        active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground/40'
                      )}>
                        {cat.id === 'all' ? (starredCount ?? count) : count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Loading skeleton ─────────────────────────────────────────── */}
            {starredLoading && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/40 bg-card/30 p-4 space-y-2">
                    <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
                    <div className="h-2.5 w-full rounded bg-white/5 animate-pulse" />
                    <div className="h-2.5 w-3/4 rounded bg-white/5 animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* ── Repo grid ───────────────────────────────────────────────── */}
            {!starredLoading && filteredStarred.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStarred.map(repo => (
                  <a
                    key={repo.id}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col gap-2 rounded-xl border border-border/40 bg-card/30 p-4 transition-all duration-300 hover:border-primary/20 hover:bg-card/50 hover:shadow-[0_0_18px_-6px_var(--primary)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Star className="h-3 w-3 text-amber-400/60 fill-amber-400/30 shrink-0" />
                        <span className="font-mono text-[11px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors truncate">
                          <span className="text-muted-foreground/50">{repo.owner}/</span>{repo.name}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    {repo.description && (
                      <p className="text-[11px] text-muted-foreground/70 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map(tp => (
                          <span key={tp} className="rounded-md border border-border/40 px-1.5 py-px font-mono text-[8px] text-muted-foreground/50">
                            #{tp}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/50">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: LANG_COLORS[repo.language] ?? '#8B949E' }} />
                            {repo.language}
                          </span>
                        )}
                        {repo.stars > 0 && (
                          <span className="flex items-center gap-0.5 font-mono text-[9px] text-amber-400/50">
                            <Star className="h-2.5 w-2.5 fill-amber-400/20" />
                            {repo.stars.toLocaleString()}
                          </span>
                        )}
                        {repo.forks > 0 && (
                          <span className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground/40">
                            <GitFork className="h-2.5 w-2.5" />{repo.forks}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[8px] text-muted-foreground/30">
                        {relTimeStarred(repo.updatedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* ── Empty state for a category ───────────────────────────────── */}
            {!starredLoading && filteredStarred.length === 0 && activeCategory !== 'all' && (
              <div className="rounded-xl border border-border/30 bg-card/20 py-12 text-center">
                <p className="font-mono text-xs text-muted-foreground/40">
                  No repos clasificados en esta categoría
                </p>
              </div>
            )}

          </div>
        </ScrollReveal>
      )}

    </DomainLayout>
  )
}
