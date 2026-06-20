/**
 * Canonical ID — stable, collision-free identifiers for all content items.
 *
 * Format: "{type}:{slug}"
 * Examples:
 *   "article:building-with-llms"
 *   "project:jootaceehub"
 *   "lab:aura"
 *   "system:ai-engine"
 *   "research:mcp-protocol-survey"
 *   "resource:claude-api"
 *
 * Properties:
 * - Globally unique within the site (type prefix prevents slug collisions)
 * - Deterministic — derived from data, never random
 * - URL-safe — no spaces or special characters
 * - Sortable and human-readable
 */

import type { ContentType } from './types'

export type CanonicalId = string

const VALID_SEGMENT = /^[a-z0-9][a-z0-9-]*$/

/**
 * Build a canonical ID from a content type and slug.
 * Both segments must be lower-kebab-case.
 */
export function makeCanonicalId(type: ContentType | string, slug: string): CanonicalId {
  return `${type}:${slug}`
}

/**
 * Split a canonical ID back into its type and slug.
 * Returns null for malformed IDs.
 */
export function parseCanonicalId(id: CanonicalId): { type: string; slug: string } | null {
  const colonIdx = id.indexOf(':')
  if (colonIdx <= 0 || colonIdx === id.length - 1) return null
  const type = id.slice(0, colonIdx)
  const slug = id.slice(colonIdx + 1)
  return { type, slug }
}

/**
 * Returns true if the string is a well-formed canonical ID.
 * Both segments must be non-empty lower-kebab-case.
 */
export function isCanonicalId(id: string): boolean {
  const parsed = parseCanonicalId(id)
  if (!parsed) return false
  return VALID_SEGMENT.test(parsed.type) && VALID_SEGMENT.test(parsed.slug)
}

/**
 * Normalise an arbitrary string to a valid slug segment.
 * Useful when building IDs from user-supplied data.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Check if a slug is unique within a set of existing canonical IDs.
 * Returns the colliding IDs if not unique, or null if unique.
 *
 * Use this in admin validation before saving a new content item.
 */
export function checkSlugUniqueness(
  slug: string,
  type: ContentType | string,
  existingIds: CanonicalId[],
  excludeId?: CanonicalId,
): { unique: boolean; collisions: CanonicalId[] } {
  const candidate = makeCanonicalId(type, slug)
  const collisions = existingIds.filter(
    (id) => id === candidate && id !== excludeId
  )
  return { unique: collisions.length === 0, collisions }
}
