// Auto-generated types — regenerate with: npx supabase gen types typescript
// Manual types until CI generation is wired

export type PostStatus = 'draft' | 'published' | 'archived'
export type PostCategory = 'opinion' | 'research' | 'news' | 'essays' | 'tutorial'
export type MediaType = 'image' | 'video' | 'document'

// ──────────────────────────────────────────────
// Row shapes (what comes out of SELECT queries)
// ──────────────────────────────────────────────
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

export interface MediaAssetRow {
  id: string
  filename: string
  original_url: string
  cloudinary_public_id: string | null
  cloudinary_url: string | null
  width: number | null
  height: number | null
  size_bytes: number
  mime_type: string
  media_type: MediaType
  alt_text: string | null
  uploaded_by: string
  created_at: string
}

// ──────────────────────────────────────────────
// Newsletter subscribers
// ──────────────────────────────────────────────
export type SubscriberStatus = 'pending' | 'subscribed' | 'unsubscribed'

export interface NewsletterSubscriberRow {
  id: string
  email: string
  status: SubscriberStatus
  source: string
  created_at: string
}

export interface NewsletterSubscriberInsert {
  email: string
  status?: SubscriberStatus
  source?: string
}

export type NewsletterSubscriberUpdate = Partial<NewsletterSubscriberInsert>

export interface AdminConfigRow {
  id: string
  user_id: string
  config_key: string
  config_value: Record<string, unknown>
  updated_at: string
}

// ──────────────────────────────────────────────
// Insert shapes (what we send on INSERT)
// ──────────────────────────────────────────────
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

export interface MediaAssetInsert {
  filename: string
  original_url: string
  cloudinary_public_id?: string | null
  cloudinary_url?: string | null
  width?: number | null
  height?: number | null
  size_bytes: number
  mime_type: string
  media_type?: MediaType
  alt_text?: string | null
  uploaded_by: string
}

export interface AdminConfigInsert {
  user_id: string
  config_key: string
  config_value: Record<string, unknown>
}

// ──────────────────────────────────────────────
// Update shapes (partial, id excluded)
// ──────────────────────────────────────────────
export type JournalPostUpdate = Partial<Omit<JournalPostInsert, 'author_id'>>
export type MediaAssetUpdate = Partial<Omit<MediaAssetInsert, 'uploaded_by' | 'filename'>>
export type AdminConfigUpdate = Pick<AdminConfigInsert, 'config_value'>

// ──────────────────────────────────────────────
// DbTable helper — wraps Row/Insert/Update with Record<string, unknown> so
// Database satisfies Supabase's GenericSchema constraint (required for typed
// query returns). At call sites, pass values as `insert as T & Record<string, unknown>`.
// ──────────────────────────────────────────────
type DbTable<Row extends object, Insert extends object, Update extends object> = {
  Row: Row & Record<string, unknown>
  Insert: Insert & Record<string, unknown>
  Update: Update & Record<string, unknown>
  Relationships: []
}

// ──────────────────────────────────────────────
// Full Database type for supabase client generics
// ──────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      journal_posts: DbTable<JournalPostRow, JournalPostInsert, JournalPostUpdate>
      media_assets: DbTable<MediaAssetRow, MediaAssetInsert, MediaAssetUpdate>
      admin_config: DbTable<AdminConfigRow, AdminConfigInsert, AdminConfigUpdate>
      newsletter_subscribers: DbTable<NewsletterSubscriberRow, NewsletterSubscriberInsert, NewsletterSubscriberUpdate>
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      post_status: PostStatus
      post_category: PostCategory
      media_type: MediaType
    }
    CompositeTypes: { [_ in never]: never }
  }
}
