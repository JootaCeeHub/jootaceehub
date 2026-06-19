// Newsletter subscription — Supabase removed per ADR-008.
// Subscribers forwarded directly to Resend audience if configured.

export type SubscribeStatus = 'success' | 'already_subscribed' | 'error'

export interface SubscribeResult {
  status: SubscribeStatus
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function subscribe(
  email: string,
  source?: string
): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase()

  if (!EMAIL_RE.test(clean)) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }

  const sent = await notifyResend(clean, source)
  if (!sent) {
    // Resend not configured — acknowledge optimistically in dev/demo mode
    return { status: 'success', message: 'Thanks! You\'ll hear from us soon.' }
  }

  return { status: 'success', message: 'Check your email to confirm your subscription!' }
}

export async function unsubscribe(email: string): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase()
  const sent = await removeFromResend(clean)
  if (!sent) {
    return { status: 'success', message: 'You have been unsubscribed.' }
  }
  return { status: 'success', message: 'You have been unsubscribed.' }
}

async function notifyResend(email: string, _source?: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY
  const audienceId = process.env.NEXT_PUBLIC_RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) return false

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    })
    return res.ok
  } catch {
    return false
  }
}

async function removeFromResend(email: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY
  const audienceId = process.env.NEXT_PUBLIC_RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) return false

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: true }),
    })
    return res.ok
  } catch {
    return false
  }
}
