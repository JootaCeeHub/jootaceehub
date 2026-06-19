'use client'

/**
 * Base HTTP client for the VPS Content API.
 *
 * Token management: JWT stored in sessionStorage under VPS_TOKEN_KEY.
 * Expires when the browser tab is closed (consistent with server-side 8h JWT expiry).
 *
 * Usage:
 *   const client = getApiClient()
 *   const result = await client.get<HealthData>('/health')
 */

import type { APIResponse } from './types'

export const VPS_TOKEN_KEY = 'jootacee-vps-token'

// ---------------------------------------------------------------------------
// URL resolver
// ---------------------------------------------------------------------------

export function getApiUrl(): string | null {
  return process.env['NEXT_PUBLIC_CONTENT_API_URL'] ?? null
}

export function isApiConfigured(): boolean {
  return Boolean(getApiUrl())
}

// ---------------------------------------------------------------------------
// Token helpers (sessionStorage — survives page reload but not tab close)
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(VPS_TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(VPS_TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(VPS_TOKEN_KEY)
}

export function isTokenExpired(): boolean {
  const token = getToken()
  if (!token) return true
  try {
    // JWT payload is the middle segment, base64url-encoded
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { exp?: number }
    if (!payload.exp) return true
    // exp is in seconds; add 30s buffer
    return Date.now() / 1000 > payload.exp - 30
  } catch {
    return true
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: APIResponse,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
  formData?: FormData
}

async function request<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<APIResponse<T>> {
  const baseUrl = getApiUrl()
  if (!baseUrl) throw new ApiError('NEXT_PUBLIC_CONTENT_API_URL is not configured', 0, { success: false, error: 'Not configured' })

  const { method = 'GET', body, token = getToken(), formData } = opts

  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const url = `${baseUrl.replace(/\/$/, '')}${path}`

  const res = await fetch(url, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  })

  const json = await res.json() as APIResponse<T>

  if (!res.ok) {
    throw new ApiError(
      json.error ?? `HTTP ${res.status}`,
      res.status,
      json,
    )
  }

  return json
}

// ---------------------------------------------------------------------------
// Exported client object
// ---------------------------------------------------------------------------

export const apiClient = {
  get<T>(path: string, token?: string | null) {
    return request<T>(path, { method: 'GET', token })
  },
  post<T>(path: string, body?: unknown, token?: string | null) {
    return request<T>(path, { method: 'POST', body, token })
  },
  put<T>(path: string, body?: unknown, token?: string | null) {
    return request<T>(path, { method: 'PUT', body, token })
  },
  putText<T>(path: string, text: string, token?: string | null) {
    const baseUrl = getApiUrl()
    if (!baseUrl) return Promise.reject(new ApiError('Not configured', 0, { success: false }))
    const t = token ?? getToken()
    const headers: Record<string, string> = { 'Content-Type': 'text/plain' }
    if (t) headers['Authorization'] = `Bearer ${t}`
    return fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'PUT',
      headers,
      body: text,
    }).then((r) => r.json() as Promise<APIResponse<T>>)
  },
  delete<T>(path: string, token?: string | null) {
    return request<T>(path, { method: 'DELETE', token })
  },
  upload<T>(path: string, formData: FormData, token?: string | null) {
    return request<T>(path, { method: 'POST', formData, token })
  },
}
