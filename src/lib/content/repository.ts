/**
 * ContentRepository — universal abstraction for content access.
 *
 * Any data source (MDX files, AdminState registries, future CMS API) can
 * implement this interface so consumers are decoupled from the underlying store.
 *
 * ADR-009 documents the adapter pattern built on top of this interface.
 */

import type { ContentItem, ContentType, ContentStatus, ContentLocale } from './types'

// ── Filter ────────────────────────────────────────────────────────────────────

export interface ContentFilter {
  /** Restrict to one or more content types */
  type?: ContentType | ContentType[]
  /** Only return items with this publication status */
  status?: ContentStatus
  /** Only return items in this locale */
  locale?: ContentLocale
  /** At least one of these tags must match */
  tags?: string[]
  /** Only return featured items */
  featured?: boolean
  /** Skip the first N results (pagination) */
  offset?: number
  /** Return at most N results (pagination) */
  limit?: number
}

// ── Interface ─────────────────────────────────────────────────────────────────

export interface ContentRepository<T extends ContentItem = ContentItem> {
  /** Find a single item by its slug. Returns null if not found. */
  findBySlug(slug: string, locale?: ContentLocale): Promise<T | null>
  /** Return all items matching the filter (or all items if no filter). */
  findAll(filter?: ContentFilter): Promise<T[]>
  /** Count items matching the filter without fetching full data. */
  count(filter?: ContentFilter): Promise<number>
  /** Full-text search across title, description, and tags. */
  search(query: string, filter?: ContentFilter): Promise<T[]>
}

// ── Shared filter helper ──────────────────────────────────────────────────────

/**
 * Apply a ContentFilter to an in-memory array.
 * Used by both the MDX adapter and AdminState adapter internally.
 */
export function applyContentFilter<T extends ContentItem>(
  items: T[],
  filter?: ContentFilter,
): T[] {
  if (!filter) return items

  let result = items

  if (filter.type !== undefined) {
    const types = Array.isArray(filter.type) ? filter.type : [filter.type]
    result = result.filter(i => types.includes(i.type))
  }

  if (filter.status !== undefined) {
    result = result.filter(i => i.status === filter.status)
  }

  if (filter.locale !== undefined) {
    result = result.filter(i => i.locale === filter.locale)
  }

  if (filter.featured !== undefined) {
    result = result.filter(i => i.featured === filter.featured)
  }

  if (filter.tags !== undefined && filter.tags.length > 0) {
    const needle = new Set(filter.tags)
    result = result.filter(i => i.tags.some(t => needle.has(t)))
  }

  if (filter.offset && filter.offset > 0) {
    result = result.slice(filter.offset)
  }

  if (filter.limit && filter.limit > 0) {
    result = result.slice(0, filter.limit)
  }

  return result
}
