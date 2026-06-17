import { describe, it, expect } from 'vitest'
import type { AdminState } from './types'
import { createInitialState } from './state'

// Extract the reducer from the module for unit testing
// We import it via a module-level re-export trick
import { adminReducerForTest as reducer } from './store.test-utils'

function state(): AdminState {
  return createInitialState()
}

describe('adminReducer — site core', () => {
  it('UPDATE_SITE patches site and marks unsaved', () => {
    const s = reducer(state(), { type: 'UPDATE_SITE', payload: { siteName: 'Test Site' } })
    expect(s.site.siteName).toBe('Test Site')
    expect(s.unsaved).toBe(true)
  })

  it('UPDATE_SEO patches seo', () => {
    const s = reducer(state(), { type: 'UPDATE_SEO', payload: { metaTitle: 'My Title' } })
    expect(s.seo.metaTitle).toBe('My Title')
    expect(s.unsaved).toBe(true)
  })
})

describe('adminReducer — systems registry', () => {
  it('SET_SYSTEMS_REGISTRY replaces the entire registry', () => {
    const initial = state()
    const s = reducer(initial, { type: 'SET_SYSTEMS_REGISTRY', payload: [] })
    expect(s.systemsRegistry).toHaveLength(0)
    expect(s.unsaved).toBe(true)
  })

  it('UPDATE_SYSTEM patches matching entry by key', () => {
    const initial = state()
    const firstKey = initial.systemsRegistry[0].key
    const s = reducer(initial, { type: 'UPDATE_SYSTEM', payload: { key: firstKey, data: { uptime: '100%' } } })
    expect(s.systemsRegistry.find((x) => x.key === firstKey)?.uptime).toBe('100%')
    expect(s.unsaved).toBe(true)
  })

  it('UPDATE_SYSTEM does not modify non-matching entries', () => {
    const initial = state()
    const before = initial.systemsRegistry.map((x) => x.key)
    const s = reducer(initial, { type: 'UPDATE_SYSTEM', payload: { key: initial.systemsRegistry[0].key, data: { uptime: 'X' } } })
    const after = s.systemsRegistry.map((x) => x.key)
    expect(after).toEqual(before)
    expect(s.systemsRegistry.slice(1).every((x) => x.uptime !== 'X')).toBe(true)
  })
})

describe('adminReducer — labs registry', () => {
  it('SET_LABS_REGISTRY replaces registry', () => {
    const s = reducer(state(), { type: 'SET_LABS_REGISTRY', payload: [] })
    expect(s.labsRegistry).toHaveLength(0)
  })

  it('UPDATE_LAB patches matching lab by key', () => {
    const initial = state()
    const key = initial.labsRegistry[0].key
    const s = reducer(initial, { type: 'UPDATE_LAB', payload: { key, data: { tagline: 'Updated tagline' } } })
    expect(s.labsRegistry.find((l) => l.key === key)?.tagline).toBe('Updated tagline')
  })
})

describe('adminReducer — research registry', () => {
  it('SET_RESEARCH_REGISTRY replaces registry', () => {
    const s = reducer(state(), { type: 'SET_RESEARCH_REGISTRY', payload: [] })
    expect(s.researchRegistry).toHaveLength(0)
  })

  it('UPDATE_RESEARCH_ENTRY patches by slug', () => {
    const initial = state()
    const slug = initial.researchRegistry[0]?.slug
    if (!slug) return
    const s = reducer(initial, { type: 'UPDATE_RESEARCH_ENTRY', payload: { slug, data: { published: true } } })
    expect(s.researchRegistry.find((r) => r.slug === slug)?.published).toBe(true)
  })
})

describe('adminReducer — infra', () => {
  it('UPDATE_INFRA_CONFIG patches config', () => {
    const s = reducer(state(), { type: 'UPDATE_INFRA_CONFIG', payload: { region: 'eu-west-1' } })
    expect(s.infraConfig.region).toBe('eu-west-1')
  })

  it('UPDATE_INFRA_NODE patches matching node by name', () => {
    const initial = state()
    const name = initial.infraConfig.nodes[0].name
    const s = reducer(initial, { type: 'UPDATE_INFRA_NODE', payload: { name, data: { status: 'stopped' } } })
    expect(s.infraConfig.nodes.find((n) => n.name === name)?.status).toBe('stopped')
  })
})

