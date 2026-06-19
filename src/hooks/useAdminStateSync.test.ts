import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAdminStateSync } from './useAdminStateSync'

// Supabase sync removed per ADR-008. Hook is now a no-op.
// Tests verify the hook mounts cleanly and returns undefined.

describe('useAdminStateSync', () => {
  it('mounts without error', () => {
    expect(() => renderHook(() => useAdminStateSync())).not.toThrow()
  })

  it('returns undefined (no-op)', () => {
    const { result } = renderHook(() => useAdminStateSync())
    expect(result.current).toBeUndefined()
  })
})
