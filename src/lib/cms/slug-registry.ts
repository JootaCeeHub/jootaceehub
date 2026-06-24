/**
 * Global slug collision detection across all content registries.
 * Scans: projects, research, labs (key), systems (key), tags, categories, series, MDX articles.
 */
import type { AdminState } from '@/lib/admin/types'

export type SlugOwner =
  | 'project'
  | 'research'
  | 'lab'
  | 'system'
  | 'tag'
  | 'category'
  | 'series'
  | 'article'

export interface SlugEntry {
  slug: string
  owner: SlugOwner
  label: string
  /** The item's canonical id (for same-item update exemption). */
  itemId?: string
}

export interface SlugCollision {
  slug: string
  conflicts: SlugEntry[]
}

/** Build the full registry from AdminState. */
export function buildSlugRegistry(state: AdminState): SlugEntry[] {
  const entries: SlugEntry[] = []

  // Projects
  for (const p of state.projectsRegistry ?? []) {
    if (p.slug) entries.push({ slug: p.slug, owner: 'project', label: p.title, itemId: p.id })
  }

  // Research
  for (const r of state.researchRegistry ?? []) {
    if (r.slug) entries.push({ slug: r.slug, owner: 'research', label: r.title, itemId: r.slug })
  }

  // Labs (key is the unique identifier)
  for (const l of state.labsRegistry ?? []) {
    if (l.key) entries.push({ slug: l.key, owner: 'lab', label: l.name, itemId: l.key })
  }

  // Systems (key is the unique identifier)
  for (const s of state.systemsRegistry ?? []) {
    if (s.key) entries.push({ slug: s.key, owner: 'system', label: s.name, itemId: s.key })
  }

  // Tags
  for (const t of state.tagRegistry ?? []) {
    if (t.slug) entries.push({ slug: t.slug, owner: 'tag', label: t.label, itemId: t.id })
  }

  // Categories
  for (const c of state.categoryRegistry ?? []) {
    if (c.slug) entries.push({ slug: c.slug, owner: 'category', label: c.label, itemId: c.id })
  }

  // Series
  for (const s of state.seriesRegistry ?? []) {
    if (s.slug) entries.push({ slug: s.slug, owner: 'series', label: s.title, itemId: s.id })
  }

  return entries
}

/** Find all slug collisions in the registry (slug shared by ≥ 2 entries). */
export function findCollisions(entries: SlugEntry[]): SlugCollision[] {
  const bySlug = new Map<string, SlugEntry[]>()
  for (const e of entries) {
    const list = bySlug.get(e.slug) ?? []
    list.push(e)
    bySlug.set(e.slug, list)
  }
  const collisions: SlugCollision[] = []
  for (const [slug, conflicts] of bySlug) {
    if (conflicts.length > 1) collisions.push({ slug, conflicts })
  }
  return collisions
}

/** Check if a proposed slug is already in use (optionally exempting the current item). */
export function isSlugTaken(
  entries: SlugEntry[],
  slug: string,
  exemptItemId?: string,
): boolean {
  return entries.some(
    e => e.slug === slug && (exemptItemId === undefined || e.itemId !== exemptItemId),
  )
}

/** Return all entries that own a given slug. */
export function ownersOf(entries: SlugEntry[], slug: string): SlugEntry[] {
  return entries.filter(e => e.slug === slug)
}

/** Suggest a non-colliding slug variant by appending -2, -3, … */
export function suggestUniqueSlug(entries: SlugEntry[], base: string): string {
  if (!isSlugTaken(entries, base)) return base
  let n = 2
  while (isSlugTaken(entries, `${base}-${n}`)) n++
  return `${base}-${n}`
}

/** Normalize a raw string to a valid slug. */
export function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
