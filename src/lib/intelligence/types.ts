// ─── Feed Item ────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: string
  feedId: string
  feedName: string
  feedIcon: string
  feedColor: string
  title: string
  url: string
  excerpt?: string
  author?: string
  publishedAt: string
  score?: number
  comments?: number
  tags: string[]
}

// ─── Fetch Result ─────────────────────────────────────────────────────────────

export interface FetchResult {
  feedId: string
  items: FeedItem[]
  fetchedAt: string
  error?: string
}

// ─── Feed Load State ──────────────────────────────────────────────────────────

export type FeedLoadState = 'idle' | 'loading' | 'success' | 'error'

export interface FeedStatus {
  feedId: string
  state: FeedLoadState
  error?: string
  fetchedAt?: string
  count: number
}
