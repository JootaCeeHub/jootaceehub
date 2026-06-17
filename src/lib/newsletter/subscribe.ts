import { supabase } from '@/lib/supabase/client'
import type { NewsletterSubscriberRow, NewsletterSubscriberInsert, NewsletterSubscriberUpdate } from '@/lib/supabase/types'

export type SubscribeStatus = 'success' | 'already_subscribed' | 'error'

export interface SubscribeResult {
  status: SubscribeStatus
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// ── Main subscribe function ────────────────────────────────────────────────
export async function subscribe(
  email: string,
  source?: string
): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase()

  if (!EMAIL_RE.test(clean)) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }

  // Check if already subscribed
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', clean)
    .maybeSingle()

  if (existing) {
    const row = existing as Pick<NewsletterSubscriberRow, 'id' | 'status'>
    if (row.status === 'unsubscribed') {
      // Re-subscribe
      await supabase
        .from('newsletter_subscribers')
        .update({ status: 'pending' } as NewsletterSubscriberUpdate & Record<string, unknown>)
        .eq('id', row.id)
      await notifyResend(clean)
      return { status: 'success', message: 'Welcome back! Check your email to confirm.' }
    }
    return { status: 'already_subscribed', message: "You're already subscribed." }
  }

  // Insert new subscriber
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: clean, status: 'pending', source: source ?? 'website' } as NewsletterSubscriberInsert & Record<string, unknown>)

  if (error) {
    if (error.code === '23505') {
      return { status: 'already_subscribed', message: "You're already subscribed." }
    }
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }

  // Optionally forward to Resend audience
  await notifyResend(clean)

  return { status: 'success', message: 'Check your email to confirm your subscription!' }
}

// ── Unsubscribe ────────────────────────────────────────────────────────────
export async function unsubscribe(email: string): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase()
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed' })
    .eq('email', clean)

  if (error) return { status: 'error', message: 'Could not unsubscribe. Please try again.' }
  return { status: 'success', message: 'You have been unsubscribed.' }
}

// ── Resend integration (optional) ─────────────────────────────────────────
// Calls Resend's contacts API if NEXT_PUBLIC_RESEND_API_KEY is set.
// Use a "Manage Contacts" scoped API key — safe for NEXT_PUBLIC_ usage.
async function notifyResend(email: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY
  const audienceId = process.env.NEXT_PUBLIC_RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) return

  try {
    await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    })
  } catch {
    // Non-fatal — subscriber is in Supabase regardless
  }
}
