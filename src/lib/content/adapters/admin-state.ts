/**
 * AdminState Registry Adapter — wraps in-memory admin registries in the
 * ContentRepository interface.
 *
 * CLIENT-SAFE. No Node.js dependencies.
 *
 * Use case: unified content search / listing in the admin panel, preview pages,
 * and any client component that needs to query across content types without
 * caring which registry they come from.
 *
 * @example
 * const { state } = useAdmin()
 * const repo = createRegistryAdapter({
 *   projects: state.projectsRegistry,
 *   labs:     state.labsRegistry,
 *   systems:  state.systemsRegistry,
 *   research: state.researchRegistry,
 * })
 * const featured = await repo.findAll({ featured: true, status: 'published' })
 */

import type { ContentItem, ContentLocale } from '@/lib/content/types'
import type { ContentFilter, ContentRepository } from '@/lib/content/repository'
import type {
  ProjectEntry,
  LabEntry,
  SystemEntry,
  ResearchEntry,
} from '@/lib/admin/types'
import {
  projectToContentItem,
  labToContentItem,
  systemToContentItem,
  researchToContentItem,
} from '@/lib/content/types'
import { applyContentFilter } from '@/lib/content/repository'

// ── Snapshot type ─────────────────────────────────────────────────────────────

/** A snapshot of AdminState registry arrays — all fields are optional. */
export interface RegistrySnapshot {
  projects?: ProjectEntry[]
  labs?:     LabEntry[]
  systems?:  SystemEntry[]
  research?: ResearchEntry[]
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Build an in-memory ContentRepository from AdminState registries.
 * The returned repository is a pure value — it does not subscribe to state
 * changes. Re-create it when the registries change.
 */
export function createRegistryAdapter(
  snapshot: RegistrySnapshot,
): ContentRepository<ContentItem> {
  const items: ContentItem[] = [
    ...(snapshot.projects ?? []).map(projectToContentItem),
    ...(snapshot.labs     ?? []).map(labToContentItem),
    ...(snapshot.systems  ?? []).map(systemToContentItem),
    ...(snapshot.research ?? []).map(researchToContentItem),
  ]

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
