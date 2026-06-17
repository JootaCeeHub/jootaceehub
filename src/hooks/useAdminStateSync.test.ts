import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// ── Module mocks (hoisted before imports) ─────────────────────────────────
vi.mock('@/lib/supabase/context', () => ({
  useSupabaseAuth: vi.fn(),
}))

vi.mock('@/lib/admin/store', () => ({
  useAdmin: vi.fn(),
}))

// supabase client is already mocked in src/test/setup.ts

import { useAdminStateSync } from './useAdminStateSync'
import { useSupabaseAuth } from '@/lib/supabase/context'
import { useAdmin }        from '@/lib/admin/store'

const mockUseSupabaseAuth = vi.mocked(useSupabaseAuth)
const mockUseAdmin        = vi.mocked(useAdmin)

const mockImportJSON = vi.fn()

function configureAuth(options: { configured?: boolean; userId?: string } = {}) {
  const { configured = true, userId = 'user-1' } = options
  mockUseSupabaseAuth.mockReturnValue({
    isConfigured: configured,
    user: configured ? ({ id: userId } as ReturnType<typeof useSupabaseAuth>['user']) : null,
    session: null,
    isLoading: false,
  } as ReturnType<typeof useSupabaseAuth>)
}

function configureAdmin(unsaved = false) {
  mockUseAdmin.mockReturnValue({
    state:      { unsaved } as ReturnType<typeof useAdmin>['state'],
    importJSON: mockImportJSON,
    dispatch:   vi.fn(),
  } as unknown as ReturnType<typeof useAdmin>)
}

describe('useAdminStateSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does nothing when Supabase is not configured', () => {
    configureAuth({ configured: false })
    configureAdmin(false)
    const { result } = renderHook(() => useAdminStateSync())
    // Hook returns nothing — just confirm it mounts without throwing
    expect(result.current).toBeUndefined()
  })

  it('mounts without error when configured and state is clean', () => {
    configureAuth()
    configureAdmin(false)
    expect(() => renderHook(() => useAdminStateSync())).not.toThrow()
  })

  it('clears the debounce timer on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    configureAuth()
    configureAdmin(true)
    const { unmount } = renderHook(() => useAdminStateSync())
    unmount()
    // clearTimeout should have been called during cleanup
    expect(clearSpy).toHaveBeenCalled()
  })

  it('does not call importJSON when remote load returns null (no saved config)', async () => {
    // supabase mock in setup.ts returns { data: null, error: null }
    configureAuth()
    configureAdmin(false)
    renderHook(() => useAdminStateSync())
    // Let async effects settle
    await vi.runAllTimersAsync()
    expect(mockImportJSON).not.toHaveBeenCalled()
  })
})
