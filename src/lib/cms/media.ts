import { supabase } from '@/lib/supabase/client'
import type { MediaAssetRow, MediaAssetInsert, MediaAssetUpdate, MediaType } from '@/lib/supabase/types'

export type { MediaAssetRow, MediaAssetInsert, MediaAssetUpdate, MediaType }

export interface MediaFilter {
  mediaType?: MediaType
  search?: string
  limit?: number
  offset?: number
}

export interface MediaResult {
  assets: MediaAssetRow[]
  total: number
  error: string | null
}

// ── List ───────────────────────────────────────────────────────────────────
export async function listMedia(filter: MediaFilter = {}): Promise<MediaResult> {
  const { mediaType, search, limit = 40, offset = 0 } = filter

  let query = supabase
    .from('media_assets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (mediaType) query = query.eq('media_type', mediaType)
  if (search) query = query.ilike('filename', `%${search}%`)

  const { data, count, error } = await query
  if (error) return { assets: [], total: 0, error: error.message }
  return { assets: (data as MediaAssetRow[]) ?? [], total: count ?? 0, error: null }
}

// ── Save record (after Cloudinary upload) ─────────────────────────────────
export async function saveMediaAsset(
  insert: MediaAssetInsert
): Promise<{ asset: MediaAssetRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('media_assets')
    .insert(insert as MediaAssetInsert & Record<string, unknown>)
    .select()
    .single()

  if (error) return { asset: null, error: error.message }
  return { asset: data as MediaAssetRow, error: null }
}

// ── Update metadata ────────────────────────────────────────────────────────
export async function updateMediaAsset(
  id: string,
  update: MediaAssetUpdate
): Promise<{ asset: MediaAssetRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from('media_assets')
    .update(update as MediaAssetUpdate & Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) return { asset: null, error: error.message }
  return { asset: data as MediaAssetRow, error: null }
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteMediaAsset(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id)

  return { error: error?.message ?? null }
}

// ── MIME → MediaType ───────────────────────────────────────────────────────
export function mimeToMediaType(mime: string): MediaType {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

// ── Human-readable size ────────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
