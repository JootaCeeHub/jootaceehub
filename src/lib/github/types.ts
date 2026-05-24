export interface RepositoryCard {
  name: string
  description: string
  stars: number
  forks: number
  language: string
  languageColor: string
  status: 'active' | 'development'
  updatedAt: string
  href: string
  commitVelocity: string
}

export interface GitHubReleaseInfo {
  repository: string
  tagName: string
  publishedAt: string
  url: string
}

export interface GitHubDeploymentInfo {
  repository: string
  environment: string
  state: string
  updatedAt: string
}

export interface GitHubActivityPoint {
  date: string
  commits: number
}

export interface GitHubIntelligence {
  revision: string
  generatedAt: string
  source: 'live' | 'mock'
  repositories: RepositoryCard[]
  totalStars: number
  totalForks: number
  commitsLast30d: number
  recentReleases: GitHubReleaseInfo[]
  deployments: GitHubDeploymentInfo[]
  activity: GitHubActivityPoint[]
}
