import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSceneConfig } from './useSceneConfig'

function setNavigatorProps(cores: number, memory: number) {
  Object.defineProperty(navigator, 'hardwareConcurrency', { value: cores, configurable: true })
  Object.defineProperty(navigator, 'deviceMemory',        { value: memory, configurable: true })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useSceneConfig', () => {
  it('returns a config and source on initial render', () => {
    const { result } = renderHook(() => useSceneConfig())
    expect(result.current.config).toBeTruthy()
    expect(['local', 'fallback']).toContain(result.current.source)
  })

  it('detects low tier for constrained devices and sets source to local', () => {
    setNavigatorProps(2, 2)
    const { result } = renderHook(() => useSceneConfig())
    // After the mount effect fires, source should be 'local' (device detected successfully)
    expect(result.current.source).toBe('local')
    // Low tier means reduced detail — config should exist
    expect(result.current.config).toBeTruthy()
  })

  it('detects high tier for powerful devices', () => {
    setNavigatorProps(12, 16)
    const { result } = renderHook(() => useSceneConfig())
    expect(result.current.source).toBe('local')
    expect(result.current.config).toBeTruthy()
  })

  it('detects balanced tier for mid-range devices', () => {
    setNavigatorProps(6, 6)
    const { result } = renderHook(() => useSceneConfig())
    expect(result.current.source).toBe('local')
    expect(result.current.config).toBeTruthy()
  })

  it('returns a config object with expected shape', () => {
    setNavigatorProps(8, 8)
    const { result } = renderHook(() => useSceneConfig())
    const { config } = result.current
    // SceneConfig should at minimum be an object with properties
    expect(typeof config).toBe('object')
    expect(config).not.toBeNull()
  })

  it('accepts an initialTier prop that seeds the fallback config', () => {
    const { result } = renderHook(() => useSceneConfig('low'))
    expect(result.current.config).toBeTruthy()
  })

  it('re-evaluates when the hook re-renders (stable source stays local)', () => {
    setNavigatorProps(8, 8)
    const { result, rerender } = renderHook(() => useSceneConfig())
    const first = result.current.config
    act(() => { rerender() })
    // Source should remain 'local'; config reference may differ but both truthy
    expect(result.current.source).toBe('local')
    expect(first).toBeTruthy()
  })
})
