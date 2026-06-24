import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ArticleLayout } from '@/components/journal/ArticleLayout'
import { getArticleBySlug, getAllSlugs, getRelatedArticles } from '@/lib/content/loaders'
import { CATEGORY_DISPLAY } from '@/lib/content/loaders'
import { defaultMeta } from '@/lib/config/brand'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonld'
export function generateStaticParams() {
  const locales = ['en', 'es']
  const slugs = getAllSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}

  const categoryLabel = CATEGORY_DISPLAY[article.category] ?? article.category
  const canonicalUrl = `${defaultMeta.canonicalBase}/${locale}/research/${slug}`
  const ogImageUrl = `${defaultMeta.canonicalBase}/og/${slug}.png`

  return {
    title: `${article.title} | JootaCee Research`,
    description: article.abstract ?? article.excerpt,
    keywords: article.tags.join(', '),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${defaultMeta.canonicalBase}/en/research/${slug}`,
        es: `${defaultMeta.canonicalBase}/es/research/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.abstract ?? article.excerpt,
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
          alt: `${article.title} — JootaCee Research`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: defaultMeta.twitterHandle,
      creator: defaultMeta.twitterHandle,
      title: article.title,
      description: article.abstract ?? article.excerpt,
      images: [ogImageUrl],
    },
    other: {
      'article:section': categoryLabel,
      'article:tag': article.tags.join(', '),
    },
  }
}

export default async function ResearchArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const related = getRelatedArticles(slug)
  const canonicalUrl = `${defaultMeta.canonicalBase}/${locale}/research/${slug}`
  const ogImageUrl = `${defaultMeta.canonicalBase}/og/${slug}.png`

  const articleJsonLd = buildArticleJsonLd(article, { locale, canonicalUrl, ogImageUrl })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', href: `/${locale}` },
    { name: 'Research', href: `/${locale}/research` },
    { name: article.title, href: `/${locale}/research/${slug}` },
  ])

  return (
    <div className="relative min-h-screen bg-[#060610]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="absolute right-0 bottom-1/3 h-[400px] w-[400px] rounded-full bg-sky-500/4 blur-[120px]" />
      </div>

      <Navigation />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 lg:px-6">
        <ArticleLayout article={article} backHref="research" related={related} />
      </main>

      <Footer />
    </div>
  )
}
