import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('@/lib/cms/tags', () => ({
  getAllTags:       vi.fn(),
  getAllCategories: vi.fn(),
}))

import { useTags } from './useTags'
import { getAllTags, getAllCategories } from '@/lib/cms/tags'

const mockGetAllTags       = vi.mocked(getAllTags)
const mockGetAllCategories = vi.mocked(getAllCategories)

const SAMPLE_TAGS       = [{ tag: 'ai', count: 5 }, { tag: 'typescript', count: 3 }]
const SAMPLE_CATEGORIES = [{ category: 'research', count: 4 }, { category: 'opinion', count: 2 }]

describe('useTags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in a loading state', () => {
    mockGetAllTags.mockResolvedValue(SAMPLE_TAGS)
    mockGetAllCategories.mockResolvedValue(SAMPLE_CATEGORIES)
    const { result } = renderHook(() => useTags())
    expect(result.current.loading).toBe(true)
    expect(result.current.tags).toEqual([])
    expect(result.current.categories).toEqual([])
  })

  it('resolves tags and categories after fetching', async () => {
    mockGetAllTags.mockResolvedValue(SAMPLE_TAGS)
    mockGetAllCategories.mockResolvedValue(SAMPLE_CATEGORIES)
    const { result } = renderHook(() => useTags())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tags).toEqual(SAMPLE_TAGS)
    expect(result.current.categories).toEqual(SAMPLE_CATEGORIES)
  })

  it('calls getAllTags and getAllCategories on mount', async () => {
    mockGetAllTags.mockResolvedValue([])
    mockGetAllCategories.mockResolvedValue([])
    renderHook(() => useTags())

    await waitFor(() => {
      expect(mockGetAllTags).toHaveBeenCalledTimes(1)
      expect(mockGetAllCategories).toHaveBeenCalledTimes(1)
    })
  })

  it('returns empty arrays when the API returns no data', async () => {
    mockGetAllTags.mockResolvedValue([])
    mockGetAllCategories.mockResolvedValue([])
    const { result } = renderHook(() => useTags())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tags).toEqual([])
    expect(result.current.categories).toEqual([])
  })
})
