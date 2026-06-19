'use client'

import { apiClient } from './client'
import type { APIResponse, AuditEntry } from './types'

export async function apiReadAudit(opts: {
  limit?: number
  type?: string
  actor?: string
  since?: string
} = {}): Promise<APIResponse<AuditEntry[]>> {
  const params = new URLSearchParams()
  if (opts.limit)  params.set('limit',  String(opts.limit))
  if (opts.type)   params.set('type',   opts.type)
  if (opts.actor)  params.set('actor',  opts.actor)
  if (opts.since)  params.set('since',  opts.since)
  const qs = params.toString()
  return apiClient.get<AuditEntry[]>(`/audit${qs ? `?${qs}` : ''}`)
}
