'use client'

import { mockGitHubIntelligence } from '@/lib/github/mock'
import type { GitHubIntelligence } from '@/lib/github/types'
import { useMockData } from './useMockData'

export function useGitHubIntelligence() {
  const { data, source } = useMockData<GitHubIntelligence>(() => mockGitHubIntelligence)
  return { data, source }
}
