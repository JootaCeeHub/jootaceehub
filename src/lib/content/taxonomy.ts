/**
 * Unified taxonomy — single source of truth for tags, categories, and series.
 *
 * Canonical data lives in src/content/taxonomies/tags.json (committed to Git).
 * Series is reserved for Phase 3 when src/content/taxonomies/series.json is added.
 *
 * Import from here rather than importing tags.json directly so the shape can
 * evolve without touching consumers.
 */

import tagsRaw from '@/content/taxonomies/tags.json'

// ── Tag ───────────────────────────────────────────────────────────────────────

export interface Tag {
  slug: string
  label: string
  color: string
  description: string
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface TaxonomyCategory {
  slug: string
  label: string
  parent: string | null
}

// ── Series (Phase 3 placeholder) ──────────────────────────────────────────────

export interface Series {
  slug: string
  label: string
  description: string
  /** Ordered list of article slugs in this series */
  items?: string[]
}

// ── Canonical data ────────────────────────────────────────────────────────────

const raw = tagsRaw as {
  tags: Tag[]
  categories: TaxonomyCategory[]
}

export const ALL_TAGS: readonly Tag[] = raw.tags
export const ALL_CATEGORIES: readonly TaxonomyCategory[] = raw.categories

/**
 * Phase 3: populate when src/content/taxonomies/series.json is added.
 * Kept here as a stable export so consumers don't need to be updated later.
 */
export const ALL_SERIES: readonly Series[] = []

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getTagBySlug(slug: string): Tag | undefined {
  return ALL_TAGS.find(t => t.slug === slug)
}

export function getCategoryBySlug(slug: string): TaxonomyCategory | undefined {
  return ALL_CATEGORIES.find(c => c.slug === slug)
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return ALL_SERIES.find(s => s.slug === slug)
}

// ── Normalisation helpers ─────────────────────────────────────────────────────

/**
 * Convert raw tag strings (which may be labels) to slugs.
 * Unknown tags are passed through lowercased for forward-compatibility.
 */
export function normaliseTagSlugs(rawTags: string[]): string[] {
  return rawTags.map(t => {
    const slug = t.toLowerCase().replace(/\s+/g, '-')
    return slug
  })
}

/**
 * Resolve tag slugs to their full Tag objects, dropping unknowns.
 */
export function resolveTagObjects(slugs: string[]): Tag[] {
  return slugs.flatMap(s => {
    const tag = getTagBySlug(s)
    return tag ? [tag] : []
  })
}

/**
 * Resolve tag slugs to display labels.
 * Unknown slugs are returned as-is (capitalised) for graceful degradation.
 */
export function resolveTagLabels(slugs: string[]): string[] {
  return slugs.map(s => getTagBySlug(s)?.label ?? s.replace(/-/g, ' '))
}
