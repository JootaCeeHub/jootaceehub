// Git-First CMS: content lives in src/content/articles/ as MDX files.
// Supabase removed per ADR-008. Write operations go through VPS API (Phase 3).

export type PostStatus = 'draft' | 'published' | 'archived'
export type PostCategory = 'opinion' | 'research' | 'news' | 'essays' | 'tutorial'

export interface JournalPostRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  status: PostStatus
  category: PostCategory
  tags: string[]
  cover_image_url: string | null
  read_time: number
  author_id: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface JournalPostInsert {
  slug: string
  title: string
  excerpt?: string | null
  content?: string
  status?: PostStatus
  category: PostCategory
  tags?: string[]
  cover_image_url?: string | null
  read_time?: number
  author_id: string
  published_at?: string | null
}

export type JournalPostUpdate = Partial<Omit<JournalPostInsert, 'author_id'>>

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

const VPS_MSG = 'Content writes require VPS API (configure NEXT_PUBLIC_CONTENT_API_URL)'

export async function listPosts(_filter: PostsFilter = {}): Promise<PostsResult> {
  return { posts: [], total: 0, error: null }
}

export async function getPost(_id: string): Promise<{ post: JournalPostRow | null; error: string | null }> {
  return { post: null, error: null }
}

export async function getPostBySlug(_slug: string): Promise<{ post: JournalPostRow | null; error: string | null }> {
  return { post: null, error: null }
}

export async function createPost(
  _insert: JournalPostInsert
): Promise<{ post: JournalPostRow | null; error: string | null }> {
  return { post: null, error: VPS_MSG }
}

export async function updatePost(
  _id: string,
  _update: JournalPostUpdate
): Promise<{ post: JournalPostRow | null; error: string | null }> {
  return { post: null, error: VPS_MSG }
}

export async function publishPost(_id: string): Promise<{ error: string | null }> {
  return { error: VPS_MSG }
}

export async function unpublishPost(_id: string): Promise<{ error: string | null }> {
  return { error: VPS_MSG }
}

export async function deletePost(_id: string): Promise<{ error: string | null }> {
  return { error: VPS_MSG }
}

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

export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
