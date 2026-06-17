/** Typed shapes for GitHub REST API v3 responses used in this project. */

export interface GHRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  pushed_at: string | null
  updated_at: string
  fork: boolean
  archived: boolean
  topics: string[]
  private: boolean
}

export interface GHEventCommit {
  sha: string
  message: string
  distinct: boolean
  url: string
}

export interface GHRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  html_url: string
}

export interface GHEventPayload {
  action?: string
  ref?: string
  ref_type?: 'branch' | 'tag' | 'repository'
  commits?: GHEventCommit[]
  release?: GHRelease
}

export interface GHEvent {
  id: string
  type: string
  created_at: string
  public: boolean
  repo: { id: number; name: string; url: string }
  payload: GHEventPayload
}

export interface GHUser {
  login: string
  id: number
  name: string | null
  bio: string | null
  location: string | null
  html_url: string
  avatar_url: string
  followers: number
  following: number
  public_repos: number
}
