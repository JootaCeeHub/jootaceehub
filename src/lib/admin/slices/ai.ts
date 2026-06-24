import type { AdminState, AdminAction } from '../types'

export function aiHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // Conversations
    case 'AI_NEW_CONVERSATION':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: [action.payload, ...state.aiConfig.conversations],
          activeConversationId: action.payload.id,
        },
        unsaved: true,
      }
    case 'AI_SET_ACTIVE':
      return { ...state, aiConfig: { ...state.aiConfig, activeConversationId: action.payload } }
    case 'AI_ADD_MESSAGE': {
      const now = new Date().toISOString()
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: state.aiConfig.conversations.map((c) =>
            c.id === action.payload.conversationId
              ? { ...c, messages: [...c.messages, action.payload.message], updatedAt: now }
              : c
          ),
        },
        unsaved: true,
      }
    }
    case 'AI_UPDATE_TITLE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: state.aiConfig.conversations.map((c) =>
            c.id === action.payload.conversationId ? { ...c, title: action.payload.title } : c
          ),
        },
        unsaved: true,
      }
    case 'AI_DELETE_CONVERSATION': {
      const filtered = state.aiConfig.conversations.filter((c) => c.id !== action.payload)
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          conversations: filtered,
          activeConversationId:
            state.aiConfig.activeConversationId === action.payload
              ? (filtered[0]?.id ?? null)
              : state.aiConfig.activeConversationId,
        },
        unsaved: true,
      }
    }

    // LLM Profiles
    case 'AI_SET_PROFILE': {
      const exists = state.aiConfig.profiles.some((p) => p.id === action.payload.id)
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: exists
            ? state.aiConfig.profiles.map((p) => (p.id === action.payload.id ? action.payload : p))
            : [...state.aiConfig.profiles, action.payload],
        },
        unsaved: true,
      }
    }
    case 'AI_SET_ACTIVE_PROFILE':
      return { ...state, aiConfig: { ...state.aiConfig, activeProfileId: action.payload }, unsaved: true }
    case 'AI_REMOVE_PROFILE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: state.aiConfig.profiles.filter((p) => p.id !== action.payload),
        },
        unsaved: true,
      }
    case 'AI_TOGGLE_CONTEXT':
      return { ...state, aiConfig: { ...state.aiConfig, siteContextEnabled: action.payload }, unsaved: true }

    case 'AI_UPDATE_PROFILE_STATUS':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: state.aiConfig.profiles.map(p =>
            p.id !== action.payload.id ? p : {
              ...p,
              status: action.payload.status,
              stats: {
                ...p.stats,
                lastError: action.payload.error ?? p.stats?.lastError ?? null,
              },
            }
          ),
        },
        unsaved: true,
      }

    case 'AI_UPDATE_PROFILE_STATS': {
      const now = new Date().toISOString()
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          profiles: state.aiConfig.profiles.map(p => {
            if (p.id !== action.payload.id) return p
            const s = p.stats ?? { lastUsed: null, lastError: null, totalRequests: 0, totalTokensIn: 0, totalTokensOut: 0, avgLatencyMs: 0, errorCount: 0 }
            const reqs    = s.totalRequests + 1
            const isError = !!action.payload.error
            const avgLat  = Math.round((s.avgLatencyMs * s.totalRequests + action.payload.latencyMs) / reqs)
            return {
              ...p,
              status: isError ? 'error' as const : 'connected' as const,
              stats: {
                lastUsed:        now,
                lastError:       isError ? (action.payload.error ?? null) : s.lastError,
                totalRequests:   reqs,
                totalTokensIn:   s.totalTokensIn  + action.payload.tokensIn,
                totalTokensOut:  s.totalTokensOut + action.payload.tokensOut,
                avgLatencyMs:    avgLat,
                errorCount:      s.errorCount + (isError ? 1 : 0),
              },
            }
          }),
        },
        unsaved: true,
      }
    }

    // Agent Profiles
    case 'AGENT_PROFILE_ADD':
      return {
        ...state,
        aiConfig: { ...state.aiConfig, agentProfiles: [...(state.aiConfig.agentProfiles ?? []), action.payload] },
        unsaved: true,
      }
    case 'AGENT_PROFILE_UPDATE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          agentProfiles: (state.aiConfig.agentProfiles ?? []).map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload.data } : p
          ),
        },
        unsaved: true,
      }
    case 'AGENT_PROFILE_REMOVE':
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          agentProfiles: (state.aiConfig.agentProfiles ?? []).filter(p => p.id !== action.payload),
          activeAgentProfileId:
            state.aiConfig.activeAgentProfileId === action.payload ? null : state.aiConfig.activeAgentProfileId,
        },
        unsaved: true,
      }
    case 'AGENT_PROFILE_SET_ACTIVE':
      return { ...state, aiConfig: { ...state.aiConfig, activeAgentProfileId: action.payload }, unsaved: true }
    case 'AGENT_PROFILE_INCREMENT_USE': {
      const now = new Date().toISOString()
      return {
        ...state,
        aiConfig: {
          ...state.aiConfig,
          agentProfiles: (state.aiConfig.agentProfiles ?? []).map(p =>
            p.id !== action.payload ? p : { ...p, useCount: p.useCount + 1, lastUsed: now }
          ),
        },
        unsaved: true,
      }
    }

    // Intelligence feeds
    case 'INTELLIGENCE_TOGGLE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload ? { ...f, enabled: !f.enabled } : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_SET_KEY':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id ? { ...f, apiKey: action.payload.key } : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_UPDATE_CONFIG':
      return { ...state, intelligence: { ...state.intelligence, ...action.payload }, unsaved: true }
    case 'INTELLIGENCE_SET_STATUS':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id ? { ...f, connected: action.payload.connected } : f
          ),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_ADD_FEED':
      return {
        ...state,
        intelligence: { ...state.intelligence, feeds: [...state.intelligence.feeds, action.payload] },
        unsaved: true,
      }
    case 'INTELLIGENCE_REMOVE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.filter((f) => f.id !== action.payload),
        },
        unsaved: true,
      }
    case 'INTELLIGENCE_UPDATE_FEED':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          feeds: state.intelligence.feeds.map((f) =>
            f.id === action.payload.id ? { ...f, ...action.payload.data } : f
          ),
        },
        unsaved: true,
      }

    default:
      return null
  }
}
