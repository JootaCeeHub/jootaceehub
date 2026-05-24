/**
 * Runtime environment validation.
 * This module is safe to import in both server and client bundles
 * because it only reads NEXT_PUBLIC_ variables on the client.
 */

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getBoolEnv(key: string, fallback = false): boolean {
  const value = process.env[key]
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'warn',
  maintenanceMode: getBoolEnv('NEXT_PUBLIC_MAINTENANCE_MODE', false),
} as const
