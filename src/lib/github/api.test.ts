import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock localStorage
const storage: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v },
  removeItem: (k: string) => { delete storage[k] },
  clear: () => { for (const k in storage) delete storage[k] },
}
vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('window', { localStorage: localStorageMock })

const CACHE_KEY = 'jootacee-github-v1'

const MOCK_PROFILE = { login: 'JootaCee', name: 'Joo', bio: 'dev', location: 'EU', html_url: 'https://g', avatar_url: 'https://g.png', followers: 10, following: 5, public_repos: 3 }
const MOCK_REPOS = [
  { name: 'repo-a', description: 'desc a', stargazers_count: 10, forks_count: 2, language: 'TypeScript', status: 'active', pushed_at: new Date().toISOString(), html_url: 'https://g/a' },
  { name: 'repo-b', description: 'desc b', stargazers_count: 5,  forks_count: 1, language: 'Python',     status: 'active', pushed_at: new Date().toISOString(), html_url: 'https://g/b' },
]
const MOCK_EVENTS = [
  { type: 'PushEvent', created_at: new Date().toISOString(), payload: { commits: [{ sha: 'abc' }, { sha: 'def' }] } },
  { type: 'IssuesEvent', created_at: new Date().toISOString() }, // should be ignored
]

function setupFetch() {
  let callCount = 0
  const responses = [MOCK_PROFILE, MOCK_REPOS, MOCK_EVENTS]
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
    const body = responses[callCount++]
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(body),
    })
  }))
}

beforeEach(() => {
  localStorageMock.clear()
  vi.unstubAllGlobals()
  vi.stubGlobal('localStorage', localStorageMock)
  vi.stubGlobal('window', { localStorage: localStorageMock })
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('fetchGitHubIntelligence', () => {
  it('fetches profile, repos, and events in parallel', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    const result = await fetchGitHubIntelligence('JootaCee')

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(result.source).toBe('live')
    expect(result.profile?.username).toBe('JootaCee')
    expect(result.repositories).toHaveLength(2)
    expect(result.totalStars).toBe(15)
    expect(result.totalForks).toBe(3)
  })

  it('counts commits from PushEvents', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    const result = await fetchGitHubIntelligence('JootaCee')
    // MOCK_EVENTS has 1 PushEvent with 2 commits
    expect(result.commitsLast30d).toBe(2)
  })

  it('ignores non-PushEvent events in activity', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    const result = await fetchGitHubIntelligence('JootaCee')
    // Only 1 day has commits (from 1 PushEvent)
    expect(result.activity).toHaveLength(1)
  })

  it('saves result to localStorage cache', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    await fetchGitHubIntelligence('JootaCee')

    const cached = localStorage.getItem(CACHE_KEY)
    expect(cached).not.toBeNull()
    const entry = JSON.parse(cached!)
    expect(entry.data.source).toBe('live')
    expect(typeof entry.cachedAt).toBe('number')
  })

  it('returns cached data without calling fetch when cache is fresh', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')

    // First call — populates cache
    await fetchGitHubIntelligence('JootaCee')
    vi.clearAllMocks()
    setupFetch()

    // Second call — should use cache
    await fetchGitHubIntelligence('JootaCee')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('fetches fresh data when cache is expired (TTL exceeded)', async () => {
    // Pre-populate an expired cache entry
    const expiredEntry = {
      data: { source: 'live', profile: { username: 'old' }, repositories: [], totalStars: 0, totalForks: 0, commitsLast30d: 0, recentReleases: [], deployments: [], activity: [] },
      cachedAt: Date.now() - 2 * 60 * 60 * 1000, // 2h ago — exceeds 1h TTL
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(expiredEntry))

    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    const result = await fetchGitHubIntelligence('JootaCee')

    expect(fetch).toHaveBeenCalled()
    expect(result.profile?.username).toBe('JootaCee') // fresh data
  })

  it('uses correct Accept and API version headers', async () => {
    setupFetch()
    const { fetchGitHubIntelligence } = await import('./api')
    await fetchGitHubIntelligence('JootaCee')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    const headers = options?.headers as Record<string, string>
    expect(headers?.Accept).toBe('application/vnd.github.v3+json')
    expect(headers?.['X-GitHub-Api-Version']).toBe('2022-11-28')
  })

  it('throws when GitHub API returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    }))
    const { fetchGitHubIntelligence } = await import('./api')
    await expect(fetchGitHubIntelligence('JootaCee')).rejects.toThrow('403')
  })
})
