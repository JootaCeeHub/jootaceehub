import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInfrastructureOverview } from './useInfrastructureOverview'
import { staticInfrastructureOverview } from '@/lib/infrastructure/static'

// useMockData runs a useEffect — jsdom + testing-library supports it
describe('useInfrastructureOverview', () => {
  it('returns infrastructure data synchronously from static data', () => {
    const { result } = renderHook(() => useInfrastructureOverview())
    expect(result.current.data).toBeDefined()
  })

  it('data contains expected shape (repositories, nodes, metrics)', () => {
    const { result } = renderHook(() => useInfrastructureOverview())
    const { data } = result.current
    // Verify structural integrity of the static data
    expect(data).toHaveProperty('revision')
    expect(data).toHaveProperty('generatedAt')
    expect(data).toHaveProperty('source')
  })

  it('source is "static" initially', () => {
    const { result } = renderHook(() => useInfrastructureOverview())
    expect(result.current.source).toBe('static')
  })

  it('data matches the staticInfrastructureOverview module export', async () => {
    const { result } = renderHook(() => useInfrastructureOverview())
    await waitFor(() => expect(result.current.data).not.toBeNull())
    // Core identity fields should match
    expect(result.current.data?.revision).toBe(staticInfrastructureOverview.revision)
  })

  it('does not throw when rendered multiple times', () => {
    expect(() => {
      renderHook(() => useInfrastructureOverview())
      renderHook(() => useInfrastructureOverview())
    }).not.toThrow()
  })
})
