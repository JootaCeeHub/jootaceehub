import type { AdminState, AdminAction } from '../types'

export function siteHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    case 'UPDATE_SITE':
      return { ...state, site: { ...state.site, ...action.payload }, unsaved: true }
    case 'UPDATE_SEO':
      return { ...state, seo: { ...state.seo, ...action.payload }, unsaved: true }
    case 'UPDATE_RUNTIME':
      return { ...state, runtime: { ...state.runtime, ...action.payload }, unsaved: true }
    default:
      return null
  }
}
