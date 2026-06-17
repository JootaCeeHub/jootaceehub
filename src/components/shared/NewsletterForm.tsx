'use client'

import React, { useState } from 'react'
import { subscribe } from '@/lib/newsletter/subscribe'

export interface NewsletterFormProps {
  variant?: 'inline' | 'card'
  source?: string
  placeholder?: string
  label?: string
  title?: string
  subtitle?: string
  disclaimer?: string
}

export function NewsletterForm({
  variant = 'inline',
  source = 'website',
  placeholder = 'your@email.com',
  label,
  title = 'Stay in the loop',
  subtitle = 'Get notified when new articles on AI systems and autonomous infrastructure drop.',
  disclaimer = 'No spam. Unsubscribe any time.',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')

    const result = await subscribe(email.trim(), source)
    setMessage(result.message)
    if (result.status === 'success') setStatus('success')
    else if (result.status === 'already_subscribed') setStatus('already')
    else setStatus('error')
  }

  const form = (
    <form onSubmit={handleSubmit} noValidate>
      {label && (
        <label htmlFor="newsletter-email" className="mb-2 block text-xs font-medium text-white/50">{label}</label>
      )}
      {status === 'success' ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
          <span className="flex-none text-base">✓</span>
          {message}
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/15 transition-colors"
              disabled={status === 'loading'}
              aria-label="Email address for newsletter"
              required
            />
            <button
              type="submit"
              disabled={!email.trim() || status === 'loading'}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && <p className="mt-2 text-xs text-red-400">{message}</p>}
          {status === 'already' && <p className="mt-2 text-xs text-white/40">{message}</p>}
          <p className="mt-2 text-[10px] text-white/20 leading-relaxed">{disclaimer}</p>
        </>
      )}
    </form>
  )

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/2 p-6 backdrop-blur-sm">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/8 px-2.5 py-1 text-[10px] font-medium text-rose-400">
          <span aria-hidden="true">✉</span> Newsletter
        </div>
        <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
        <p className="mb-4 text-xs text-white/40 leading-relaxed">{subtitle}</p>
        {form}
      </div>
    )
  }

  return <div className="w-full">{form}</div>
}
