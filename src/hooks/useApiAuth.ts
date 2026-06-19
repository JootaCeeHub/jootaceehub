'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from 'react'
import { getToken, clearToken, isTokenExpired, isApiConfigured } from '@/lib/api/client'
import { apiLogin, apiLogout, apiHealth, apiMe } from '@/lib/api/auth'
import type { AuthMeData, HealthData } from '@/lib/api/types'

export type ApiAuthState = 'unconfigured' | 'unauthenticated' | 'authenticating' | 'authenticated' | 'error'

export interface UseApiAuth {
  state: ApiAuthState
  me: AuthMeData | null
  health: HealthData | null
  error: string | null
  login: (password: string) => Promise<boolean>
  logout: () => void
  refresh: () => Promise<void>
}

export function useApiAuth(): UseApiAuth {
  const [authState, setAuthState] = useState<ApiAuthState>(() =>
    !isApiConfigured() ? 'unconfigured' : 'unauthenticated',
  )
  const [me, setMe] = useState<AuthMeData | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isApiConfigured()) {
      setAuthState('unconfigured')
      return
    }

    // Check health (no auth needed)
    try {
      const h = await apiHealth()
      if (h.success && h.data) setHealth(h.data)
    } catch {
      setHealth(null)
    }

    // Check existing token
    if (!getToken() || isTokenExpired()) {
      clearToken()
      setAuthState('unauthenticated')
      setMe(null)
      return
    }

    try {
      const m = await apiMe()
      if (m.success && m.data) {
        setMe(m.data)
        setAuthState('authenticated')
      } else {
        clearToken()
        setAuthState('unauthenticated')
        setMe(null)
      }
    } catch {
      clearToken()
      setAuthState('unauthenticated')
      setMe(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (password: string): Promise<boolean> => {
    setAuthState('authenticating')
    setError(null)
    try {
      const res = await apiLogin(password)
      if (res.success) {
        await refresh()
        return true
      }
      setError(res.error ?? 'Login failed')
      setAuthState('unauthenticated')
      return false
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      setError(msg)
      setAuthState('error')
      return false
    }
  }, [refresh])

  const logout = useCallback(() => {
    void apiLogout()
    setAuthState('unauthenticated')
    setMe(null)
    setError(null)
  }, [])

  return { state: authState, me, health, error, login, logout, refresh }
}
