import type { AdminState, AdminAction } from '../types'

export function capabilitiesHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // MCP Servers
    case 'CAPABILITIES_ADD_MCP':
      return {
        ...state,
        capabilities: { ...state.capabilities, mcpServers: [...state.capabilities.mcpServers, action.payload] },
        unsaved: true,
      }
    case 'CAPABILITIES_TOGGLE_MCP':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          mcpServers: state.capabilities.mcpServers.map((s) =>
            s.id === action.payload ? { ...s, enabled: !s.enabled } : s
          ),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_REMOVE_MCP':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          mcpServers: state.capabilities.mcpServers.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }

    // Skills
    case 'CAPABILITIES_ADD_SKILL':
      return {
        ...state,
        capabilities: { ...state.capabilities, skills: [...state.capabilities.skills, action.payload] },
        unsaved: true,
      }
    case 'CAPABILITIES_TOGGLE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.map((s) =>
            s.id === action.payload ? { ...s, enabled: !s.enabled } : s
          ),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_REMOVE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.filter((s) => s.id !== action.payload),
        },
        unsaved: true,
      }
    case 'CAPABILITIES_UPDATE_SKILL':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          skills: state.capabilities.skills.map((s) =>
            s.id === action.payload.id ? { ...s, ...action.payload.data } : s
          ),
        },
        unsaved: true,
      }

    // Hermes config + cron tasks
    case 'CAPABILITIES_UPDATE_HERMES':
      return {
        ...state,
        capabilities: { ...state.capabilities, hermes: { ...state.capabilities.hermes, ...action.payload } },
        unsaved: true,
      }
    case 'HERMES_ADD_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: { ...state.capabilities.hermes, scheduledTasks: [...state.capabilities.hermes.scheduledTasks, action.payload] },
        },
        unsaved: true,
      }
    case 'HERMES_UPDATE_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: {
            ...state.capabilities.hermes,
            scheduledTasks: state.capabilities.hermes.scheduledTasks.map((t) =>
              t.id === action.payload.id ? { ...t, ...action.payload.data } : t
            ),
          },
        },
        unsaved: true,
      }
    case 'HERMES_REMOVE_CRON_TASK':
      return {
        ...state,
        capabilities: {
          ...state.capabilities,
          hermes: {
            ...state.capabilities.hermes,
            scheduledTasks: state.capabilities.hermes.scheduledTasks.filter((t) => t.id !== action.payload),
          },
        },
        unsaved: true,
      }

    default:
      return null
  }
}
