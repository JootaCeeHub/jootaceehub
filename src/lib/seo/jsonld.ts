/**
 * JSON-LD structured data builders.
 * Schema.org Article / TechArticle for journal + research pages.
 *
 * Usage:
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(article, { locale, canonicalUrl })) }}
 *   />
 */

import type { Article, ArticleCategory } from '@/lib/content/loaders'
import { CATEGORY_DISPLAY } from '@/lib/content/loaders'
import { defaultMeta } from '@/lib/config/brand'

// ── Constants ────────────────────────────────────────────────────────────────

const PERSON = {
  '@type': 'Person',
  name: 'JootaCee',
  url: defaultMeta.canonicalBase,
  sameAs: [
    'https://github.com/JootaCee',
    'https://twitter.com/jootacee',
    'https://linkedin.com/in/jootacee',
  ],
} as const

const ORGANIZATION = {
  '@type': 'Organization',
  name: 'JootaCee',
  url: defaultMeta.canonicalBase,
  logo: {
    '@type': 'ImageObject',
    url: `${defaultMeta.canonicalBase}/icon-512x512.png`,
    width: 512,
    height: 512,
  },
} as const

// Research-grade categories get TechArticle; opinion/news stay Article
const TECH_CATEGORIES: ArticleCategory[] = ['research', 'essays']

function schemaType(category: ArticleCategory) {
  return TECH_CATEGORIES.includes(category) ? 'TechArticle' : 'Article'
}

// ISO 8601 duration from minutes: 5 → "PT5M"
function isoDuration(minutes: number): string {
  if (minutes < 60) return `PT${minutes}M`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ArticleJsonLdOptions {
  locale: string
  canonicalUrl: string
  /** Per-article OG image URL. Falls back to default if not yet generated. */
  ogImageUrl?: string
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildArticleJsonLd(
  article: Article | (Omit<Article, 'content'> & { content?: string }),
  { locale, canonicalUrl, ogImageUrl }: ArticleJsonLdOptions
): Record<string, unknown> {
  const imageUrl = ogImageUrl ?? `${defaultMeta.canonicalBase}/og/${article.slug}.png`
  const fallbackImageUrl = `${defaultMeta.canonicalBase}${defaultMeta.ogImage}`

  const image = {
    '@type': 'ImageObject',
    url: imageUrl,
    fallbackUrl: fallbackImageUrl,
    width: 1200,
    height: 630,
  }

  return {
    '@context': 'https://schema.org',
    '@type': schemaType(article.category),

    // Core
    headline: article.title,
    description: article.excerpt,
    ...(article.abstract ? { abstract: article.abstract } : {}),

    // Dates
    datePublished: article.date,
    dateModified: article.date,

    // Author / publisher
    author: PERSON,
    publisher: ORGANIZATION,

    // Identity
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },

    // Media
    image,

    // Taxonomy
    keywords: article.tags.join(', '),
    articleSection: CATEGORY_DISPLAY[article.category] ?? article.category,
    inLanguage: locale === 'es' ? 'es' : 'en',

    // Engagement
    timeRequired: isoDuration(article.readTime),

    // Tags as itemList (helps Google Surface)
    ...(article.tags.length > 0
      ? {
          about: article.tags.map((tag) => ({
            '@type': 'Thing',
            name: tag,
          })),
        }
      : {}),
  }
}

// ── BreadcrumbList builder ────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  href: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.href.startsWith('http')
        ? item.href
        : `${defaultMeta.canonicalBase}${item.href}`,
    })),
  }
}
