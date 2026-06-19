// Git-First CMS: media stored on VPS. Supabase removed per ADR-008.
// All operations delegate to VPS API via src/lib/api/media.ts.

import { apiListMedia, apiUploadMedia, apiDeleteMedia } from '@/lib/api/media'

export type MediaType = 'image' | 'video' | 'document'

export interface MediaAssetRow {
  id: string
  filename: string
  original_url: string
  width: number | null
  height: number | null
  size_bytes: number
  mime_type: string
  media_type: MediaType
  alt_text: string | null
  uploaded_by: string
  created_at: string
}

export interface MediaAssetInsert {
  filename: string
  original_url: string
  width?: number | null
  height?: number | null
  size_bytes: number
  mime_type: string
  media_type?: MediaType
  alt_text?: string | null
  uploaded_by: string
}

export type MediaAssetUpdate = Partial<Pick<MediaAssetInsert, 'alt_text'>>

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

export async function listMedia(filter: MediaFilter = {}): Promise<MediaResult> {
  const res = await apiListMedia()
  if (!res.success || !res.data) {
    return { assets: [], total: 0, error: res.error ?? 'VPS API not available' }
  }
  let assets = res.data.map((f) => ({
    id: f.path,
    filename: f.path.split('/').pop() ?? f.path,
    original_url: f.url,
    width: null,
    height: null,
    size_bytes: f.size,
    mime_type: mimeFromPath(f.path),
    media_type: mimeToMediaType(mimeFromPath(f.path)),
    alt_text: null,
    uploaded_by: 'admin',
    created_at: f.lastModified,
  }))

  if (filter.mediaType) assets = assets.filter((a) => a.media_type === filter.mediaType)
  if (filter.search) {
    const q = filter.search.toLowerCase()
    assets = assets.filter((a) => a.filename.toLowerCase().includes(q))
  }

  const total = assets.length
  const offset = filter.offset ?? 0
  const limit = filter.limit ?? 40
  return { assets: assets.slice(offset, offset + limit), total, error: null }
}

export async function saveMediaAsset(
  insert: MediaAssetInsert
): Promise<{ asset: MediaAssetRow | null; error: string | null }> {
  // Saving media metadata is handled by the VPS during upload; this is a no-op stub.
  // Use apiUploadMedia directly for file uploads.
  void insert
  return { asset: null, error: 'Use VPS upload endpoint directly' }
}

export async function uploadMedia(
  file: File,
  folder?: string,
  alt?: string,
): Promise<{ asset: MediaAssetRow | null; error: string | null }> {
  const res = await apiUploadMedia(file, folder, alt)
  if (!res.success || !res.data) return { asset: null, error: res.error ?? 'Upload failed' }
  return {
    asset: {
      id: res.data.url,
      filename: file.name,
      original_url: res.data.url,
      width: res.data.width,
      height: res.data.height,
      size_bytes: res.data.size,
      mime_type: file.type,
      media_type: mimeToMediaType(file.type),
      alt_text: res.data.alt || null,
      uploaded_by: 'admin',
      created_at: new Date().toISOString(),
    },
    error: null,
  }
}

export async function updateMediaAsset(
  _id: string,
  _update: MediaAssetUpdate
): Promise<{ asset: MediaAssetRow | null; error: string | null }> {
  return { asset: null, error: null }
}

export async function deleteMediaAsset(path: string): Promise<{ error: string | null }> {
  const res = await apiDeleteMedia(path)
  if (!res.success) return { error: res.error ?? 'Delete failed' }
  return { error: null }
}

export function mimeToMediaType(mime: string): MediaType {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

function mimeFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif',
    mp4: 'video/mp4', webm: 'video/webm',
    pdf: 'application/pdf',
  }
  return map[ext] ?? 'application/octet-stream'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
