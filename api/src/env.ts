import 'dotenv/config'
import { z } from 'zod'
import type { Env } from './types.js'

const EnvSchema = z.object({
  // Auth
  JWT_SECRET: z
    .string()
    .min(64, 'JWT_SECRET must be at least 64 characters (use openssl rand -hex 64)'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(1, 'ADMIN_PASSWORD_HASH is required (format: <hex-salt>:<hex-key>)'),

  // Repo
  REPO_ROOT: z.string().min(1, 'REPO_ROOT is required'),
  CONTENT_ROOT: z.string().optional(),
  MEDIA_ROOT: z.string().optional(),

  // Git
  GIT_USER_NAME: z.string().min(1, 'GIT_USER_NAME is required'),
  GIT_USER_EMAIL: z.string().email('GIT_USER_EMAIL must be a valid email'),
  GIT_REMOTE: z.string().default('origin'),
  GIT_BRANCH: z.string().default('main'),

  // Deploy
  DIST_BLUE: z.string().min(1, 'DIST_BLUE is required'),
  DIST_GREEN: z.string().min(1, 'DIST_GREEN is required'),
  NGINX_ROOT: z.string().min(1, 'NGINX_ROOT is required'),

  // Audit
  AUDIT_LOG_PATH: z.string().optional(),

  // Server
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  MEDIA_MAX_SIZE_MB: z.coerce.number().positive().default(10),
})

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Content API — invalid environment:\n${issues}`)
  }

  const data = result.data
  const repoRoot = data.REPO_ROOT

  return {
    JWT_SECRET: data.JWT_SECRET,
    JWT_EXPIRES_IN: data.JWT_EXPIRES_IN,
    ADMIN_PASSWORD_HASH: data.ADMIN_PASSWORD_HASH,
    REPO_ROOT: repoRoot,
    CONTENT_ROOT: data.CONTENT_ROOT ?? `${repoRoot}/src/content`,
    MEDIA_ROOT: data.MEDIA_ROOT ?? `${repoRoot}/public/media`,
    GIT_USER_NAME: data.GIT_USER_NAME,
    GIT_USER_EMAIL: data.GIT_USER_EMAIL,
    GIT_REMOTE: data.GIT_REMOTE,
    GIT_BRANCH: data.GIT_BRANCH,
    DIST_BLUE: data.DIST_BLUE,
    DIST_GREEN: data.DIST_GREEN,
    NGINX_ROOT: data.NGINX_ROOT,
    AUDIT_LOG_PATH: data.AUDIT_LOG_PATH ?? `${repoRoot}/logs/audit.ndjson`,
    PORT: data.PORT,
    CORS_ORIGIN: data.CORS_ORIGIN,
    MEDIA_MAX_SIZE_MB: data.MEDIA_MAX_SIZE_MB,
  }
}

export const env: Env = loadEnv()
