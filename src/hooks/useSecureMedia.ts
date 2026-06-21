/**
 * AdminState-backed media manager hook.
 * Operates on AdminState.mediaRegistry — persisted to localStorage.
 * All inputs are validated via media-security.ts before dispatch.
 */
'use client'

import { useCallback, useMemo } from 'react'
import { useAdmin } from '@/lib/admin/store'
import {
  validateMediaUrl,
  sanitizeAlt,
  sanitizeCaption,
  inferSource,
  type UrlValidationResult,
} from '@/lib/cms/media-security'
import type { MediaItem } from '@/lib/admin/types'

function nanoid(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export interface AddMediaPayload {
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export interface AddMediaResult {
  item: MediaItem | null
  error: string | null
  validation?: UrlValidationResult
}

export interface UseSecureMediaReturn {
  items: MediaItem[]
  total: number
  /** Validate URL without adding. */
  validateUrl: (url: string) => UrlValidationResult
  /** Add a media item after full security validation. Returns error string on failure. */
  addItem: (payload: AddMediaPayload) => AddMediaResult
  /** Update alt/caption of an existing item. */
  updateItem: (id: string, data: Partial<Pick<MediaItem, 'alt' | 'caption'>>) => void
  /** Remove a media item by id. */
  removeItem: (id: string) => void
  /** Clear all items (dangerous — protected). */
  clearAll: () => void
  /** Get a single item by id. */
  getItem: (id: string) => MediaItem | undefined
  /** Filter by mimeType prefix, e.g. 'image/'. */
  filterByType: (prefix: string) => MediaItem[]
  /** Search by url or alt text. */
  search: (query: string) => MediaItem[]
}

export function useSecureMedia(): UseSecureMediaReturn {
  const { state, dispatch } = useAdmin()

  const items = useMemo(() => state.mediaRegistry ?? [], [state.mediaRegistry])

  const validateUrl = useCallback((url: string) => validateMediaUrl(url), [])

  const addItem = useCallback((payload: AddMediaPayload): AddMediaResult => {
    const validation = validateMediaUrl(payload.url)
    if (!validation.valid) {
      return { item: null, error: validation.error ?? 'Invalid URL', validation }
    }

    const altClean = sanitizeAlt(payload.alt)
    if (!altClean) {
      return { item: null, error: 'Alt text is required for accessibility', validation }
    }

    const item: MediaItem = {
      id: nanoid(),
      url: payload.url.trim(),
      alt: altClean,
      caption: payload.caption ? sanitizeCaption(payload.caption) : undefined,
      width: payload.width,
      height: payload.height,
      mimeType: validation.mimeType,
      source: inferSource(payload.url),
      addedAt: new Date().toISOString(),
    }

    dispatch({ type: 'ADD_MEDIA_ITEM', payload: item })
    dispatch({
      type: 'LOG_AUDIT',
      payload: {
        action: 'create',
        contentType: 'media',
        contentId: item.id,
        contentSlug: item.url,
        metadata: { alt: item.alt, mimeType: item.mimeType ?? '', source: item.source },
      },
    })

    return { item, error: null, validation }
  }, [dispatch])

  const updateItem = useCallback((id: string, data: Partial<Pick<MediaItem, 'alt' | 'caption'>>) => {
    const sanitized: Partial<MediaItem> = {}
    if (data.alt !== undefined) sanitized.alt = sanitizeAlt(data.alt)
    if (data.caption !== undefined) sanitized.caption = sanitizeCaption(data.caption)
    dispatch({ type: 'UPDATE_MEDIA_ITEM', payload: { id, data: sanitized } })
  }, [dispatch])

  const removeItem = useCallback((id: string) => {
    const item = (state.mediaRegistry ?? []).find(m => m.id === id)
    dispatch({ type: 'REMOVE_MEDIA_ITEM', payload: id })
    if (item) {
      dispatch({
        type: 'LOG_AUDIT',
        payload: {
          action: 'delete',
          contentType: 'media',
          contentId: id,
          contentSlug: item.url,
          metadata: { alt: item.alt },
        },
      })
    }
  }, [dispatch, state.mediaRegistry])

  const clearAll = useCallback(() => {
    dispatch({ type: 'SET_MEDIA_REGISTRY', payload: [] })
  }, [dispatch])

  const getItem = useCallback((id: string) =>
    (state.mediaRegistry ?? []).find(m => m.id === id),
  [state.mediaRegistry])

  const filterByType = useCallback((prefix: string) =>
    items.filter(m => m.mimeType?.startsWith(prefix)),
  [items])

  const search = useCallback((query: string) => {
    const q = query.toLowerCase()
    return items.filter(m =>
      m.url.toLowerCase().includes(q) ||
      m.alt.toLowerCase().includes(q) ||
      m.caption?.toLowerCase().includes(q),
    )
  }, [items])

  return {
    items,
    total: items.length,
    validateUrl,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    getItem,
    filterByType,
    search,
  }
}
