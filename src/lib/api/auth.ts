'use client'

import { apiClient, setToken, clearToken } from './client'
import type { APIResponse, AuthTokenData, AuthMeData, HealthData } from './types'

export async function apiLogin(password: string): Promise<APIResponse<AuthTokenData>> {
  const res = await apiClient.post<AuthTokenData>('/auth/login', { password }, null)
  if (res.success && res.data?.token) {
    setToken(res.data.token)
  }
  return res
}

export async function apiLogout(): Promise<void> {
  clearToken()
}

export async function apiMe(): Promise<APIResponse<AuthMeData>> {
  return apiClient.get<AuthMeData>('/auth/me')
}

export async function apiHealth(): Promise<APIResponse<HealthData>> {
  return apiClient.get<HealthData>('/health', null)
}
