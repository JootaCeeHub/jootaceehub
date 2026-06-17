'use client'

import React, { useState } from 'react'
import { signInWithEmail, resetPassword } from '@/lib/supabase/auth'
type Mode = 'login' | 'reset'

export default function SupabaseLoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await signInWithEmail(email, password)
    if (authError) {
      setError(authError.message)
    }
    // On success, SupabaseAuthProvider will update user state automatically
    setLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error: resetError } = await resetPassword(email)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess('Check your email for a password reset link.')
    }
    setLoading(false)
  }

  const inputBase = 'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-colors'
  const inputErr = 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 text-xl">⚡</div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-white/40">
            {mode === 'login' ? 'Sign in to continue' : 'Reset your password'}
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={mode === 'login' ? handleLogin : handleReset}
        >
          <div className="space-y-1.5">
            <label htmlFor="sb-email" className="block text-xs font-medium tracking-wider text-white/50 uppercase">Email</label>
            <input
              id="sb-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className={`${inputBase} ${error ? inputErr : ''}`}
            />
          </div>

          {mode === 'login' && (
            <div className="space-y-1.5">
              <label htmlFor="sb-password" className="block text-xs font-medium tracking-wider text-white/50 uppercase">Password</label>
              <div className="relative">
                <input
                  id="sb-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputBase} pr-10 ${error ? inputErr : ''}`}
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/8 px-3.5 py-2.5 text-sm text-red-400">{error}</p>}
          {success && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3.5 py-2.5 text-sm text-emerald-400">{success}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {mode === 'login' ? 'Sign in' : 'Send reset link'}
          </button>
        </form>

        <div className="my-2 flex items-center gap-3">
          <span className="flex-1 border-t border-white/8" />
          <span className="text-xs text-white/25">or</span>
          <span className="flex-1 border-t border-white/8" />
        </div>

        <button
          type="button"
          className="text-center text-xs text-white/30 hover:text-rose-400 transition-colors cursor-pointer w-full"
          onClick={() => {
            setMode(mode === 'login' ? 'reset' : 'login')
            setError(null)
            setSuccess(null)
          }}
        >
          {mode === 'login' ? 'Forgot password?' : '← Back to sign in'}
        </button>
      </div>
    </div>
  )
}
