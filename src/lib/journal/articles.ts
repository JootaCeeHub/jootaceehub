// Server-only module — uses Node.js `fs` to read .mdx files at build time.
// All consumers (generateStaticParams, server-component pages) run in Node.js
// context during `next build`, so this is safe for static export.
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import type { Article, ArticleCategory, ArticleMeta } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'src/content/journal')

// Built once — reused for every article. Synchronous pipeline: no async plugins.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeHighlight)
  .use(rehypeStringify, { allowDangerousHtml: true })

function markdownToHtml(markdown: string): string {
  return String(processor.processSync(markdown))
}

function loadAllArticles(): Article[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8')
    const { data, content } = matter(raw)

    return {
      slug:     data.slug     as string,
      title:    data.title    as string,
      excerpt:  data.excerpt  as string,
      abstract: data.abstract as string | undefined,
      date:     data.date     as string,
      category: data.category as ArticleCategory,
      depth:    data.depth    as Article['depth'] | undefined,
      series:   data.series   as string | undefined,
      tags:     (data.tags    as string[]) ?? [],
      readTime: data.readTime as number,
      featured: (data.featured as boolean | undefined) ?? false,
      // Convert MDX markdown to HTML at load time so ArticleLayout can use
      // dangerouslySetInnerHTML directly. GFM + syntax highlighting applied here.
      content:  markdownToHtml(content),
    } satisfies Article
  })
}

// Eagerly load and sort once at module initialisation (build time).
export const allArticles: Article[] = loadAllArticles().sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)

export function getAllMeta(): ArticleMeta[] {
  return allArticles.map(({ content: _content, ...meta }) => meta)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return allArticles.find((a) => a.slug === slug)
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return allArticles.filter((a) => a.category === category)
}

export function getFeaturedArticle(): Article | undefined {
  return allArticles.find((a) => a.featured)
}

export function getAllSlugs(): string[] {
  return allArticles.map((a) => a.slug)
}

export function getRelatedArticles(slug: string, limit = 3): ArticleMeta[] {
  const current = allArticles.find((a) => a.slug === slug)
  if (!current) return []

  const candidates = allArticles.filter((a) => a.slug !== slug)

  const scored = candidates.map((a) => {
    const tagOverlap   = a.tags.filter((t) => current.tags.includes(t)).length
    const sameCategory = a.category === current.category ? 2 : 0
    const sameSeries   = a.series && a.series === current.series ? 3 : 0
    return { article: a, score: tagOverlap + sameCategory + sameSeries }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article: { content: _content, ...meta } }) => meta)
}
