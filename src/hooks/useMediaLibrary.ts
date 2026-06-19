'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { listMedia, updateMediaAsset, deleteMediaAsset } from '@/lib/cms/media'
import type { MediaAssetRow, MediaFilter } from '@/lib/cms/media'

export interface UseMediaLibraryReturn {
  assets: MediaAssetRow[]
  total: number
  loading: boolean
  error: string | null
  refresh: () => void
  updateAlt: (id: string, altText: string) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

export function useMediaLibrary(filter: MediaFilter = {}): UseMediaLibraryReturn {
  const [assets, setAssets] = useState<MediaAssetRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rev, setRev] = useState(0)

  const refresh = useCallback(() => setRev((r) => r + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listMedia(filter).then(({ assets: a, total: t, error: e }) => {
      if (cancelled) return
      setAssets(a)
      setTotal(t)
      setError(e)
      setLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, filter.mediaType, filter.search, filter.limit, filter.offset])

  const updateAlt = useCallback(async (id: string, altText: string): Promise<boolean> => {
    const { error: e } = await updateMediaAsset(id, { alt_text: altText })
    if (e) { setError(e); return false }
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, alt_text: altText } : a))
    return true
  }, [])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    const { error: e } = await deleteMediaAsset(id)
    if (e) { setError(e); return false }
    refresh()
    return true
  }, [refresh])

  return { assets, total, loading, error, refresh, updateAlt, remove }
}
