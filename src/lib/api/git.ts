'use client'

import { apiClient } from './client'
import type { APIResponse, GitStatus, GitLogEntry, CommitResult, RollbackResult } from './types'

export async function apiGitStatus(): Promise<APIResponse<GitStatus>> {
  return apiClient.get<GitStatus>('/git/status')
}

export async function apiGitLog(limit = 20): Promise<APIResponse<GitLogEntry[]>> {
  return apiClient.get<GitLogEntry[]>(`/git/log?limit=${limit}`)
}

export async function apiGitCommit(
  message: string,
  files?: string[],
): Promise<APIResponse<CommitResult>> {
  return apiClient.post<CommitResult>('/git/commit', { message, files })
}

export async function apiGitRollback(hash: string): Promise<APIResponse<RollbackResult>> {
  return apiClient.post<RollbackResult>('/git/rollback', { hash })
}
