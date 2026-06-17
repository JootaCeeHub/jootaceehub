'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { getAllTags, getAllCategories } from '@/lib/cms/tags'
import type { TagCount, CategoryCount } from '@/lib/cms/tags'

export function useTags() {
  const [tags, setTags] = useState<TagCount[]>([])
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getAllTags(), getAllCategories()]).then(([t, c]) => {
      if (cancelled) return
      setTags(t)
      setCategories(c)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return { tags, categories, loading }
}
