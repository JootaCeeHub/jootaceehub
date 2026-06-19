import type { Context } from 'hono'

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

export interface Env {
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  ADMIN_PASSWORD_HASH: string
  REPO_ROOT: string
  CONTENT_ROOT: string
  MEDIA_ROOT: string
  GIT_USER_NAME: string
  GIT_USER_EMAIL: string
  GIT_REMOTE: string
  GIT_BRANCH: string
  DIST_BLUE: string
  DIST_GREEN: string
  NGINX_ROOT: string
  AUDIT_LOG_PATH: string
  PORT: number
  CORS_ORIGIN: string
  MEDIA_MAX_SIZE_MB: number
}

// ---------------------------------------------------------------------------
// Hono bindings
// ---------------------------------------------------------------------------

export interface HonoBindings {
  env: Env
}

export interface HonoVariables {
  actor: string
}

export type HonoEnv = {
  Bindings: HonoBindings
  Variables: HonoVariables
}

// Convenience alias so routes can type their context
export type AppContext = Context<HonoEnv>

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------

export interface JWTPayload {
  sub: string
  iat: number
  exp: number
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export interface AuditEntry {
  id: string
  ts: string        // ISO-8601
  actor: string
  action: string
  resource: string
  detail: string
  ip: string
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export type BuildStatus = 'queued' | 'building' | 'done' | 'failed'

export interface BuildJob {
  id: string
  ts: string        // queued ISO timestamp
  reason: string
  status: BuildStatus
  startedAt: string | null
  completedAt: string | null
  exitCode: number | null
  log: string[]
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export type ContentType =
  | 'systems'
  | 'labs'
  | 'projects'
  | 'research'
  | 'resources'
  | 'taxonomies'
  | 'articles'
  | 'collections'

export const CONTENT_TYPES: ContentType[] = [
  'systems',
  'labs',
  'projects',
  'research',
  'resources',
  'taxonomies',
  'articles',
  'collections',
]

// MDX-based content types (stored as .mdx files)
export const MDX_TYPES: ContentType[] = ['articles', 'research']

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: Record<string, unknown>
}
