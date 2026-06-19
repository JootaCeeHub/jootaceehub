'use client'

import { apiClient } from './client'
import type { APIResponse, ContentFileMeta, WriteResult } from './types'

export async function apiListContent(type?: string): Promise<APIResponse<ContentFileMeta[]>> {
  const path = type ? `/content/${type}` : '/content'
  return apiClient.get<ContentFileMeta[]>(path)
}

export async function apiReadContent(type: string, slug: string): Promise<APIResponse<unknown>> {
  return apiClient.get<unknown>(`/content/${type}/${slug}`)
}

export async function apiWriteContent(
  type: string,
  slug: string,
  data: unknown,
): Promise<APIResponse<WriteResult>> {
  if (typeof data === 'string') {
    return apiClient.putText<WriteResult>(`/content/${type}/${slug}`, data)
  }
  return apiClient.put<WriteResult>(`/content/${type}/${slug}`, data)
}

export async function apiDeleteContent(
  type: string,
  slug: string,
): Promise<APIResponse<{ deleted: boolean; path: string }>> {
  return apiClient.delete(`/content/${type}/${slug}`)
}