describe('adminReducer — GitHub', () => {
  it('UPDATE_GITHUB_CONFIG patches config', () => {
    const s = reducer(state(), { type: 'UPDATE_GITHUB_CONFIG', payload: { username: 'test-user' } })
    expect(s.githubConfig.username).toBe('test-user')
  })
})

describe('adminReducer — design / visual engine', () => {
  it('UPDATE_DESIGN patches design', () => {
    const s = reducer(state(), { type: 'UPDATE_DESIGN', payload: { palette: 'rose' } })
    expect(s.design.palette).toBe('rose')
  })

  it('UPDATE_TOKENS patches tokens without overwriting other design fields', () => {
    const initial = state()
    const paletteBefore = initial.design.palette
    const s = reducer(initial, { type: 'UPDATE_TOKENS', payload: { borderRadius: 'xl' } })
    expect(s.design.tokens.borderRadius).toBe('xl')
    expect(s.design.palette).toBe(paletteBefore)
  })

  it('UPDATE_PERSONALITY patches personality', () => {
    const s = reducer(state(), { type: 'UPDATE_PERSONALITY', payload: { active: 'minimalist' } })
    expect(s.personality.active).toBe('minimalist')
  })

  it('SET_EFFECTS replaces effects array', () => {
    const s = reducer(state(), { type: 'SET_EFFECTS', payload: [] })
    expect(s.personality.effects).toHaveLength(0)
  })

  it('SET_NAVIGATION replaces nav', () => {
    const s = reducer(state(), { type: 'SET_NAVIGATION', payload: [] })
    expect(s.navigation).toHaveLength(0)
  })
})

describe('adminReducer — AI assistant', () => {
  it('AI_NEW_CONVERSATION prepends conversation and sets active', () => {
    const initial = state()
    const conv = { id: 'c1', title: 'Test', messages: [], createdAt: '', updatedAt: '' }
    const s = reducer(initial, { type: 'AI_NEW_CONVERSATION', payload: conv })
    expect(s.aiConfig.conversations[0].id).toBe('c1')
    expect(s.aiConfig.activeConversationId).toBe('c1')
  })

  it('AI_ADD_MESSAGE appends to matching conversation', () => {
    const initial = state()
    const conv = { id: 'c1', title: 'T', messages: [], createdAt: '', updatedAt: '' }
    const withConv = reducer(initial, { type: 'AI_NEW_CONVERSATION', payload: conv })
    const msg = { id: 'm1', role: 'user' as const, content: 'Hello', timestamp: '' }
    const s = reducer(withConv, { type: 'AI_ADD_MESSAGE', payload: { conversationId: 'c1', message: msg } })
    expect(s.aiConfig.conversations[0].messages).toHaveLength(1)
    expect(s.aiConfig.conversations[0].messages[0].content).toBe('Hello')
  })

  it('AI_DELETE_CONVERSATION removes it and clears active if needed', () => {
    const initial = state()
    const conv = { id: 'c1', title: 'T', messages: [], createdAt: '', updatedAt: '' }
    const withConv = reducer(initial, { type: 'AI_NEW_CONVERSATION', payload: conv })
    const s = reducer(withConv, { type: 'AI_DELETE_CONVERSATION', payload: 'c1' })
    expect(s.aiConfig.conversations.find((c) => c.id === 'c1')).toBeUndefined()
    expect(s.aiConfig.activeConversationId).toBeNull()
  })
})

