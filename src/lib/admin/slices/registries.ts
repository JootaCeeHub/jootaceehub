import type { AdminState, AdminAction } from '../types'

export function registriesHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // Projects
    case 'SET_PROJECTS_REGISTRY':
      return { ...state, projectsRegistry: action.payload, unsaved: true }
    case 'ADD_PROJECT':
      return { ...state, projectsRegistry: [...state.projectsRegistry, action.payload], unsaved: true }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projectsRegistry: state.projectsRegistry.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.data } : p
        ),
        unsaved: true,
      }
    case 'REMOVE_PROJECT':
      return { ...state, projectsRegistry: state.projectsRegistry.filter((p) => p.id !== action.payload), unsaved: true }

    // Systems
    case 'SET_SYSTEMS_REGISTRY':
      return { ...state, systemsRegistry: action.payload, unsaved: true }
    case 'ADD_SYSTEM':
      return { ...state, systemsRegistry: [...state.systemsRegistry, action.payload], unsaved: true }
    case 'UPDATE_SYSTEM':
      return {
        ...state,
        systemsRegistry: state.systemsRegistry.map((s) =>
          s.key === action.payload.key ? { ...s, ...action.payload.data } : s
        ),
        unsaved: true,
      }
    case 'REMOVE_SYSTEM':
      return { ...state, systemsRegistry: state.systemsRegistry.filter((s) => s.key !== action.payload), unsaved: true }

    // Labs
    case 'SET_LABS_REGISTRY':
      return { ...state, labsRegistry: action.payload, unsaved: true }
    case 'ADD_LAB_ENTRY':
      return { ...state, labsRegistry: [...state.labsRegistry, action.payload], unsaved: true }
    case 'UPDATE_LAB':
      return {
        ...state,
        labsRegistry: state.labsRegistry.map((l) =>
          l.key === action.payload.key ? { ...l, ...action.payload.data } : l
        ),
        unsaved: true,
      }

    // Research
    case 'SET_RESEARCH_REGISTRY':
      return { ...state, researchRegistry: action.payload, unsaved: true }
    case 'ADD_RESEARCH_ENTRY':
      return { ...state, researchRegistry: [...state.researchRegistry, action.payload], unsaved: true }
    case 'UPDATE_RESEARCH_ENTRY':
      return {
        ...state,
        researchRegistry: state.researchRegistry.map((r) =>
          r.slug === action.payload.slug ? { ...r, ...action.payload.data } : r
        ),
        unsaved: true,
      }

    // Resource registries
    case 'SET_TOOL_REGISTRY':     return { ...state, toolRegistry:     action.payload, unsaved: true }
    case 'SET_REPO_REGISTRY':     return { ...state, repoRegistry:     action.payload, unsaved: true }
    case 'SET_WORKFLOW_REGISTRY': return { ...state, workflowRegistry: action.payload, unsaved: true }
    case 'SET_PROMPT_REGISTRY':   return { ...state, promptRegistry:   action.payload, unsaved: true }
    case 'SET_MCP_REGISTRY':      return { ...state, mcpRegistry:      action.payload, unsaved: true }
    case 'SET_AGENT_REGISTRY':    return { ...state, agentRegistry:    action.payload, unsaved: true }
    case 'SET_SKILL_REGISTRY':    return { ...state, skillRegistry:    action.payload, unsaved: true }

    default:
      return null
  }
}
