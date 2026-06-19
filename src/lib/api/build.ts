'use client'

import { apiClient } from './client'
import type { APIResponse, BuildJob, DeployResult } from './types'

export async function apiBuildTrigger(reason?: string): Promise<APIResponse<{ jobId: string; status: string }>> {
  return apiClient.post('/build/trigger', { reason })
}

export async function apiBuildStatus(jobId: string): Promise<APIResponse<BuildJob>> {
  return apiClient.get<BuildJob>(`/build/status/${jobId}`)
}

export async function apiBuildHistory(limit = 10): Promise<APIResponse<BuildJob[]>> {
  return apiClient.get<BuildJob[]>(`/build/history?limit=${limit}`)
}

export async function apiDeployRollback(): Promise<APIResponse<DeployResult>> {
  return apiClient.post<DeployResult>('/build/deploy-rollback')
}
