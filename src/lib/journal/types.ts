export type ArticleCategory = 'opinion' | 'research' | 'essays' | 'news'

export type ArticleDepth = 'deep-read' | 'brief' | 'signal'

export const CATEGORY_DISPLAY: Record<ArticleCategory, string> = {
  opinion: 'Analysis',
  research: 'Field Report',
  essays: 'Essay',
  news: 'Intelligence',
}

export const DEPTH_DISPLAY: Record<ArticleDepth, string> = {
  'deep-read': 'Deep Read',
  brief: 'Brief',
  signal: 'Signal',
}

export interface ArticleMeta {
  slug: string
  title: string
  excerpt: string
  abstract?: string
  date: string
  category: ArticleCategory
  depth?: ArticleDepth
  series?: string
  tags: string[]
  readTime: number
  featured?: boolean
}

export interface Article extends ArticleMeta {
  content: string
}
