'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'jootacee-admin-auth-v1'

export interface AuthUser {
  id: string
  name: string
  email: string
  picture: string
  credential: string
  expiresAt: number
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  signIn: (credential: string) => void
  signInAnonymous: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJwt(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1]
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof window !== 'undefined'
      ? atob(padded)
      : Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return {}
  }
}

function loadStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user: AuthUser = JSON.parse(raw)
    if (Date.now() / 1000 > user.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(loadStoredUser())
    setIsLoading(false)
  }, [])

  const signIn = useCallback((credential: string) => {
    const payload = decodeJwt(credential)
    const authUser: AuthUser = {
      id: String(payload.sub ?? ''),
      name: String(payload.name ?? ''),
      email: String(payload.email ?? ''),
      picture: String(payload.picture ?? ''),
      credential,
      expiresAt: Number(payload.exp ?? 0),
    }
    setUser(authUser)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    } catch {
      // ignore quota errors
    }
  }, [])

  const signInAnonymous = useCallback(() => {
    const anonUser: AuthUser = {
      id: 'local',
      name: 'Local Admin',
      email: '',
      picture: '',
      credential: '',
      expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30,
    }
    setUser(anonUser)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(anonUser))
    } catch {
      // ignore
    }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signInAnonymous, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
