import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { fetchGitHubIntelligence } from '@/lib/github/api'
import { useGitHubIntelligence } from './useGitHubIntelligence'

const mockLiveData = {
  source: 'live' as const,
  revision: 'live-2026-05-30',
  generatedAt: '2026-05-30T00:00:00.000Z',
  profile: { username: 'JootaCee', displayName: 'JootaCee', bio: '', location: '', url: '', avatarUrl: '', followers: 0, following: 0, publicRepos: 0 },
  repositories: [],
  totalStars: 100,
  totalForks: 20,
  commitsLast30d: 50,
  recentReleases: [],
  deployments: [],
  activity: [],
}

vi.mock('@/lib/github/api', () => ({
  fetchGitHubIntelligence: vi.fn(),
}))

vi.mock('@/lib/github/mock', () => ({
  mockGitHubIntelligence: {
    source: 'mock' as const,
    revision: 'mock-fallback',
    generatedAt: '2026-05-28T00:00:00.000Z',
    repositories: [],
    totalStars: 0,
    totalForks: 0,
    commitsLast30d: 0,
    recentReleases: [],
    deployments: [],
    activity: [],
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useGitHubIntelligence', () => {
  it('starts with null data, loading=true, source=loading', () => {
    // Never resolves — simulates a pending fetch
    vi.mocked(fetchGitHubIntelligence).mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useGitHubIntelligence())

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.source).toBe('loading')
    expect(result.current.error).toBeNull()
  })

  it('sets data to live result when API succeeds', async () => {
    vi.mocked(fetchGitHubIntelligence).mockResolvedValue(mockLiveData)

    const { result } = renderHook(() => useGitHubIntelligence())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data?.source).toBe('live')
    expect(result.current.source).toBe('live')
    expect(result.current.error).toBeNull()
  })

  it('falls back to mock data when API throws', async () => {
    vi.mocked(fetchGitHubIntelligence).mockRejectedValue(new Error('rate limited'))

    const { result } = renderHook(() => useGitHubIntelligence())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.source).toBe('fallback')
    expect(result.current.error).toContain('rate limited')
    expect(result.current.data).not.toBeNull()
  })

  it('stores the error message when API fails', async () => {
    vi.mocked(fetchGitHubIntelligence).mockRejectedValue(new Error('GitHub API 403 for /users/X'))

    const { result } = renderHook(() => useGitHubIntelligence())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toMatch(/403/)
  })

  it('sets loading to false after successful fetch', async () => {
    vi.mocked(fetchGitHubIntelligence).mockResolvedValue(mockLiveData)

    const { result } = renderHook(() => useGitHubIntelligence())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.loading).toBe(false)
  })

  it('sets loading to false even when API fails', async () => {
    vi.mocked(fetchGitHubIntelligence).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useGitHubIntelligence())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.loading).toBe(false)
  })
})
