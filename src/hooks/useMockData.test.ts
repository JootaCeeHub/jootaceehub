import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMockData } from './useMockData'

describe('useMockData', () => {
  it('returns initial data from factory immediately', () => {
    const factory = vi.fn(() => ({ id: 1, name: 'test' }))
    const { result } = renderHook(() => useMockData(factory))

    expect(result.current.data).toEqual({ id: 1, name: 'test' })
    expect(result.current.source).toBe('static')
  })

  it('re-runs factory in useEffect', async () => {
    let counter = 0
    const factory = vi.fn(() => {
      counter += 1
      return { count: counter }
    })

    const { result } = renderHook(() => useMockData(factory))

    await waitFor(() => {
      expect(result.current.data.count).toBe(2)
    })
  })

  it('works with arrays', () => {
    const factory = () => [1, 2, 3]
    const { result } = renderHook(() => useMockData(factory))
    expect(result.current.data).toEqual([1, 2, 3])
  })
})
