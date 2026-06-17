// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  allArticles,
  getAllMeta,
  getArticleBySlug,
  getArticlesByCategory,
  getFeaturedArticle,
  getAllSlugs,
  getRelatedArticles,
} from './articles'

// Known slugs from the journal content directory
const KNOWN_SLUGS = [
  'orchestration-is-the-new-compute',
  'graphrag-vs-vector-retrieval',
  'on-building-systems-that-last',
  'mcp-ecosystem-expansion-2026',
  'autonomous-infrastructure-observability',
  'context-window-as-operating-environment',
  'protocol-convergence-mcp-a2a',
] as const

// ─── allArticles ──────────────────────────────────────────────────────────────

describe('allArticles', () => {
  it('contains all 7 known articles', () => {
    expect(allArticles).toHaveLength(7)
  })

  it('is sorted by date descending (newest first)', () => {
    for (let i = 0; i < allArticles.length - 1; i++) {
      const a = new Date(allArticles[i].date).getTime()
      const b = new Date(allArticles[i + 1].date).getTime()
      expect(a).toBeGreaterThanOrEqual(b)
    }
  })

  it('every article has required fields', () => {
    for (const article of allArticles) {
      expect(typeof article.slug).toBe('string')
      expect(article.slug.length).toBeGreaterThan(0)
      expect(typeof article.title).toBe('string')
      expect(typeof article.excerpt).toBe('string')
      expect(typeof article.date).toBe('string')
      expect(typeof article.category).toBe('string')
      expect(Array.isArray(article.tags)).toBe(true)
      expect(typeof article.readTime).toBe('number')
      expect(typeof article.content).toBe('string')
    }
  })

  it('every article has a non-empty content string', () => {
    for (const article of allArticles) {
      expect(article.content.trim().length).toBeGreaterThan(0)
    }
  })
})

// ─── getAllSlugs ──────────────────────────────────────────────────────────────

describe('getAllSlugs', () => {
  it('returns an array of 7 strings', () => {
    const slugs = getAllSlugs()
    expect(Array.isArray(slugs)).toBe(true)
    expect(slugs).toHaveLength(7)
    slugs.forEach(s => expect(typeof s).toBe('string'))
  })

  it('contains every known slug', () => {
    const slugs = getAllSlugs()
    for (const slug of KNOWN_SLUGS) {
      expect(slugs).toContain(slug)
    }
  })

  it('has no duplicate slugs', () => {
    const slugs = getAllSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('can be used as generateStaticParams input (each slug produces a valid params object)', () => {
    const slugs = getAllSlugs()
    const params = slugs.map(slug => ({ slug }))
    expect(params).toHaveLength(7)
    params.forEach(p => {
      expect(typeof p.slug).toBe('string')
      expect(p.slug.length).toBeGreaterThan(0)
    })
  })
})

// ─── getArticleBySlug ─────────────────────────────────────────────────────────

describe('getArticleBySlug', () => {
  it('returns the article for every known slug', () => {
    for (const slug of KNOWN_SLUGS) {
      const article = getArticleBySlug(slug)
      expect(article).toBeDefined()
      expect(article?.slug).toBe(slug)
    }
  })

  it('returns undefined for an unknown slug', () => {
    expect(getArticleBySlug('does-not-exist')).toBeUndefined()
  })

  it('returns undefined for an empty string slug', () => {
    expect(getArticleBySlug('')).toBeUndefined()
  })

  it('returned article matches the slug', () => {
    const slug = 'orchestration-is-the-new-compute'
    const article = getArticleBySlug(slug)
    expect(article?.slug).toBe(slug)
    expect(article?.title.length).toBeGreaterThan(0)
  })
})

// ─── getAllMeta ───────────────────────────────────────────────────────────────

describe('getAllMeta', () => {
  it('returns an array of the same length as allArticles', () => {
    expect(getAllMeta()).toHaveLength(allArticles.length)
  })

  it('strips the content field from each meta object', () => {
    const metas = getAllMeta()
    for (const meta of metas) {
      expect('content' in meta).toBe(false)
    }
  })

  it('preserves slug, title, excerpt, category, tags, readTime', () => {
    const metas = getAllMeta()
    for (const meta of metas) {
      expect(typeof meta.slug).toBe('string')
      expect(typeof meta.title).toBe('string')
      expect(typeof meta.excerpt).toBe('string')
      expect(typeof meta.category).toBe('string')
      expect(Array.isArray(meta.tags)).toBe(true)
      expect(typeof meta.readTime).toBe('number')
    }
  })
})

// ─── getArticlesByCategory ────────────────────────────────────────────────────

describe('getArticlesByCategory', () => {
  it('returns only articles matching the given category', () => {
    const categories = ['opinion', 'research', 'essays', 'news'] as const
    for (const category of categories) {
      const articles = getArticlesByCategory(category)
      articles.forEach(a => expect(a.category).toBe(category))
    }
  })

  it('total articles across all categories equals allArticles.length', () => {
    const total =
      getArticlesByCategory('opinion').length +
      getArticlesByCategory('research').length +
      getArticlesByCategory('essays').length +
      getArticlesByCategory('news').length
    expect(total).toBe(allArticles.length)
  })
})

// ─── getFeaturedArticle ───────────────────────────────────────────────────────

describe('getFeaturedArticle', () => {
  it('returns an article or undefined (never throws)', () => {
    expect(() => getFeaturedArticle()).not.toThrow()
  })

  it('if an article is returned, it has featured = true', () => {
    const featured = getFeaturedArticle()
    if (featured) {
      expect(featured.featured).toBe(true)
    }
  })
})

// ─── getRelatedArticles ───────────────────────────────────────────────────────

describe('getRelatedArticles', () => {
  it('returns at most the requested limit', () => {
    const related = getRelatedArticles('orchestration-is-the-new-compute', 3)
    expect(related.length).toBeLessThanOrEqual(3)
  })

  it('never includes the source article in related results', () => {
    for (const slug of KNOWN_SLUGS) {
      const related = getRelatedArticles(slug, 5)
      expect(related.find(r => r.slug === slug)).toBeUndefined()
    }
  })

  it('strips content from related article metas', () => {
    const related = getRelatedArticles('orchestration-is-the-new-compute', 3)
    for (const meta of related) {
      expect('content' in meta).toBe(false)
    }
  })

  it('returns empty array for unknown slug', () => {
    const related = getRelatedArticles('unknown-slug', 3)
    expect(related).toHaveLength(0)
  })

  it('respects limit=1', () => {
    const related = getRelatedArticles('orchestration-is-the-new-compute', 1)
    expect(related.length).toBeLessThanOrEqual(1)
  })

  it('default limit is 3', () => {
    const related = getRelatedArticles('orchestration-is-the-new-compute')
    expect(related.length).toBeLessThanOrEqual(3)
  })
})
