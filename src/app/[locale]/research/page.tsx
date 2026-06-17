import { getAllMeta, getFeaturedArticle } from '@/lib/journal/articles'
import ResearchPageClient from './ResearchPageClient'

export default function ResearchPage() {
  const allMeta = getAllMeta()
  const featuredArticle = getFeaturedArticle()
  // Strip the content field — client component only needs metadata
  const featured = featuredArticle
    ? (({ content: _c, ...meta }) => meta)(featuredArticle)
    : null

  return <ResearchPageClient allMeta={allMeta} featured={featured} />
}