describe('adminReducer — ADD_LAB_ENTRY', () => {
  it('appends a new lab entry and marks unsaved', () => {
    const initial = state()
    const countBefore = initial.labsRegistry.length
    const newLab = {
      key: 'test-lab',
      name: 'Test Lab',
      tagline: 'A test lab',
      status: 'beta' as const,
      description: 'Testing lab entry append.',
      stack: ['TypeScript', 'React'],
      metrics: [],
      accent: '#38bdf8',
      visible: true,
    }
    const s = reducer(initial, { type: 'ADD_LAB_ENTRY', payload: newLab })
    expect(s.labsRegistry).toHaveLength(countBefore + 1)
    expect(s.labsRegistry[s.labsRegistry.length - 1].key).toBe('test-lab')
    expect(s.unsaved).toBe(true)
  })

  it('does not mutate existing entries when adding a new lab', () => {
    const initial = state()
    const firstKeyBefore = initial.labsRegistry[0].key
    const s = reducer(initial, {
      type: 'ADD_LAB_ENTRY',
      payload: { key: 'x', name: 'X', tagline: '', status: 'rd' as const, description: '', stack: [], metrics: [], accent: '', visible: false },
    })
    expect(s.labsRegistry[0].key).toBe(firstKeyBefore)
  })

  it('supports adding a lab with status "roadmap"', () => {
    const s = reducer(state(), {
      type: 'ADD_LAB_ENTRY',
      payload: { key: 'future-lab', name: 'Future Lab', tagline: '', status: 'roadmap' as const, description: '', stack: [], metrics: [], accent: '', visible: false },
    })
    const added = s.labsRegistry.find(l => l.key === 'future-lab')
    expect(added).toBeDefined()
    expect(added?.status).toBe('roadmap')
  })
})

describe('adminReducer — ADD_RESEARCH_ENTRY', () => {
  it('appends a new research entry and marks unsaved', () => {
    const initial = state()
    const countBefore = initial.researchRegistry.length
    const entry = {
      slug: 'new-article',
      title: 'New Research Article',
      category: 'research' as const,
      excerpt: 'A detailed study on AI systems.',
      tags: ['ai', 'systems'],
      readTime: 8,
      published: false,
      featured: false,
    }
    const s = reducer(initial, { type: 'ADD_RESEARCH_ENTRY', payload: entry })
    expect(s.researchRegistry).toHaveLength(countBefore + 1)
    expect(s.researchRegistry[s.researchRegistry.length - 1].slug).toBe('new-article')
    expect(s.unsaved).toBe(true)
  })

  it('does not mutate existing entries when adding a new research entry', () => {
    const initial = state()
    const existing = initial.researchRegistry.map(r => r.slug)
    const s = reducer(initial, {
      type: 'ADD_RESEARCH_ENTRY',
      payload: { slug: 'z', title: 'Z', category: 'opinion' as const, excerpt: '', tags: [], readTime: 1, published: false, featured: false },
    })
    const after = s.researchRegistry.slice(0, existing.length).map(r => r.slug)
    expect(after).toEqual(existing)
  })

  it('new entry is immediately findable by slug', () => {
    const s = reducer(state(), {
      type: 'ADD_RESEARCH_ENTRY',
      payload: { slug: 'unique-slug', title: 'T', category: 'essays' as const, excerpt: '', tags: [], readTime: 3, published: true, featured: false },
    })
    const found = s.researchRegistry.find(r => r.slug === 'unique-slug')
    expect(found?.published).toBe(true)
  })

  it('supports all research categories', () => {
    const categories = ['opinion', 'research', 'essays', 'news'] as const
    for (const category of categories) {
      const s = reducer(state(), {
        type: 'ADD_RESEARCH_ENTRY',
        payload: { slug: `slug-${category}`, title: 'T', category, excerpt: '', tags: [], readTime: 1, published: false, featured: false },
      })
      expect(s.researchRegistry.find(r => r.slug === `slug-${category}`)?.category).toBe(category)
    }
  })
})

describe('adminReducer — panel routing', () => {
  it('SET_PANEL changes the active panel', () => {
    const s = reducer(state(), { type: 'SET_PANEL', payload: 'github' as never })
    expect(s.panel).toBe('github')
    expect(s.unsaved).toBe(false)
  })
})
