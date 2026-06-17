import { supabase } from '@/lib/supabase/client'
import type { JournalPostRow, PostCategory } from '@/lib/supabase/types'

export interface TagCount {
  tag: string
  count: number
}

export interface CategoryCount {
  category: string
  count: number
}

// ── Tag aggregation from published posts ───────────────────────────────────
export async function getAllTags(): Promise<TagCount[]> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('tags')
    .eq('status', 'published')

  if (error || !data) return []

  const counts: Record<string, number> = {}
  for (const row of data as Pick<JournalPostRow, 'tags'>[]) {
    for (const tag of row.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// ── Category aggregation ───────────────────────────────────────────────────
export async function getAllCategories(): Promise<CategoryCount[]> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('category')
    .eq('status', 'published')

  if (error || !data) return []

  const counts: Record<string, number> = {}
  for (const row of data as Pick<JournalPostRow, 'category'>[]) {
    counts[row.category] = (counts[row.category] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

// ── Posts by tag ───────────────────────────────────────────────────────────
export async function getPostsByTag(
  tag: string,
  limit = 20
): Promise<{ posts: JournalPostRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return { posts: [], error: error.message }
  return { posts: (data as JournalPostRow[]) ?? [], error: null }
}

// ── Posts by category ──────────────────────────────────────────────────────
export async function getPostsByCategory(
  category: PostCategory,
  limit = 20
): Promise<{ posts: JournalPostRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return { posts: [], error: error.message }
  return { posts: (data as JournalPostRow[]) ?? [], error: null }
}
