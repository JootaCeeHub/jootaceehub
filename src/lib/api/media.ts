'use client'

import { apiClient } from './client'
import type { APIResponse, MediaUploadResult, MediaFileMeta } from './types'

export async function apiUploadMedia(
  file: File,
  folder = 'uploads',
  alt = '',
): Promise<APIResponse<MediaUploadResult>> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  fd.append('alt', alt)
  return apiClient.upload<MediaUploadResult>('/media', fd)
}

export async function apiListMedia(): Promise<APIResponse<MediaFileMeta[]>> {
  return apiClient.get<MediaFileMeta[]>('/media')
}

export async function apiDeleteMedia(path: string): Promise<APIResponse<{ deleted: boolean; path: string }>> {
  return apiClient.delete(`/media/${path}`)
}
