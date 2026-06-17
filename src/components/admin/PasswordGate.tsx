'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Terminal, ArrowRight, AlertTriangle, CheckCircle2, Lock, Loader2 } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'jootacee-admin-pass-v1'
const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 60

// ─── Crypto helpers ───────────────────────────────────────────────────────────

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function sessionGranted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function grantSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // ignore quota edge cases
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PasswordGateProps {
  children: React.ReactNode
  /** SHA-256 hex digest of the admin password (from NEXT_PUBLIC_ADMIN_PASS). */
  expectedHash: string
}

export default function PasswordGate({ children, expectedHash }: PasswordGateProps) {
  const [authed, setAuthed] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hydrate: check sessionStorage after mount
  useEffect(() => {
    if (sessionGranted()) {
      setAuthed(true)
    }
    setHydrated(true)
  }, [])

  // Lockout countdown ticker
  useEffect(() => {
    if (!lockedUntil) return
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setCountdown(0)
        setAttempts(0)
        setError(null)
        inputRef.current?.focus()
      } else {
        setCountdown(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || checking || lockedUntil) return

    setChecking(true)
    setError(null)

    try {
      const hash = await sha256Hex(value.trim())
      if (hash === expectedHash.toLowerCase()) {
        setSuccess(true)
        grantSession()
        // Brief visual confirmation before revealing the admin panel
        setTimeout(() => setAuthed(true), 600)
      } else {
        const next = attempts + 1
        setAttempts(next)
        setValue('')
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000)
          setError(null)
        } else {
          setError(`Invalid password. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? '' : 's'} remaining.`)
          inputRef.current?.focus()
        }
      }
    } finally {
      setChecking(false)
    }
  }, [value, checking, lockedUntil, expectedHash, attempts])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // Render nothing until hydrated to avoid SSR mismatch with sessionStorage
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060610] px-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
      </div>
    )
  }

  if (authed) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060610] px-4">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm" role="main">
        {/* Logo */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
            <Terminal className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">JootaCee OS</div>
            <div className="text-[10px] text-white/30 font-mono tracking-widest">Command Center v2.1</div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-white/90">Authentication Required</h1>
          <p className="text-xs text-white/35 font-mono">
            {lockedUntil
              ? `LOCKED — retry in ${countdown}s`
              : 'Enter admin password to continue'}
          </p>
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <label htmlFor="admin-password" className="flex items-center gap-1.5 text-[10px] font-mono text-white/25 tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
            PASSWORD
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 focus-within:border-cyan-500/30 focus-within:bg-white/[0.06] transition-colors">
            <span className="select-none font-mono text-sm text-cyan-400/70" aria-hidden>$</span>
            <input
              ref={inputRef}
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              disabled={!!lockedUntil || checking}
              placeholder={lockedUntil ? '••••••••' : 'Enter password'}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null) }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent font-mono text-sm text-white/90 outline-none placeholder:text-white/20"
              aria-label="Admin password"
              aria-describedby={error ? 'auth-error' : lockedUntil ? 'auth-lockout' : undefined}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!value.trim() || !!lockedUntil || checking}
            onClick={handleSubmit}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/40 disabled:pointer-events-none disabled:opacity-40"
            aria-busy={checking}
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            {checking ? 'Verifying…' : 'Authenticate'}
          </button>
        </div>

        {/* Feedback messages */}
        {success && (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400 font-mono" role="status">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            Access granted — loading…
          </div>
        )}
        {error && !lockedUntil && (
          <div id="auth-error" className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 font-mono" role="alert">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {error}
          </div>
        )}
        {lockedUntil && (
          <div id="auth-lockout" className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400 font-mono" role="alert">
            <Lock className="h-3 w-3 shrink-0" />
            Too many failed attempts. Locked for {countdown}s.
          </div>
        )}

        <div className="my-4 border-t border-white/[0.06]" />
        <p className="text-center text-[10px] text-white/15 font-mono">
          Set NEXT_PUBLIC_ADMIN_PASS in .env.local to configure this gate.
        </p>
      </div>
    </div>
  )
}
