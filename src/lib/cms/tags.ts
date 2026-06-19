// Git-First CMS: tags derived from static content files.
// Supabase removed per ADR-008.

import type { PostCategory } from './posts'

export interface TagCount {
  tag: string
  count: number
}

export interface CategoryCount {
  category: string
  count: number
}

// Static tag list derived from src/content/taxonomies/tags.json at build time.
// In the static export model, runtime tag aggregation is not available.
// For dynamic counts, use the AdminState registry after content is loaded.
export async function getAllTags(): Promise<TagCount[]> {
  try {
    const tagsModule = await import('@/content/taxonomies/tags.json')
    const data = tagsModule.default as { tags?: Array<{ slug: string; label: string }> }
    const tags = data.tags ?? []
    return tags.map((t) => ({ tag: t.label, count: 1 }))
  } catch {
    return []
  }
}

export async function getAllCategories(): Promise<CategoryCount[]> {
  const categories: PostCategory[] = ['opinion', 'research', 'news', 'essays', 'tutorial']
  return categories.map((category) => ({ category, count: 0 }))
}

export async function getPostsByTag(
  _tag: string,
  _limit = 20
): Promise<{ posts: never[]; error: string | null }> {
  return { posts: [], error: null }
}

export async function getPostsByCategory(
  _category: PostCategory,
  _limit = 20
): Promise<{ posts: never[]; error: string | null }> {
  return { posts: [], error: null }
}
