'use client'

import { useAuth } from '@/lib/auth/context'
import { useSupabaseAuth } from '@/lib/supabase/context'
import AdminLogin from './AdminLogin'
import PasswordGate from './PasswordGate'
import SupabaseLoginForm from './SupabaseLoginForm'
// ─── Auth mode resolution ──────────────────────────────────────────────────
// Priority:
//   0. NEXT_PUBLIC_SUPABASE_URL set → Supabase email/password (server-validated via RLS)
//   1. NEXT_PUBLIC_GOOGLE_CLIENT_ID set → Google OAuth gate
//   2. NEXT_PUBLIC_ADMIN_PASS set (SHA-256 hex) → password gate
//   3. Neither → open access (dev / self-hosted)

const HAS_SUPABASE      = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const HAS_GOOGLE_CLIENT = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
const ADMIN_PASS_HASH   = (process.env.NEXT_PUBLIC_ADMIN_PASS ?? '').trim().toLowerCase()
const HAS_PASSWORD_GATE = ADMIN_PASS_HASH.length === 64

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user: legacyUser, isLoading: legacyLoading } = useAuth()
  const { user: supaUser, isLoading: supaLoading } = useSupabaseAuth()

  // ── Mode 0: Supabase ───────────────────────────────────────────────────────
  if (HAS_SUPABASE) {
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
  if (HAS_GOOGLE_CLIENT) {
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
  if (HAS_PASSWORD_GATE) {
    return (
      <PasswordGate expectedHash={ADMIN_PASS_HASH}>
        {children}
      </PasswordGate>
    )
  }

  // ── Mode 3: Open access ────────────────────────────────────────────────────
  return <>{children}</>
}
