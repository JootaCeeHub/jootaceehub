/**
 * fetch-github-data.mjs
 *
 * Pre-fetches GitHub intelligence data for JootaCeeHub at build time and
 * writes it to public/data/github.json. This eliminates client-side API
 * calls on first load — the JSON is served as a static asset from the CDN.
 *
 * Usage:
 *   node scripts/fetch-github-data.mjs
 *   GITHUB_TOKEN=ghp_xxx node scripts/fetch-github-data.mjs
 *
 * With a token: 5,000 req/hr (authenticated)
 * Without a token: 60 req/hr (unauthenticated) — sufficient for build use
 *
 * Called automatically in postbuild via package.json.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const OUT_FILE  = join(ROOT, 'public', 'data', 'github.json')

const GITHUB_USERNAME = 'JootaCeeHub'
const TOKEN           = process.env.GITHUB_TOKEN ?? process.env.NEXT_PUBLIC_GITHUB_TOKEN

const LANGUAGE_COLORS = {
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

// ── Helpers ────────────────────────────────────────────────────────────────

function buildHeaders() {
  const h = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'jootacee-ops-build/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`
  return h
}

async function ghFetch(path) {
  const url = `https://api.github.com${path}`
  const res = await fetch(url, { headers: buildHeaders() })

  const remaining = res.headers.get('x-ratelimit-remaining')
  const reset     = res.headers.get('x-ratelimit-reset')

  if (!res.ok) {
    if (res.status === 403 && remaining === '0') {
      const resetDate = new Date(Number(reset) * 1000).toISOString()
      throw new Error(`GitHub rate limit exceeded. Resets at ${resetDate}`)
    }
    throw new Error(`GitHub API ${res.status} ${res.statusText} for ${path}`)
  }

  console.log(`  ✓ ${path} (rate: ${remaining ?? '?'} remaining)`)
  return res.json()
}

function relativeTime(isoString) {
  const ms   = Date.now() - new Date(isoString).getTime()
  const hrs  = Math.floor(ms / 3_600_000)
  if (hrs < 1)  return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  const wks  = Math.floor(days / 7)
  return `${wks}w ago`
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Fetching GitHub data for ${GITHUB_USERNAME}...`)
  if (TOKEN) {
    console.log('  🔑 Using authenticated token (5,000 req/hr)')
  } else {
    console.log('  ⚠️  No token — unauthenticated (60 req/hr). Set GITHUB_TOKEN for higher limits.')
  }

  // Parallel fetch: profile + repos + events
  console.log('\n📡 Fetching...')
  const [profile, allRepos, events] = await Promise.all([
    ghFetch(`/users/${GITHUB_USERNAME}`),
    ghFetch(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`),
    ghFetch(`/users/${GITHUB_USERNAME}/events?per_page=100`),
  ])

  // ── Activity: last 7 active days from PushEvents ────────────────────────
  const activityMap = new Map()
  let commitsLast30d = 0
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3_600_000

  for (const ev of events) {
    if (ev.type !== 'PushEvent') continue
    const date  = ev.created_at.slice(0, 10)
    const count = ev.payload?.commits?.length ?? 0
    activityMap.set(date, (activityMap.get(date) ?? 0) + count)
    if (new Date(ev.created_at).getTime() > thirtyDaysAgo) commitsLast30d += count
  }

  const activity = Array.from(activityMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, commits]) => ({ date, commits }))

  // ── Repositories: top 6 non-fork by stars, then by updated_at ──────────
  const ownRepos  = allRepos.filter(r => !r.fork)
  const forkedRepos = allRepos.filter(r => r.fork).slice(0, 3)

  // Mix: own repos first (sorted by stars), then top forks
  const sortedOwn = ownRepos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  const topRepos  = [...sortedOwn, ...forkedRepos].slice(0, 6)

  const repositories = topRepos.map(r => ({
    name:          r.name,
    description:   r.description ?? '',
    stars:         r.stargazers_count,
    forks:         r.forks_count,
    language:      r.language ?? 'Unknown',
    languageColor: LANGUAGE_COLORS[r.language] ?? '#8B949E',
    status:        r.archived ? 'development' : 'active',
    updatedAt:     relativeTime(r.pushed_at || r.updated_at),
    href:          r.html_url,
    commitVelocity: '',
    isFork:        r.fork,
    topics:        r.topics ?? [],
  }))

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalStars = allRepos.reduce((s, r) => s + r.stargazers_count, 0)
  const totalForks = allRepos.reduce((s, r) => s + r.forks_count, 0)

  // ── Releases: scan events for ReleaseEvent ───────────────────────────────
  const recentReleases = events
    .filter(ev => ev.type === 'ReleaseEvent' && ev.payload?.action === 'published')
    .slice(0, 5)
    .map(ev => ({
      repository:  ev.repo?.name?.split('/')[1] ?? ev.repo?.name ?? 'unknown',
      tagName:     ev.payload.release?.tag_name ?? '',
      publishedAt: ev.payload.release?.published_at ?? ev.created_at,
      url:         ev.payload.release?.html_url ?? `https://github.com/${ev.repo?.name}/releases`,
    }))

  // ── Deployments: scan events for DeploymentEvent or CreateEvent (tags) ───
  const deployments = events
    .filter(ev => ev.type === 'CreateEvent' && ev.payload?.ref_type === 'tag')
    .slice(0, 5)
    .map(ev => ({
      repository:  ev.repo?.name?.split('/')[1] ?? ev.repo?.name ?? 'unknown',
      environment: 'production',
      state:       'active',
      updatedAt:   ev.created_at,
    }))

  // ── Assemble ─────────────────────────────────────────────────────────────
  const data = {
    revision:      `build-${new Date().toISOString().slice(0, 10)}`,
    generatedAt:   new Date().toISOString(),
    source:        'static',
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
    recentReleases,
    deployments,
    activity,
  }

  // ── Write ─────────────────────────────────────────────────────────────────
  mkdirSync(join(ROOT, 'public', 'data'), { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8')

  console.log(`\n✅ Written to public/data/github.json`)
  console.log(`   Profile  : ${data.profile.displayName} (@${data.profile.username})`)
  console.log(`   Repos    : ${data.repositories.length} (${ownRepos.length} own, ${forkedRepos.length} forks)`)
  console.log(`   Stars    : ${totalStars}`)
  console.log(`   Commits  : ${commitsLast30d} (last 30d)`)
  console.log(`   Activity : ${activity.length} active days`)
  console.log(`   Releases : ${recentReleases.length}`)
  console.log(`   Generated: ${data.generatedAt}\n`)
}

main().catch(err => {
  console.error(`\n❌ GitHub fetch failed: ${err.message}`)
  console.error('   The site will use the live API client-side as fallback.\n')
  // Exit 0 — don't break the build if GitHub is unavailable
  process.exit(0)
})
