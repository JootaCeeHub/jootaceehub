import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'
import { fetchRSS } from './rss'

export async function fetchHackerNews(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
  const ids = (await idsRes.json() as number[]).slice(0, Math.min(limit, 15))

  const items = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      const d = await r.json() as Record<string, unknown>
      return item(feed, {
        id: String(id),
        title: String(d['title'] ?? '(no title)'),
        url: String(d['url'] ?? `https://news.ycombinator.com/item?id=${id}`),
        author: d['by'] ? String(d['by']) : undefined,
        publishedAt: d['time'] ? new Date(Number(d['time']) * 1000).toISOString() : new Date().toISOString(),
        score: d['score'] ? Number(d['score']) : undefined,
        comments: d['descendants'] ? Number(d['descendants']) : undefined,
        tags: [],
      })
    })
  )

  return result(feed.id, items)
}

export async function fetchDevTo(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(`https://dev.to/api/articles?top=7&per_page=${Math.min(limit, 30)}`)
  const data = await res.json() as Record<string, unknown>[]
  const items = data.map((a) => item(feed, {
    id: String(a['id']),
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['description'] ? String(a['description']) : undefined,
    author: (a['user'] as Record<string, unknown> | undefined)?.['name']
      ? String((a['user'] as Record<string, unknown>)['name'])
      : undefined,
    publishedAt: String(a['published_at'] ?? new Date().toISOString()),
    score: a['positive_reactions_count'] ? Number(a['positive_reactions_count']) : undefined,
    comments: a['comments_count'] ? Number(a['comments_count']) : undefined,
    tags: Array.isArray(a['tag_list']) ? (a['tag_list'] as string[]) : [],
  }))
  return result(feed.id, items)
}

export async function fetchPapersWithCode(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://paperswithcode.com/api/v1/papers/?ordering=-published&items_per_page=${Math.min(limit, 20)}`
  )
  const data = await res.json() as { results?: Record<string, unknown>[] }
  const items = (data.results ?? []).map((p) => item(feed, {
    id: String(p['id'] ?? p['title']),
    title: String(p['title'] ?? ''),
    url: String(p['url_abs'] ?? `https://paperswithcode.com${String(p['paper_page'] ?? '')}`),
    excerpt: p['abstract'] ? String(p['abstract']).slice(0, 200) : undefined,
    author: Array.isArray(p['authors']) && (p['authors'] as Record<string, unknown>[])[0]
      ? String((p['authors'] as Record<string, unknown>[])[0]['name'] ?? '')
      : undefined,
    publishedAt: String(p['published'] ?? new Date().toISOString()),
    tags: Array.isArray(p['tasks'])
      ? (p['tasks'] as Record<string, unknown>[]).map((t) => String(t['name']))
      : [],
  }))
  return result(feed.id, items)
}

export async function fetchReddit(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://www.reddit.com/r/programming/top.json?limit=${Math.min(limit, 25)}&t=day`,
    { headers: { 'User-Agent': 'JootaCee-Intelligence/1.0' } }
  )
  const data = await res.json() as { data?: { children?: { data: Record<string, unknown> }[] } }
  const posts = data.data?.children ?? []
  const items = posts.map((c) => {
    const p = c.data
    return item(feed, {
      id: String(p['id']),
      title: String(p['title'] ?? ''),
      url: String(p['url'] ?? `https://reddit.com${String(p['permalink'] ?? '')}`),
      excerpt: p['selftext'] ? String(p['selftext']).slice(0, 200) : undefined,
      author: p['author'] ? String(p['author']) : undefined,
      publishedAt: new Date(Number(p['created_utc'] ?? 0) * 1000).toISOString(),
      score: p['score'] ? Number(p['score']) : undefined,
      comments: p['num_comments'] ? Number(p['num_comments']) : undefined,
      tags: p['subreddit'] ? [String(p['subreddit'])] : [],
    })
  })
  return result(feed.id, items)
}

