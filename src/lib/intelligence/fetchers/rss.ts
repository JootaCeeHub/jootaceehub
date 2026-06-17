import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FeedItem, FetchResult } from '../types'
import { item, result } from './helpers'

const RSS2JSON = 'https://api.rss2json.com/v1/api.json'

export async function fetchRSS(feed: IntelligenceFeed, rssUrl: string, limit: number): Promise<FetchResult> {
  const res = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(rssUrl)}&count=${Math.min(limit, 50)}`)
  const data = await res.json() as Record<string, unknown>
  if (data['status'] !== 'ok') throw new Error(String(data['message'] ?? 'RSS fetch failed'))

  const rawItems = (data['items'] as Record<string, unknown>[] | undefined) ?? []
  const items: FeedItem[] = rawItems.map((r, i) => item(feed, {
    id: String(r['guid'] ?? r['link'] ?? `${feed.id}-${i}`),
    title: String(r['title'] ?? ''),
    url: String(r['link'] ?? ''),
    excerpt: r['description']
      ? String(r['description']).replace(/<[^>]*>/g, '').slice(0, 200)
      : undefined,
    author: r['author'] ? String(r['author']) : undefined,
    publishedAt: String(r['pubDate'] ?? new Date().toISOString()),
    tags: Array.isArray(r['categories']) ? (r['categories'] as string[]) : [],
  }))

  return result(feed.id, items)
}

// Static RSS URL map — feeds that use the rss2json proxy without a custom fetcher
export const STATIC_RSS_URLS: Record<string, string> = {
  lobsters:        'https://lobste.rs/rss',
  tldr_newsletter: 'https://tldr.tech/api/rss/tech',
  github_trending: 'https://github.com/trending.atom',
  us_state_dept:   'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html/feed.rss.xml',
  uk_fcdo:         'https://www.gov.uk/foreign-travel-advice.atom',
  au_dfat:         'https://www.smartraveller.gov.au/news/feed',
  who_news:        'https://www.who.int/rss-feeds/news-english.xml',
  cdc_travel:      'https://tools.cdc.gov/api/v2/resources/media/316422.rss',
  ecdc_news:       'https://www.ecdc.europa.eu/en/rss.xml',
  aviation_news:   'https://news.aviation-safety.net/feed/',
  gdacs:           'https://www.gdacs.org/xml/rss.xml',
  oil_price_news:  'https://oilprice.com/rss/main',
  noaa_alerts:     'https://alerts.weather.gov/cap/us.php?x=1',
  bno_news_rss:    'https://bnonews.com/index.php/feed/',
  ap_news_rss:     'https://feeds.apnews.com/rss/apf-topnews',
  bbc_news_rss:    'https://feeds.bbci.co.uk/news/world/rss.xml',
  reuters_rss:     'https://feeds.reuters.com/reuters/topNews',
  aljazeera_rss:   'https://www.aljazeera.com/xml/rss/all.xml',
  eurostat_rss:    'https://ec.europa.eu/eurostat/rss/newrelease.rss',
}
