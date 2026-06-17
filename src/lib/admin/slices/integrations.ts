import type { AdminState, AdminAction } from '../types'

export function integrationsHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // GitHub integration
    case 'INTEGRATIONS_SET_GITHUB':
      return {
        ...state,
        integrations: { ...state.integrations, github: { ...state.integrations.github, ...action.payload } },
        unsaved: true,
      }
    case 'INTEGRATIONS_DISCONNECT_GITHUB':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          github: { connected: false, accessToken: '', username: '', avatarUrl: '', repos: [], selectedRepos: [], lastSync: null },
        },
        unsaved: true,
      }

    // Social platforms
    case 'UPDATE_SOCIAL_PLATFORM':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          socialPlatforms: state.integrations.socialPlatforms.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload.data } : p
          ),
        },
        unsaved: true,
      }
    case 'TOGGLE_SOCIAL_PLATFORM':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          socialPlatforms: state.integrations.socialPlatforms.map((p) =>
            p.id === action.payload ? { ...p, connected: !p.connected } : p
          ),
        },
        unsaved: true,
      }

    // Data Sources
    case 'SOURCES_ADD':
      return {
        ...state,
        integrations: { ...state.integrations, dataSources: [action.payload, ...state.integrations.dataSources] },
        unsaved: true,
      }
    case 'SOURCES_UPDATE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.data } : s
          ),
        },
        unsaved: true,
      }
    case 'SOURCES_REMOVE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }
    case 'SOURCES_CLEAR_ALL':
      return { ...state, integrations: { ...state.integrations, dataSources: [] }, unsaved: true }
    case 'SOURCES_SET_SHOWCASE':
      return {
        ...state,
        integrations: {
          ...state.integrations,
          dataSources: state.integrations.dataSources.map((s) =>
            s.id === action.payload.id ? { ...s, showcaseOutput: action.payload.output } : s
          ),
        },
        unsaved: true,
      }

    default:
      return null
  }
}
