/**
 * ContentItem — unified base type for all content across the site.
 *
 * Domain-specific types (ProjectEntry, SystemEntry, etc.) live in
 * src/lib/admin/types.ts and are re-exported from here for convenience.
 * In Phase 3 those types can be migrated to extend ContentItem directly.
 */

export type ContentType =
  | 'article'
  | 'project'
  | 'research'
  | 'lab'
  | 'system'
  | 'resource'

export type ContentStatus = 'draft' | 'published' | 'archived'

export type ContentLocale = 'en' | 'es'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  slug: string
  description: string
  status: ContentStatus
  locale: ContentLocale
  tags: string[]
  publishedAt: string   // ISO 8601
  updatedAt: string     // ISO 8601
  featured: boolean
}

// ── Article ───────────────────────────────────────────────────────────────────
export type { ArticleMeta, Article, ArticleCategory, ArticleDepth } from '@/lib/journal/types'

// ── Admin-managed content types ───────────────────────────────────────────────
// These live in admin/types.ts (Phase 2 constraint: no schema mutation).
// Re-exported here so public pages can import from a single, stable location.
export type {
  ProjectEntry,
  ProjectStatus,
  ProjectCategory,
  SystemEntry,
  LabEntry,
  LabStatus,
  ResearchEntry,
  ResearchCategory,
} from '@/lib/admin/types'

// ── Discriminated union for content items ─────────────────────────────────────
// Adapters that wrap admin types into the ContentItem shape.
// Use these when you need to render a feed of mixed content types.

import type { ArticleMeta } from '@/lib/journal/types'
import type { ProjectEntry, SystemEntry, LabEntry, ResearchEntry } from '@/lib/admin/types'

export function articleToContentItem(a: ArticleMeta): ContentItem {
  return {
    id:          a.slug,
    type:        'article',
    title:       a.title,
    slug:        a.slug,
    description: a.excerpt,
    status:      'published',
    locale:      'en',
    tags:        a.tags,
    publishedAt: a.date,
    updatedAt:   a.date,
    featured:    a.featured ?? false,
  }
}

export function projectToContentItem(p: ProjectEntry): ContentItem {
  return {
    id:          p.id,
    type:        'project',
    title:       p.title,
    slug:        p.slug,
    description: p.description,
    status:      p.published ? 'published' : 'draft',
    locale:      'en',
    tags:        p.tags,
    publishedAt: p.createdAt ?? new Date(0).toISOString(),
    updatedAt:   p.updatedAt ?? p.createdAt ?? new Date(0).toISOString(),
    featured:    p.featured,
  }
}

export function researchToContentItem(r: ResearchEntry): ContentItem {
  return {
    id:          r.slug,
    type:        'research',
    title:       r.title,
    slug:        r.slug,
    description: r.excerpt,
    status:      r.published ? 'published' : 'draft',
    locale:      'en',
    tags:        r.tags,
    publishedAt: r.createdAt ?? new Date(0).toISOString(),
    updatedAt:   r.createdAt ?? new Date(0).toISOString(),
    featured:    r.featured,
  }
}

export function labToContentItem(l: LabEntry): ContentItem {
  return {
    id:          l.key,
    type:        'lab',
    title:       l.name,
    slug:        l.key,
    description: l.description,
    status:      l.visible ? 'published' : 'draft',
    locale:      'en',
    tags:        l.stack,
    publishedAt: new Date(0).toISOString(),
    updatedAt:   new Date(0).toISOString(),
    featured:    false,
  }
}

export function systemToContentItem(s: SystemEntry): ContentItem {
  return {
    id:          s.key,
    type:        'system',
    title:       s.name,
    slug:        s.key,
    description: s.description,
    status:      s.visible ? 'published' : 'draft',
    locale:      'en',
    tags:        [s.badge],
    publishedAt: new Date(0).toISOString(),
    updatedAt:   new Date(0).toISOString(),
    featured:    false,
  }
}
