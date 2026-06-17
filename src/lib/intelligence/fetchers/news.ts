import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'

export async function fetchGuardian(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at open-platform.theguardian.com')
  const res = await fetch(
    `https://content.guardianapis.com/search?show-fields=trailText,byline&page-size=${Math.min(limit, 20)}&api-key=${feed.apiKey}`
  )
  const data = await res.json() as { response?: { results?: Record<string, unknown>[] } }
  const items = (data.response?.results ?? []).map((a) => {
    const fields = a['fields'] as Record<string, string> | undefined
    return item(feed, {
      id: String(a['id']),
      title: String(a['webTitle'] ?? ''),
      url: String(a['webUrl'] ?? ''),
      excerpt: fields?.['trailText'],
      author: fields?.['byline'],
      publishedAt: String(a['webPublicationDate'] ?? new Date().toISOString()),
      tags: [String(a['sectionName'] ?? '')].filter(Boolean),
    })
  })
  return result(feed.id, items)
}

export async function fetchNYTimes(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at developer.nytimes.com')
  const res = await fetch(
    `https://api.nytimes.com/svc/topstories/v2/technology.json?api-key=${feed.apiKey}`
  )
  const data = await res.json() as { results?: Record<string, unknown>[] }
  const items = (data.results ?? []).slice(0, limit).map((a) => item(feed, {
    id: String(a['url']),
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['abstract'] ? String(a['abstract']) : undefined,
    author: a['byline'] ? String(a['byline']).replace(/^By /i, '') : undefined,
    publishedAt: String(a['published_date'] ?? new Date().toISOString()),
    tags: Array.isArray(a['des_facet']) ? (a['des_facet'] as string[]).slice(0, 3) : [],
  }))
  return result(feed.id, items)
}

export async function fetchNewsAPI(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at newsapi.org')
  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?language=en&pageSize=${Math.min(limit, 20)}&apiKey=${feed.apiKey}`
  )
  const data = await res.json() as { status?: string; message?: string; articles?: Record<string, unknown>[] }
  if (data.status !== 'ok') throw new Error(data.message ?? 'NewsAPI error')
  const items = (data.articles ?? []).map((a, i) => item(feed, {
    id: `newsapi-${i}-${String(a['publishedAt'] ?? '')}`,
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['description'] ? String(a['description']) : undefined,
    author: a['author'] ? String(a['author']) : undefined,
    publishedAt: String(a['publishedAt'] ?? new Date().toISOString()),
    tags: [(a['source'] as Record<string, string> | undefined)?.['name'] ?? ''].filter(Boolean),
  }))
  return result(feed.id, items)
}

export async function fetchGNews(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at gnews.io')
  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?token=${feed.apiKey}&lang=en&max=${Math.min(limit, 10)}`
  )
  const data = await res.json() as { errors?: string[]; articles?: Record<string, unknown>[] }
  if (data.errors?.length) throw new Error(data.errors[0])
  const items = (data.articles ?? []).map((a) => item(feed, {
    id: String(a['url']),
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['description'] ? String(a['description']) : undefined,
    author: (a['source'] as Record<string, string> | undefined)?.['name'],
    publishedAt: String(a['publishedAt'] ?? new Date().toISOString()),
    tags: [],
  }))
  return result(feed.id, items)
}

export async function fetchMediastack(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — get one at mediastack.com')
  const res = await fetch(
    `http://api.mediastack.com/v1/news?access_key=${feed.apiKey}&languages=en&limit=${Math.min(limit, 25)}`
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).map((a, i) => item(feed, {
    id: `mediastack-${i}-${String(a['published_at'] ?? '')}`,
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: a['description'] ? String(a['description']) : undefined,
    author: a['author'] ? String(a['author']) : undefined,
    publishedAt: String(a['published_at'] ?? new Date().toISOString()),
    tags: [String(a['source'] ?? ''), String(a['category'] ?? '')].filter(Boolean),
  }))
  return result(feed.id, items)
}
