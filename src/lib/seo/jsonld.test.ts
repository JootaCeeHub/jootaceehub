import { describe, it, expect } from 'vitest'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from './jsonld'
import type { Article } from '@/lib/content/loaders'

const BASE_ARTICLE: Article = {
  slug:     'test-article',
  title:    'Test Article',
  excerpt:  'A short excerpt about the test.',
  date:     '2026-01-15',
  category: 'research',
  tags:     ['ai', 'typescript'],
  readTime: 8,
  content:  'Full article body here.',
}

const OPTS = { locale: 'en', canonicalUrl: 'https://jootacee.com/en/journal/test-article' }

describe('buildArticleJsonLd', () => {
  it('includes @context and @type fields', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBeTruthy()
  })

  it('assigns TechArticle for research category', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld['@type']).toBe('TechArticle')
  })

  it('assigns TechArticle for essays category', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, category: 'essays' }, OPTS)
    expect(ld['@type']).toBe('TechArticle')
  })

  it('assigns Article for opinion category', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, category: 'opinion' }, OPTS)
    expect(ld['@type']).toBe('Article')
  })

  it('assigns Article for news category', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, category: 'news' }, OPTS)
    expect(ld['@type']).toBe('Article')
  })

  it('sets headline from article title', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.headline).toBe(BASE_ARTICLE.title)
  })

  it('sets description from excerpt', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.description).toBe(BASE_ARTICLE.excerpt)
  })

  it('sets the canonical url', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.url).toBe(OPTS.canonicalUrl)
  })

  it('sets inLanguage from locale', () => {
    const en = buildArticleJsonLd(BASE_ARTICLE, { ...OPTS, locale: 'en' })
    const es = buildArticleJsonLd(BASE_ARTICLE, { ...OPTS, locale: 'es' })
    expect(en.inLanguage).toBe('en')
    expect(es.inLanguage).toBe('es')
  })

  it('encodes timeRequired as ISO 8601 duration', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.timeRequired).toBe('PT8M')
  })

  it('encodes 75-minute read time correctly', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, readTime: 75 }, OPTS)
    expect(ld.timeRequired).toBe('PT1H15M')
  })

  it('encodes exactly 60-minute read time correctly', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, readTime: 60 }, OPTS)
    expect(ld.timeRequired).toBe('PT1H')
  })

  it('joins tags as comma-separated keywords', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.keywords).toBe('ai, typescript')
  })

  it('includes about items for each tag', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    const about = ld.about as { '@type': string; name: string }[]
    expect(Array.isArray(about)).toBe(true)
    expect(about).toHaveLength(2)
    expect(about[0]).toEqual({ '@type': 'Thing', name: 'ai' })
  })

  it('omits about when tags is empty', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, tags: [] }, OPTS)
    expect(ld.about).toBeUndefined()
  })

  it('uses provided ogImageUrl when given', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, { ...OPTS, ogImageUrl: 'https://cdn.example.com/og.png' })
    const image = ld.image as { url: string }
    expect(image.url).toBe('https://cdn.example.com/og.png')
  })

  it('includes abstract when present in article', () => {
    const ld = buildArticleJsonLd({ ...BASE_ARTICLE, abstract: 'Technical summary.' }, OPTS)
    expect(ld.abstract).toBe('Technical summary.')
  })

  it('omits abstract when not present', () => {
    const ld = buildArticleJsonLd(BASE_ARTICLE, OPTS)
    expect(ld.abstract).toBeUndefined()
  })
})

describe('buildBreadcrumbJsonLd', () => {
  const CRUMBS = [
    { name: 'Home',    href: '/' },
    { name: 'Journal', href: '/en/journal' },
    { name: 'Article', href: '/en/journal/test-article' },
  ]

  it('emits BreadcrumbList schema', () => {
    const ld = buildBreadcrumbJsonLd(CRUMBS)
    expect(ld['@type']).toBe('BreadcrumbList')
    expect(ld['@context']).toBe('https://schema.org')
  })

  it('includes one item per crumb with 1-based positions', () => {
    const ld = buildBreadcrumbJsonLd(CRUMBS)
    const items = ld.itemListElement as { '@type': string; position: number; name: string; item: string }[]
    expect(items).toHaveLength(3)
    expect(items[0].position).toBe(1)
    expect(items[1].position).toBe(2)
    expect(items[2].position).toBe(3)
  })

  it('prepends canonical base to relative hrefs', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'Home', href: '/' }])
    const items = ld.itemListElement as { item: string }[]
    expect(items[0].item).toMatch(/^https?:\/\//)
  })

  it('leaves absolute hrefs unchanged', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'External', href: 'https://external.com/page' }])
    const items = ld.itemListElement as { item: string }[]
    expect(items[0].item).toBe('https://external.com/page')
  })
})
