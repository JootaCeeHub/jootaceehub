import type { AdminState, AdminAction, GithubRepoMeta } from '../types'

export function infrastructureHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // Infrastructure Manager
    case 'UPDATE_INFRA_CONFIG':
      return { ...state, infraConfig: { ...state.infraConfig, ...action.payload }, unsaved: true }
    case 'SET_INFRA_NODES':
      return { ...state, infraConfig: { ...state.infraConfig, nodes: action.payload }, unsaved: true }
    case 'UPDATE_INFRA_NODE':
      return {
        ...state,
        infraConfig: {
          ...state.infraConfig,
          nodes: state.infraConfig.nodes.map((n) =>
            n.name === action.payload.name ? { ...n, ...action.payload.data } : n
          ),
        },
        unsaved: true,
      }
    case 'ADD_INFRA_NODE':
      return { ...state, infraConfig: { ...state.infraConfig, nodes: [...state.infraConfig.nodes, action.payload] }, unsaved: true }
    case 'REMOVE_INFRA_NODE':
      return { ...state, infraConfig: { ...state.infraConfig, nodes: state.infraConfig.nodes.filter((n) => n.name !== action.payload) }, unsaved: true }
    case 'SET_INFRA_DEPLOYMENTS':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: action.payload }, unsaved: true }
    case 'ADD_INFRA_DEPLOYMENT':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: [action.payload, ...state.infraConfig.deployments] }, unsaved: true }
    case 'REMOVE_INFRA_DEPLOYMENT':
      return { ...state, infraConfig: { ...state.infraConfig, deployments: state.infraConfig.deployments.filter((_, i) => i !== action.payload) }, unsaved: true }

    // GitHub Layer
    case 'UPDATE_GITHUB_CONFIG':
      return { ...state, githubConfig: { ...state.githubConfig, ...action.payload }, unsaved: true }
    case 'SET_REPO_META':
      return {
        ...state,
        githubConfig: {
          ...state.githubConfig,
          repoMeta: {
            ...state.githubConfig.repoMeta,
            [action.payload.repo]: {
              ...(state.githubConfig.repoMeta[action.payload.repo] ?? { description: '', language: '', stars: 0, forks: 0, topics: [], pinned: false }),
              ...action.payload.meta,
            },
          },
        },
        unsaved: true,
      }
    case 'SYNC_GITHUB_FROM_INTEGRATIONS': {
      const gh = state.integrations.github
      if (!gh.connected || !gh.repos.length) return state
      const sorted   = [...gh.repos].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      const topRepos = sorted.slice(0, 20)
      const newDisplayRepos = topRepos.map((r) => r.name)
      const newRepoMeta = topRepos.reduce<Record<string, GithubRepoMeta>>((acc, r) => {
        const existing = state.githubConfig.repoMeta[r.name]
        acc[r.name] = {
          description: r.description || existing?.description || '',
          language:    r.language    || existing?.language    || 'TypeScript',
          stars:       r.stars       ?? existing?.stars       ?? 0,
          forks:       r.forks       ?? existing?.forks       ?? 0,
          topics:      r.topics      ?? existing?.topics      ?? [],
          pinned:      existing?.pinned ?? false,
        }
        return acc
      }, {})
      return {
        ...state,
        githubConfig: {
          ...state.githubConfig,
          username:     gh.username || state.githubConfig.username,
          displayRepos: newDisplayRepos,
          repoMeta:     newRepoMeta,
        },
        unsaved: true,
      }
    }

    default:
      return null
  }
}
