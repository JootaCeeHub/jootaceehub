import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { ArticleLayout } from '@/components/journal/ArticleLayout'
import { getArticleBySlug, getAllSlugs, getRelatedArticles } from '@/lib/journal/articles'
import { CATEGORY_DISPLAY } from '@/lib/journal/types'
import { defaultMeta } from '@/lib/config/brand'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonld'
interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  const locales = ['en', 'es']
  const slugs = getAllSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return { title: 'Article Not Found | JootaCee Journal' }
  }

  const categoryLabel = CATEGORY_DISPLAY[article.category] ?? article.category
  const title = `${article.title} | JootaCee Journal`
  const canonicalUrl = `${defaultMeta.canonicalBase}/${locale}/journal/${slug}`
  const ogImageUrl = `${defaultMeta.canonicalBase}/og/${slug}.png`

  return {
    title,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${defaultMeta.canonicalBase}/en/journal/${slug}`,
        es: `${defaultMeta.canonicalBase}/es/journal/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: 'JootaCee',
      type: 'article',
      publishedTime: article.date,
      authors: ['JootaCee'],
      tags: article.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${article.title} — JootaCee Journal`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: defaultMeta.twitterHandle,
      creator: defaultMeta.twitterHandle,
      title: article.title,
      description: article.excerpt,
      images: [ogImageUrl],
    },
    other: {
      'article:section': categoryLabel,
      'article:tag': article.tags.join(', '),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const related = getRelatedArticles(slug, 3)
  const canonicalUrl = `${defaultMeta.canonicalBase}/${locale}/journal/${slug}`
  const ogImageUrl = `${defaultMeta.canonicalBase}/og/${slug}.png`

  const articleJsonLd = buildArticleJsonLd(article, { locale, canonicalUrl, ogImageUrl })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', href: `/${locale}` },
    { name: 'Journal', href: `/${locale}/journal` },
    { name: article.title, href: `/${locale}/journal/${slug}` },
  ])

  return (
    <DomainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <ArticleLayout article={article} backHref="journal" related={related} />
      </div>
    </DomainLayout>
  )
}
