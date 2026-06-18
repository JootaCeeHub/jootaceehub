'use client'

import { useAuth } from '@/lib/auth/context'
import { useSupabaseAuth } from '@/lib/supabase/context'
import { getAuthConfig } from '@/lib/auth/strategy'
import AdminLogin from './AdminLogin'
import PasswordGate from './PasswordGate'
import SupabaseLoginForm from './SupabaseLoginForm'

const { mode: AUTH_MODE, passwordHash: ADMIN_PASS_HASH } = getAuthConfig()

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user: legacyUser, isLoading: legacyLoading } = useAuth()
  const { user: supaUser, isLoading: supaLoading } = useSupabaseAuth()

  // ── Mode 0: Supabase ───────────────────────────────────────────────────────
  if (AUTH_MODE === 'supabase') {
    if (supaLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#060610]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
        </div>
      )
    }
    if (!supaUser) return <SupabaseLoginForm />
    return <>{children}</>
  }

  // ── Mode 1: Google OAuth ───────────────────────────────────────────────────
  if (AUTH_MODE === 'google') {
    if (legacyLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#060610]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
        </div>
      )
    }
    if (!legacyUser) return <AdminLogin />
    return <>{children}</>
  }

  // ── Mode 2: Password gate ──────────────────────────────────────────────────
  if (AUTH_MODE === 'password') {
    return (
      <PasswordGate expectedHash={ADMIN_PASS_HASH}>
        {children}
      </PasswordGate>
    )
  }

  // ── Mode 3: Open access ────────────────────────────────────────────────────
  // Production build without any auth configured → hard block to prevent
  // accidental exposure of the admin dashboard on public deployments.
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#060610] p-8 text-center">
        <div className="max-w-sm rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-left space-y-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-red-400/80">⚠ Unprotected deployment</div>
          <p className="text-sm text-white/70 leading-relaxed">
            Admin is deployed without authentication. Configure one of these before redeploying:
          </p>
          <ul className="space-y-1 text-xs text-white/40 font-mono">
            <li><span className="text-cyan-400">NEXT_PUBLIC_SUPABASE_URL</span> — Supabase auth</li>
            <li><span className="text-cyan-400">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span> — Google OAuth</li>
            <li><span className="text-cyan-400">NEXT_PUBLIC_ADMIN_PASS</span> — SHA-256 password hash</li>
          </ul>
          <p className="text-[10px] text-white/25">See .env.example for setup instructions.</p>
        </div>
      </div>
    )
  }

  // Development: allow access, warn via console only (non-intrusive)
  return <>{children}</>
}
