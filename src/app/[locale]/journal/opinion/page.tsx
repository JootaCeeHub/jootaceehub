import { DomainLayout } from '@/components/layout/DomainLayout'
import { JournalHeader } from '@/components/journal/JournalHeader'
import { ArticleCard } from '@/components/journal/ArticleCard'
import { StaggerReveal } from '@/components/shared/ScrollReveal'
import { getAllMeta } from '@/lib/journal/articles'
export default function OpinionPage() {
  const meta = getAllMeta().filter((a) => a.category === 'opinion')

  return (
    <DomainLayout>
      <JournalHeader activeCategory="opinion" />
      {meta.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No opinion articles yet.</p>
      ) : (
        <StaggerReveal className="grid gap-4 sm:grid-cols-2">
          {meta.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </StaggerReveal>
      )}
    </DomainLayout>
  )
}
