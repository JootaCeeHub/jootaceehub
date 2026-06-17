import { DomainLayout } from '@/components/layout/DomainLayout'
import { JournalHeader } from '@/components/journal/JournalHeader'
import { ArticleCard } from '@/components/journal/ArticleCard'
import { StaggerReveal } from '@/components/shared/ScrollReveal'
import { getAllMeta, getFeaturedArticle } from '@/lib/journal/articles'
export default function JournalPage() {
  const featured = getFeaturedArticle()
  const all = getAllMeta()
  const recent = all.filter((a) => !a.featured)

  return (
    <DomainLayout>
      <JournalHeader activeCategory="all" />

      {featured && (
        <section className="mb-10">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Featured</p>
          <ArticleCard article={featured} featured />
        </section>
      )}

      <section>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-primary">Recent Articles</p>
        <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </StaggerReveal>
      </section>
    </DomainLayout>
  )
}
