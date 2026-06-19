/**
 * Client-side types matching the VPS Content API response shapes.
 * Mirrors api/src/types.ts but without Node.js dependencies.
 */

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: Record<string, unknown>
}

export interface AuthTokenData {
  token: string
  expiresAt: string | null
}

export interface AuthMeData {
  sub: string
  iat: number
  exp: number
  expiresAt: string
}

export interface HealthData {
  status: 'ok'
  version: string
  buildId: string
  uptime: number
}

export interface ContentFileMeta {
  type: string
  slug: string
  path: string
  size: number
  lastModified: string
  format: 'json' | 'mdx'
}

export interface WriteResult {
  path: string
  size: number
  checksum: string
}

export interface GitLogEntry {
  hash: string
  shortHash: string
  message: string
  author: string
  email: string
  date: string
  filesChanged: string[]
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: string[]
  unstaged: string[]
  untracked: string[]
}

export interface CommitResult {
  hash: string
  message: string
  filesChanged: string[]
}

export interface RollbackResult {
  revertHash: string
  originalHash: string
}

export interface MediaUploadResult {
  url: string
  width: number
  height: number
  size: number
  checksum: string
  alt: string
}

export interface MediaFileMeta {
  path: string
  url: string
  size: number
  lastModified: string
}

export type BuildStatus = 'queued' | 'building' | 'done' | 'failed'

export interface BuildJob {
  id: string
  ts: string
  reason: string
  status: BuildStatus
  startedAt: string | null
  completedAt: string | null
  exitCode: number | null
  log: string[]
}

export interface DeployResult {
  from: 'blue' | 'green' | null
  to: 'blue' | 'green'
  timestamp: string
}

export interface AuditEntry {
  id: string
  ts: string
  actor: string
  action: string
  resource: string
  detail: string
  ip: string
}