export async function fetchArXiv(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  return fetchRSS(feed, 'https://export.arxiv.org/rss/cs.AI+cs.LG+cs.CL', limit)
}

export async function fetchSemanticScholar(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://api.semanticscholar.org/graph/v1/paper/search?query=large+language+models&fields=title,abstract,authors,year,externalIds&limit=${Math.min(limit, 20)}`
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).map((p) => item(feed, {
    id: String(p['paperId']),
    title: String(p['title'] ?? ''),
    url: `https://www.semanticscholar.org/paper/${String(p['paperId'])}`,
    excerpt: p['abstract'] ? String(p['abstract']).slice(0, 200) : undefined,
    author: Array.isArray(p['authors']) && (p['authors'] as Record<string, unknown>[])[0]
      ? String((p['authors'] as Record<string, unknown>[])[0]['name'] ?? '')
      : undefined,
    publishedAt: p['year'] ? `${String(p['year'])}-01-01T00:00:00.000Z` : new Date().toISOString(),
    tags: ['research', 'ai', 'papers'],
  }))
  return result(feed.id, items)
}

export async function fetchWorldBank(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&per_page=${Math.min(limit, 20)}&mrv=1`
  )
  const raw = await res.json() as [unknown, Record<string, unknown>[] | null]
  const records = raw[1] ?? []
  const items = records
    .filter((d) => d['value'] !== null)
    .map((d) => {
      const country = d['country'] as Record<string, string>
      return item(feed, {
        id: `${country['id']}-${String(d['date'])}`,
        title: `${country['value']}  ·  GDP $${(Number(d['value']) / 1e12).toFixed(2)}T (${String(d['date'])})`,
        url: `https://data.worldbank.org/country/${country['id']}`,
        publishedAt: `${String(d['date'])}-01-01T00:00:00.000Z`,
        tags: ['gdp', 'economics', country['id'].toLowerCase()],
      })
    })
  return result(feed.id, items)
}

export async function fetchHuggingFace(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://huggingface.co/api/models?sort=trending&limit=${Math.min(limit, 20)}`
  )
  const data = await res.json() as Record<string, unknown>[]
  const items = data.map((m) => {
    const modelId = String(m['modelId'] ?? m['id'])
    const pipelineTag = m['pipeline_tag'] ? String(m['pipeline_tag']) : ''
    return item(feed, {
      id: modelId,
      title: modelId,
      url: `https://huggingface.co/${modelId}`,
      excerpt: pipelineTag ? `Pipeline: ${pipelineTag}  ·  Downloads: ${Number(m['downloads'] ?? 0).toLocaleString()}` : undefined,
      publishedAt: m['lastModified'] ? String(m['lastModified']) : new Date().toISOString(),
      score: m['downloads'] ? Number(m['downloads']) : undefined,
      tags: pipelineTag ? [pipelineTag, 'ai', 'model'] : ['ai', 'model'],
    })
  })
  return result(feed.id, items)
}

export async function fetchGitHubTrending(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const res = await fetch(
    `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=${Math.min(limit, 30)}`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  )
  const data = await res.json() as { items?: Record<string, unknown>[] }
  const items = (data.items ?? []).map((repo) => item(feed, {
    id: String(repo['id']),
    title: String(repo['full_name'] ?? ''),
    url: String(repo['html_url'] ?? ''),
    excerpt: repo['description'] ? String(repo['description']).slice(0, 200) : undefined,
    author: (repo['owner'] as Record<string, unknown> | undefined)?.['login']
      ? String((repo['owner'] as Record<string, unknown>)['login'])
      : undefined,
    publishedAt: String(repo['created_at'] ?? new Date().toISOString()),
    score: repo['stargazers_count'] ? Number(repo['stargazers_count']) : undefined,
    tags: Array.isArray(repo['topics']) ? (repo['topics'] as string[]) : [],
  }))
  return result(feed.id, items)
}
