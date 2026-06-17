import type { AdminState, AdminAction } from '../types'

export function contentHandler(state: AdminState, action: AdminAction): AdminState | null {
  switch (action.type) {
    // Curated Links
    case 'SET_CURATED_LINKS':
      return { ...state, curatedLinks: action.payload, unsaved: true }
    case 'ADD_CURATED_LINK':
      return { ...state, curatedLinks: [...state.curatedLinks, action.payload], unsaved: true }
    case 'UPDATE_CURATED_LINK':
      return {
        ...state,
        curatedLinks: state.curatedLinks.map((l) => l.id === action.payload.id ? { ...l, ...action.payload.data } : l),
        unsaved: true,
      }
    case 'REMOVE_CURATED_LINK':
      return { ...state, curatedLinks: state.curatedLinks.filter((l) => l.id !== action.payload), unsaved: true }

    // Drive Resources
    case 'SET_DRIVE_RESOURCES':
      return { ...state, driveResources: action.payload, unsaved: true }
    case 'ADD_DRIVE_RESOURCE':
      return { ...state, driveResources: [...state.driveResources, action.payload], unsaved: true }
    case 'UPDATE_DRIVE_RESOURCE':
      return {
        ...state,
        driveResources: state.driveResources.map((r) => r.id === action.payload.id ? { ...r, ...action.payload.data } : r),
        unsaved: true,
      }
    case 'REMOVE_DRIVE_RESOURCE':
      return { ...state, driveResources: state.driveResources.filter((r) => r.id !== action.payload), unsaved: true }

    // About Config
    case 'UPDATE_ABOUT':
      return { ...state, aboutConfig: { ...state.aboutConfig, ...action.payload }, unsaved: true }
    case 'ABOUT_ADD_TIMELINE':
      return { ...state, aboutConfig: { ...state.aboutConfig, timeline: [...state.aboutConfig.timeline, action.payload] }, unsaved: true }
    case 'ABOUT_UPDATE_TIMELINE':
      return {
        ...state,
        aboutConfig: {
          ...state.aboutConfig,
          timeline: state.aboutConfig.timeline.map((t) =>
            t.id === action.payload.id ? { ...t, ...action.payload.data } : t
          ),
        },
        unsaved: true,
      }
    case 'ABOUT_REMOVE_TIMELINE':
      return { ...state, aboutConfig: { ...state.aboutConfig, timeline: state.aboutConfig.timeline.filter((t) => t.id !== action.payload) }, unsaved: true }

    // Tracked Sources
    case 'SET_TRACKED_SOURCES':
      return { ...state, trackedSources: action.payload, unsaved: true }
    case 'ADD_TRACKED_SOURCE':
      return { ...state, trackedSources: [...state.trackedSources, action.payload], unsaved: true }
    case 'UPDATE_TRACKED_SOURCE':
      return {
        ...state,
        trackedSources: state.trackedSources.map((s) => s.id === action.payload.id ? { ...s, ...action.payload.data } : s),
        unsaved: true,
      }
    case 'REMOVE_TRACKED_SOURCE':
      return { ...state, trackedSources: state.trackedSources.filter((s) => s.id !== action.payload), unsaved: true }

    // Blocks
    case 'SET_BLOCKS':
      return { ...state, blocks: action.payload, unsaved: true }
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map((b) => b.id === action.payload.id ? { ...b, ...action.payload.data } : b),
        unsaved: true,
      }
    case 'SET_PAGE_BLOCKS':
      return { ...state, pageBlocksMap: { ...state.pageBlocksMap, [action.payload.page]: action.payload.blocks }, unsaved: true }
    case 'UPDATE_PAGE_BLOCK':
      return {
        ...state,
        pageBlocksMap: {
          ...state.pageBlocksMap,
          [action.payload.page]: (state.pageBlocksMap[action.payload.page] ?? []).map((b) =>
            b.id === action.payload.id ? { ...b, ...action.payload.data } : b
          ),
        },
        unsaved: true,
      }

    // Site Content (hero, logos, stats, services, gallery, team, pricing, testimonials, FAQ, blog, portfolio, CTA, contact, map, newsletter, social proof)
    case 'UPDATE_CONTENT':
      return { ...state, content: { ...state.content, ...action.payload }, unsaved: true }
    case 'UPDATE_HERO_CONTENT':
      return { ...state, content: { ...state.content, hero: { ...state.content.hero, ...action.payload } }, unsaved: true }
    case 'SET_LOGOS':
      return { ...state, content: { ...state.content, logos: action.payload }, unsaved: true }
    case 'SET_STATS':
      return { ...state, content: { ...state.content, stats: action.payload }, unsaved: true }
    case 'SET_SERVICES':
      return { ...state, content: { ...state.content, services: action.payload }, unsaved: true }
    case 'SET_GALLERY':
      return { ...state, content: { ...state.content, gallery: action.payload }, unsaved: true }
    case 'SET_TEAM':
      return { ...state, content: { ...state.content, team: action.payload }, unsaved: true }
    case 'SET_PRICING':
      return { ...state, content: { ...state.content, pricing: action.payload }, unsaved: true }
    case 'SET_TESTIMONIALS':
      return { ...state, content: { ...state.content, testimonials: action.payload }, unsaved: true }
    case 'SET_FAQ':
      return { ...state, content: { ...state.content, faq: action.payload }, unsaved: true }
    case 'UPDATE_BLOG_CONTENT':
      return { ...state, content: { ...state.content, blog: { ...state.content.blog, ...action.payload } }, unsaved: true }
    case 'SET_PORTFOLIO':
      return { ...state, content: { ...state.content, portfolio: action.payload }, unsaved: true }
    case 'UPDATE_CTA_CONTENT':
      return { ...state, content: { ...state.content, cta: { ...state.content.cta, ...action.payload } }, unsaved: true }
    case 'UPDATE_CONTACT_CONTENT':
      return { ...state, content: { ...state.content, contact: { ...state.content.contact, ...action.payload } }, unsaved: true }
    case 'UPDATE_MAP_CONTENT':
      return { ...state, content: { ...state.content, map: { ...state.content.map, ...action.payload } }, unsaved: true }
    case 'UPDATE_NEWSLETTER_CONTENT':
      return { ...state, content: { ...state.content, newsletter: { ...state.content.newsletter, ...action.payload } }, unsaved: true }
    case 'SET_SOCIAL_PROOF':
      return { ...state, content: { ...state.content, socialProof: action.payload }, unsaved: true }

    // Navigation & layout
    case 'UPDATE_NAVBAR_SETTINGS':
      return { ...state, navbarSettings: { ...state.navbarSettings, ...action.payload }, unsaved: true }
    case 'UPDATE_FOOTER_SETTINGS':
      return { ...state, footerSettings: { ...state.footerSettings, ...action.payload }, unsaved: true }
    case 'SET_FOOTER_COLUMNS':
      return { ...state, footerSettings: { ...state.footerSettings, columns: action.payload }, unsaved: true }
    case 'SET_NAVIGATION':
      return { ...state, navigation: action.payload, unsaved: true }

    default:
      return null
  }
}
