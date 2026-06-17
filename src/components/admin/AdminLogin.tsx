'use client'

import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Zap, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
export default function AdminLogin() {
  const { signIn, signInAnonymous } = useAuth()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060610] px-4">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-60 left-1/4 h-[700px] w-[700px] rounded-full bg-cyan-500/4 blur-[180px]" />
        <div className="absolute bottom-0 right-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/4 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/[0.025] p-8 shadow-2xl shadow-black/60 backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
            <Zap className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/80">JootaCee OS</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">Command Center v2.1</div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-1 text-center text-xl font-semibold tracking-tight text-white/90">Access Required</h1>
        <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-white/30">Authorized personnel only</p>

        {/* Divider */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <ShieldCheck className="h-3.5 w-3.5 text-white/20 shrink-0" />
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Google Sign-In */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(response) => {
              if (response.credential) {
                signIn(response.credential)
              }
            }}
            onError={() => {
              setError('Authentication failed. Please try again.')
            }}
            theme="filled_black"
            shape="pill"
            size="large"
            text="signin_with"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/8 px-3 py-2 text-center font-mono text-[10px] text-red-400">
            {error}
          </div>
        )}

        {/* Skip login */}
        <button onClick={signInAnonymous} className="mt-4 w-full text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/25 transition-colors hover:text-white/50 cursor-pointer">
          Continuar sin iniciar sesión →
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20">
            Secured by{' '}
            <span className="text-cyan-400/50">Google Identity Services</span>
          </p>
        </div>
      </div>
    </div>
  )
}
