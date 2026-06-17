import type { AdminState, AdminAction } from '../types'

export function designHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    case 'UPDATE_DESIGN':
      return { ...state, design: { ...state.design, ...action.payload }, unsaved: true }
    case 'UPDATE_TOKENS':
      return { ...state, design: { ...state.design, tokens: { ...state.design.tokens, ...action.payload } }, unsaved: true }
    case 'UPDATE_PERSONALITY':
      return { ...state, personality: { ...state.personality, ...action.payload }, unsaved: true }
    case 'SET_EFFECTS':
      return { ...state, personality: { ...state.personality, effects: action.payload }, unsaved: true }
    case 'UPDATE_VISUAL_EFFECTS':
      return { ...state, visualEffects: { ...state.visualEffects, ...action.payload }, unsaved: true }
    case 'SET_SHADER_PRESET':
      return { ...state, visualEffects: { ...state.visualEffects, activeShaderPreset: action.payload }, unsaved: true }
    case 'SET_HERO_SCENE_CONFIG':
      return { ...state, heroSceneConfig: { ...state.heroSceneConfig, ...action.payload }, unsaved: true }
    case 'SET_PAGE_EFFECT': {
      const existing = state.pageEffectsMap[action.payload.page] ?? { scene3d: false, particles: false, parallax: false, grain: false }
      return {
        ...state,
        pageEffectsMap: {
          ...state.pageEffectsMap,
          [action.payload.page]: { ...existing, ...action.payload.slot },
        },
        unsaved: true,
      }
    }
    default:
      return null
  }
}
