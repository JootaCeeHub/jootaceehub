'use client'
// @deprecated — see ADR-008. Frozen: no new features. Removal: Phase 3.

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { onAuthStateChange, getSession } from './auth'

interface SupabaseAuthContextValue {
  user: User | null
  isLoading: boolean
  isConfigured: boolean
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  user: null,
  isLoading: true,
  isConfigured: false,
})

const IS_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(IS_CONFIGURED)

  useEffect(() => {
    if (!IS_CONFIGURED) return

    // Restore session immediately from storage
    getSession().then((session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Subscribe to auth state changes (token refresh, sign out, etc.)
    const unsub = onAuthStateChange((u) => {
      setUser(u)
      setIsLoading(false)
    })
    return unsub
  }, [])

  return (
    <SupabaseAuthContext.Provider value={{ user, isLoading, isConfigured: IS_CONFIGURED }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext)
}
