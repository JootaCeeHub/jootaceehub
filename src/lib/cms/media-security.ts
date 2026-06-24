/**
 * Media security utilities for static-export CMS.
 * No server uploads — only external URLs. Security = URL validation + domain allowlist.
 */

// Allowed image/document CDN domains (extend as needed)
const ALLOWED_DOMAINS = new Set([
  'github.com',
  'raw.githubusercontent.com',
  'githubusercontent.com',
  'user-images.githubusercontent.com',
  'avatars.githubusercontent.com',
  'images.unsplash.com',
  'cdn.jsdelivr.net',
  'cloudflare-ipfs.com',
  'ipfs.io',
  'res.cloudinary.com',
  'i.imgur.com',
  'imgur.com',
  'cdn.discordapp.com',
  'media.licdn.com',
  'jootacee.com',
  'jootaceehub.pages.dev',
])

const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf', 'application/json']

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', ico: 'image/x-icon',
  mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg',
  pdf: 'application/pdf',
}

const MAX_ALT_LENGTH = 200
const MAX_URL_LENGTH = 2048
const MAX_CAPTION_LENGTH = 500

export interface UrlValidationResult {
  valid: boolean
  error?: string
  mimeType?: string
  domain?: string
}

/** Validate a media URL for security and format correctness. */
export function validateMediaUrl(raw: string): UrlValidationResult {
  const url = raw.trim()

  if (!url) return { valid: false, error: 'URL is required' }
  if (url.length > MAX_URL_LENGTH) return { valid: false, error: `URL too long (max ${MAX_URL_LENGTH} chars)` }

  // Must be https
  if (!url.startsWith('https://')) {
    return { valid: false, error: 'Only HTTPS URLs are allowed' }
  }

  // Reject data: URLs (XSS vector)
  if (url.startsWith('data:')) return { valid: false, error: 'data: URLs are not allowed' }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  // Block localhost / private IPs
  const host = parsed.hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.16.') ||
    host.endsWith('.local')
  ) {
    return { valid: false, error: 'Local/private network URLs are not allowed' }
  }

  // Check domain allowlist
  const isAllowed = Array.from(ALLOWED_DOMAINS).some(d => host === d || host.endsWith(`.${d}`))
  if (!isAllowed) {
    return {
      valid: false,
      error: `Domain "${host}" is not in the allowlist. Add it in media-security.ts if trusted.`,
    }
  }

  // Detect MIME from extension
  const ext = parsed.pathname.split('.').pop()?.toLowerCase() ?? ''
  const mimeType = EXTENSION_MIME[ext] ?? 'application/octet-stream'

  const isAllowedMime = ALLOWED_MIME_PREFIXES.some(p => mimeType.startsWith(p))
  if (!isAllowedMime && ext) {
    return { valid: false, error: `File type ".${ext}" is not allowed` }
  }

  return { valid: true, mimeType, domain: host }
}

/** Sanitize alt text — strip HTML tags and control chars. */
export function sanitizeAlt(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')         // strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, MAX_ALT_LENGTH)
}

/** Sanitize caption text. */
export function sanitizeCaption(raw: string): string {
  return raw
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // strip scripts
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, MAX_CAPTION_LENGTH)
}

/** Infer MediaSource from URL. */
export function inferSource(url: string): 'github' | 'external' {
  if (url.includes('github') || url.includes('githubusercontent')) return 'github'
  return 'external'
}

/** Exposed domain allowlist for UI display. */
export const ALLOWED_DOMAINS_LIST = Array.from(ALLOWED_DOMAINS).sort()
