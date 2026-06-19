export type AuthMode = 'google' | 'password' | 'open'

const HAS_GOOGLE_CLIENT = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
const ADMIN_PASS_HASH   = (process.env.NEXT_PUBLIC_ADMIN_PASS ?? '').trim().toLowerCase()
const HAS_PASSWORD_GATE = ADMIN_PASS_HASH.length === 64

export function detectAuthMode(): AuthMode {
  if (HAS_GOOGLE_CLIENT) return 'google'
  if (HAS_PASSWORD_GATE) return 'password'
  return 'open'
}

export function getAuthConfig() {
  return {
    mode:          detectAuthMode(),
    passwordHash:  ADMIN_PASS_HASH,
  }
}
