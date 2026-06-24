/**
 * MDX Content Adapter — wraps the journal article loader in the ContentRepository interface.
 *
 * SERVER / BUILD-TIME ONLY.
 * This module imports src/lib/journal/articles.ts which uses Node.js `fs`.
 * Do not import this from client components — it will fail at runtime.
 *
 * Use case: generating static pages, sitemaps, RSS feeds, and related-content
 * features during `next build`.
 */

import { getAllMeta } from '@/lib/content/loaders'
import { articleToContentItem } from '@/lib/content/types'
import { applyContentFilter } from '@/lib/content/repository'
import type { ContentItem, ContentLocale } from '@/lib/content/types'
import type { ContentFilter, ContentRepository } from '@/lib/content/repository'

/**
 * Create an in-memory ContentRepository<ContentItem> backed by all MDX articles
 * in src/content/articles/.
 *
 * Call once at module level (or inside generateStaticParams) — loading is
 * synchronous and cached by the module system.
 *
 * @example
 * const repo = createMdxContentAdapter()
 * const articles = await repo.findAll({ status: 'published', featured: true })
 */
export function createMdxContentAdapter(): ContentRepository<ContentItem> {
  const items: ContentItem[] = getAllMeta().map(articleToContentItem)

  return {
    async findBySlug(slug: string, _locale?: ContentLocale): Promise<ContentItem | null> {
      return items.find(i => i.slug === slug) ?? null
    },

    async findAll(filter?: ContentFilter): Promise<ContentItem[]> {
      return applyContentFilter(items, filter)
    },

    async count(filter?: ContentFilter): Promise<number> {
      return applyContentFilter(items, filter).length
    },

    async search(query: string, filter?: ContentFilter): Promise<ContentItem[]> {
      const q = query.toLowerCase()
      const matches = items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q)),
      )
      return applyContentFilter(matches, filter)
    },
  }
}
