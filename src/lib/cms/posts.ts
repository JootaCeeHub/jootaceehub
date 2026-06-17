import { supabase } from '@/lib/supabase/client'
import type {
  JournalPostRow,
  JournalPostInsert,
  JournalPostUpdate,
  PostStatus,
  PostCategory,
} from '@/lib/supabase/types'

export type { JournalPostRow, JournalPostInsert, JournalPostUpdate, PostStatus, PostCategory }

export interface PostsFilter {
  status?: PostStatus
  category?: PostCategory
  search?: string
  limit?: number
  offset?: number
}

export interface PostsResult {
  posts: JournalPostRow[]
  total: number
  error: string | null
}

// ── List ───────────────────────────────────────────────────────────────────
export async function listPosts(filter: PostsFilter = {}): Promise<PostsResult> {
  const { status, category, search, limit = 20, offset = 0 } = filter

  let query = supabase
    .from('journal_posts')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, count, error } = await query
  if (error) return { posts: [], total: 0, error: error.message }
  return { posts: (data as JournalPostRow[]) ?? [], total: count ?? 0, error: null }
}

// ── Get single ─────────────────────────────────────────────────────────────
export async function getPost(id: string): Promise<{ post: JournalPostRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { post: null, error: error.message }
  return { post: data as JournalPostRow, error: null }
}

export async function getPostBySlug(slug: string): Promise<{ post: JournalPostRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return { post: null, error: error.message }
  return { post: data as JournalPostRow, error: null }
}

// ── Create ─────────────────────────────────────────────────────────────────
export async function createPost(
  insert: JournalPostInsert
): Promise<{ post: JournalPostRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .insert(insert as JournalPostInsert & Record<string, unknown>)
    .select()
    .single()

  if (error) return { post: null, error: error.message }
  return { post: data as JournalPostRow, error: null }
}

// ── Update ─────────────────────────────────────────────────────────────────
export async function updatePost(
  id: string,
  update: JournalPostUpdate
): Promise<{ post: JournalPostRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('journal_posts')
    .update(update as JournalPostUpdate & Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) return { post: null, error: error.message }
  return { post: data as JournalPostRow, error: null }
}

// ── Publish / Unpublish ────────────────────────────────────────────────────
export async function publishPost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('journal_posts')
    .update({ status: 'published', published_at: new Date().toISOString() } as JournalPostUpdate & Record<string, unknown>)
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function unpublishPost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('journal_posts')
    .update({ status: 'draft', published_at: null } as JournalPostUpdate & Record<string, unknown>)
    .eq('id', id)

  return { error: error?.message ?? null }
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deletePost(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('journal_posts')
    .delete()
    .eq('id', id)

  return { error: error?.message ?? null }
}

// ── Slug generation helper ─────────────────────────────────────────────────
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Read-time estimate ─────────────────────────────────────────────────────
export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
