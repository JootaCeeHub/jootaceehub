/**
 * Unified content loader — re-exports all loaders from their source modules
 * under a single import path. This is the stable public API for content access.
 *
 * Consumers should import from here rather than from source modules directly,
 * so future refactors (e.g. migrating to a CMS) only require updating this file.
 *
 * Note: article loading uses Node.js `fs` — server/build context only.
 */

export {
  allArticles,
  getAllMeta,
  getArticleBySlug,
  getArticlesByCategory,
  getFeaturedArticle,
  getAllSlugs,
  getRelatedArticles,
} from '@/lib/journal/articles'

export type {
  Article,
  ArticleMeta,
  ArticleCategory,
  ArticleDepth,
} from '@/lib/journal/types'

export {
  articleToContentItem,
  projectToContentItem,
  researchToContentItem,
  labToContentItem,
  systemToContentItem,
} from './types'

export type { ContentItem, ContentType, ContentStatus, ContentLocale } from './types'
export { ContentItemSchema, ArticleMetaSchema } from './schema'

// ── Repository interface + filter helper ──────────────────────────────────────
export type { ContentFilter, ContentRepository } from './repository'
export { applyContentFilter } from './repository'

// ── Canonical ID scheme ───────────────────────────────────────────────────────
export { makeCanonicalId, parseCanonicalId, isCanonicalId, slugify, checkSlugUniqueness } from './canonical-id'
export type { CanonicalId } from './canonical-id'

// ── Unified taxonomy (tags · categories · series) ─────────────────────────────
export {
  ALL_TAGS,
  ALL_CATEGORIES,
  ALL_SERIES,
  getTagBySlug,
  getCategoryBySlug,
  getSeriesBySlug,
  resolveTagLabels,
  resolveTagObjects,
  normaliseTagSlugs,
} from './taxonomy'
export type { Tag, TaxonomyCategory, Series } from './taxonomy'
