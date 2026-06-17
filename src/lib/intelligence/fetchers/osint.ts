import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'

export async function fetchGDELT(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?query=conflict%20war%20geopolitics&mode=artlist&maxrecords=${Math.min(limit, 25)}&format=json&sortby=dateadded`
  )
  const data = await res.json() as { articles?: Record<string, unknown>[] }
  const items = (data.articles ?? []).map((a, i) => item(feed, {
    id: `gdelt-${i}-${String(a['seendate'] ?? '')}`,
    title: String(a['title'] ?? ''),
    url: String(a['url'] ?? ''),
    excerpt: String(a['domain'] ?? ''),
    author: String(a['sourcecountry'] ?? ''),
    publishedAt: String(a['seendate'] ?? new Date().toISOString()),
    tags: [String(a['language'] ?? 'en'), String(a['sourcecountry'] ?? ''), 'gdelt'].filter(Boolean),
  }))
  return result(feed.id, items)
}

export async function fetchReliefWeb(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://api.reliefweb.int/v1/disasters?appname=jootacee-intelligence&profile=full&slim=1&limit=${Math.min(limit, 20)}&sort[]=date.event:desc&filter[field]=status&filter[value]=current`
  )
  const data = await res.json() as { data?: { id: number; fields: Record<string, unknown> }[] }
  const items = (data.data ?? []).map((d) => {
    const f = d.fields
    const countries = Array.isArray(f['country']) ? (f['country'] as { name: string }[]).map((c) => c.name).join(', ') : ''
    const types = Array.isArray(f['type']) ? (f['type'] as { name: string }[]).map((t) => t.name).join(', ') : ''
    const alertLevel = String((f['profile'] as Record<string, unknown> | undefined)?.['disaster-type'] ?? types)
    return item(feed, {
      id: `reliefweb-${d.id}`,
      title: `${String(f['name'] ?? '')}  ·  ${countries}`,
      url: `https://reliefweb.int/disaster/${String(f['glide'] ?? d.id)}`,
      excerpt: `Type: ${types}  ·  Status: ${String(f['status'] ?? 'active')}  ·  Glide: ${String(f['glide'] ?? '?')}`,
      publishedAt: String((f['date'] as Record<string, string> | undefined)?.event ?? new Date().toISOString()),
      tags: [types.toLowerCase(), countries.toLowerCase(), 'crisis', alertLevel.toLowerCase()].filter(Boolean),
    })
  })
  return result(feed.id, items)
}

export async function fetchUCDP(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://ucdpapi.pcr.uu.se/api/gedevents/23.1?pagesize=${Math.min(limit, 20)}&page=1`
  )
  const data = await res.json() as { Result?: Record<string, unknown>[] }
  const items = (data.Result ?? []).map((e) => item(feed, {
    id: String(e['id']),
    title: `${String(e['country'] ?? '')}  ·  ${String(e['type_of_violence'] === 1 ? 'State-based' : e['type_of_violence'] === 2 ? 'Non-state' : 'One-sided')} conflict`,
    url: `https://ucdp.uu.se/event/${String(e['id'])}`,
    excerpt: `Deaths: ${String(e['best'] ?? '0')}  ·  Location: ${String(e['geom_name'] ?? '?')}  ·  Source: ${String(e['source_original'] ?? '?').slice(0, 80)}`,
    publishedAt: String(e['date_start'] ?? new Date().toISOString()),
    score: Number(e['best'] ?? 0),
    tags: [String(e['country'] ?? '').toLowerCase(), 'conflict', 'ucdp'],
  }))
  return result(feed.id, items)
}

export async function fetchACLED(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free academic key required — register at acleddata.com')
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const res = await fetch(
    `https://api.acleddata.com/acled/read.php?key=${feed.apiKey}&email=jootacee@intel.com&limit=${Math.min(limit, 25)}&event_date=${thirtyDaysAgo}&event_date_where=>=&fields=event_id_cnty|event_date|event_type|country|location|latitude|longitude|fatalities|notes&format=json`
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).map((e) => item(feed, {
    id: String(e['event_id_cnty']),
    title: `${String(e['event_type'] ?? '')}  ·  ${String(e['location'] ?? '')}  ·  ${String(e['country'] ?? '')}`,
    url: 'https://acleddata.com',
    excerpt: `Fatalities: ${String(e['fatalities'] ?? '0')}  ·  ${String(e['notes'] ?? '').slice(0, 120)}`,
    publishedAt: String(e['event_date'] ?? new Date().toISOString()),
    score: Number(e['fatalities'] ?? 0),
    tags: [String(e['event_type'] ?? '').toLowerCase().replace(/\s+/g, '-'), String(e['country'] ?? '').toLowerCase(), 'conflict'],
  }))
  return result(feed.id, items)
}

export async function fetchOCHAHAPI(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://hapi.humdata.org/api/v1/affected-people/refugees-persons-of-concern?output_format=json&limit=${Math.min(limit, 30)}&sort_by=refugees_asylum_seekers&sort_ascending=false&app_identifier=jootacee-intelligence`
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).map((r) => {
    const refugees = Number(r['refugees_asylum_seekers'] ?? 0)
    const idps = Number(r['idps_hno'] ?? 0)
    const country = String(r['location_name'] ?? String(r['location_code'] ?? 'Unknown'))
    return item(feed, {
      id: `hapi-${String(r['location_code'])}-${String(r['year'])}`,
      title: `${country}  ·  ${(refugees / 1e6).toFixed(2)}M refugees  ·  ${(idps / 1e6).toFixed(2)}M IDPs`,
      url: 'https://hapi.humdata.org/docs',
      excerpt: `Year: ${String(r['year'] ?? '?')}  ·  Total displaced: ${((refugees + idps) / 1e6).toFixed(2)}M`,
      publishedAt: `${String(r['year'] ?? new Date().getFullYear())}-01-01T00:00:00.000Z`,
      tags: ['refugees', 'displacement', country.toLowerCase().replace(/\s+/g, '-')],
    })
  })
  return result(feed.id, items)
}

export async function fetchUNHCR(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch(
    `https://data.unhcr.org/population/get/ann_time_trends?forcenamevalue=1&sortby=forcedisplaced&fromto=2023&limit=${Math.min(limit, 20)}`
  )
  const data = await res.json() as { items?: Record<string, unknown>[] }
  const items = (data.items ?? []).map((r) => {
    const forced = Number(r['forcedisplaced'] ?? 0)
    const refugees = Number(r['refugees'] ?? 0)
    const idps = Number(r['idps'] ?? 0)
    const country = String(r['coo_name'] ?? r['coo'] ?? 'Unknown')
    return item(feed, {
      id: `unhcr-${String(r['coo'])}-${String(r['year'])}`,
      title: `${country}  ·  ${(forced / 1e6).toFixed(2)}M displaced  ·  ${String(r['year'] ?? '?')}`,
      url: 'https://www.unhcr.org/refugee-statistics/',
      excerpt: `Refugees: ${(refugees / 1e6).toFixed(2)}M  ·  IDPs: ${(idps / 1e6).toFixed(2)}M`,
      publishedAt: `${String(r['year'] ?? new Date().getFullYear())}-01-01T00:00:00.000Z`,
      score: Math.round(forced / 1000),
      tags: ['unhcr', 'displacement', country.toLowerCase().replace(/\s+/g, '-')],
    })
  })
  return result(feed.id, items)
}
