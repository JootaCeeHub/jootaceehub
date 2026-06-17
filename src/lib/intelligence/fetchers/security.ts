import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FetchResult } from '../types'
import { item, result } from './helpers'

export async function fetchFeodoTracker(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://feodotracker.abuse.ch/downloads/ipblocklist.json')
  const data = await res.json() as Record<string, unknown>[]
  const items = data.slice(0, Math.min(limit, 50)).map((c) => item(feed, {
    id: `feodo-${String(c['ip_address'])}-${String(c['port'])}`,
    title: `${String(c['malware'] ?? 'Unknown')} C2  ·  ${String(c['ip_address'])}:${String(c['port'])}  ·  ${String(c['country'] ?? '??')}`,
    url: String(c['abuse_ch_url'] ?? 'https://feodotracker.abuse.ch'),
    excerpt: `ASN: ${String(c['as_number'] ?? '?')} (${String(c['as_name'] ?? '?')})  ·  Status: ${String(c['status'] ?? 'unknown')}`,
    publishedAt: String(c['first_seen'] ?? new Date().toISOString()),
    tags: [String(c['malware'] ?? 'malware').toLowerCase(), 'c2', 'threat', String(c['country'] ?? '').toLowerCase()],
  }))
  return result(feed.id, items)
}

export async function fetchURLhaus(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/', { method: 'POST', body: '' })
  const data = await res.json() as { urls?: Record<string, unknown>[] }
  const items = (data.urls ?? []).slice(0, Math.min(limit, 50)).map((u) => item(feed, {
    id: String(u['id']),
    title: `${String(u['threat'] ?? 'malware')}  ·  ${String(u['url'] ?? '').slice(0, 60)}`,
    url: String(u['urlhaus_reference'] ?? 'https://urlhaus.abuse.ch'),
    excerpt: `Status: ${String(u['url_status'] ?? 'unknown')}  ·  Tags: ${Array.isArray(u['tags']) ? (u['tags'] as string[]).join(', ') : 'none'}`,
    publishedAt: String(u['date_added'] ?? new Date().toISOString()),
    tags: Array.isArray(u['tags']) ? (u['tags'] as string[]) : ['malware'],
  }))
  return result(feed.id, items)
}

export async function fetchRansomwareLive(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  const res = await fetch('https://api.ransomware.live/recentvictims')
  const data = await res.json() as Record<string, unknown>[]
  const arr = Array.isArray(data) ? data : []
  const items = arr.slice(0, Math.min(limit, 30)).map((v, i) => item(feed, {
    id: `ransomware-${i}-${String(v['post_title'] ?? '')}`,
    title: `${String(v['group_name'] ?? 'Unknown')}  ·  ${String(v['post_title'] ?? 'Victim')}`,
    url: String(v['post_url'] ?? 'https://api.ransomware.live'),
    excerpt: `Country: ${String(v['country'] ?? '?')}  ·  Sector: ${String(v['activity'] ?? '?')}  ·  Published: ${String(v['published'] ?? '?')}`,
    publishedAt: String(v['published'] ?? new Date().toISOString()),
    tags: [String(v['group_name'] ?? 'ransomware').toLowerCase(), String(v['country'] ?? '').toLowerCase(), 'ransomware'].filter(Boolean),
  }))
  return result(feed.id, items)
}

export async function fetchAbuseIPDB(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — register at abuseipdb.com (1,000 req/day free)')
  const res = await fetch(
    `https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=${Math.min(limit, 100)}`,
    { headers: { Key: feed.apiKey, Accept: 'application/json' } }
  )
  const data = await res.json() as { data?: Record<string, unknown>[] }
  const items = (data.data ?? []).slice(0, Math.min(limit, 50)).map((e) => item(feed, {
    id: `abuseipdb-${String(e['ipAddress'])}`,
    title: `${String(e['ipAddress'])}  ·  ${String(e['countryCode'] ?? '??')}  ·  Confidence ${String(e['abuseConfidenceScore'] ?? '?')}%`,
    url: `https://www.abuseipdb.com/check/${String(e['ipAddress'])}`,
    excerpt: `Reports: ${String(e['totalReports'] ?? '0')}  ·  Last reported: ${String(e['lastReportedAt'] ?? '?')}  ·  ISP: ${String(e['isp'] ?? '?')}`,
    publishedAt: String(e['lastReportedAt'] ?? new Date().toISOString()),
    score: Number(e['abuseConfidenceScore'] ?? 0),
    tags: ['malicious-ip', String(e['countryCode'] ?? '').toLowerCase(), 'threat-intel'].filter(Boolean),
  }))
  return result(feed.id, items)
}

export async function fetchAlienVaultOTX(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API key required — register at otx.alienvault.com')
  const res = await fetch(
    `https://otx.alienvault.com/api/v1/pulses/subscribed?limit=${Math.min(limit, 20)}&modified_since=${new Date(Date.now() - 7 * 86400000).toISOString()}`,
    { headers: { 'X-OTX-API-KEY': feed.apiKey } }
  )
  const data = await res.json() as { results?: Record<string, unknown>[] }
  const items = (data.results ?? []).map((p) => {
    const indicators = p['indicators'] as unknown[] | undefined
    const tags = Array.isArray(p['tags']) ? (p['tags'] as string[]) : []
    return item(feed, {
      id: String(p['id']),
      title: String(p['name'] ?? ''),
      url: `https://otx.alienvault.com/pulse/${String(p['id'])}`,
      excerpt: `IOCs: ${indicators?.length ?? 0}  ·  ${String(p['description'] ?? '').slice(0, 120)}`,
      author: String(p['author_name'] ?? ''),
      publishedAt: String(p['modified'] ?? p['created'] ?? new Date().toISOString()),
      score: Number(p['subscriber_count'] ?? 0),
      tags: [...tags.slice(0, 4), 'threat-intel', 'otx'].filter(Boolean),
    })
  })
  return result(feed.id, items)
}

export async function fetchCloudflareRadar(feed: IntelligenceFeed, limit: number): Promise<FetchResult> {
  if (!feed.apiKey) throw new Error('Free API token required — get one at dash.cloudflare.com/profile/api-tokens')
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/radar/annotations/outages?limit=${Math.min(limit, 25)}&format=json`,
    { headers: { Authorization: `Bearer ${feed.apiKey}`, 'Content-Type': 'application/json' } }
  )
  const data = await res.json() as { result?: { annotations?: Record<string, unknown>[] } }
  const items = (data.result?.annotations ?? []).map((a) => item(feed, {
    id: String(a['id']),
    title: `${String(a['dataSource'] ?? 'Outage')}  ·  ${String(a['description'] ?? '').slice(0, 80)}`,
    url: 'https://radar.cloudflare.com',
    excerpt: `Type: ${String(a['type'] ?? '?')}  ·  Scope: ${String(a['linkedUrl'] ?? '?')}`,
    publishedAt: String(a['startDate'] ?? new Date().toISOString()),
    tags: ['internet', 'outage', 'cloudflare', String(a['type'] ?? '').toLowerCase()],
  }))
  return result(feed.id, items)
}
