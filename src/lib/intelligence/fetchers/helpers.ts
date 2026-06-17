import type { IntelligenceFeed } from '@/lib/admin/types'
import type { FeedItem, FetchResult } from '../types'

type ItemData = Omit<FeedItem, 'feedId' | 'feedName' | 'feedIcon' | 'feedColor'>

export function item(feed: IntelligenceFeed, data: ItemData): FeedItem {
  return { feedId: feed.id, feedName: feed.name, feedIcon: feed.icon, feedColor: feed.color, ...data }
}

export function result(feedId: string, items: FeedItem[]): FetchResult {
  return { feedId, items, fetchedAt: new Date().toISOString() }
}
