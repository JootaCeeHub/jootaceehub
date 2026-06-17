'use client'

import { Activity, Code2, ExternalLink, GitFork, Rocket, Star, Tag } from 'lucide-react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollReveal, StaggerReveal } from '@/components/shared/ScrollReveal'
import { HoverCard3D } from '@/components/shared/HoverCard3D'
import { useGitHubIntelligence } from '@/hooks/useGitHubIntelligence'
import { useTranslations } from '@/lib/i18n/context'
import { SectionExploreCta } from '@/components/shared/SectionExploreCta'

export function GitHubSection() {
  const { data, source } = useGitHubIntelligence()
  const t = useTranslations('github')

  if (!data) return null

  const maxCommits = Math.max(...data.activity.map((point) => point.commits), 1)

  return (
    <section id="github" className="relative py-24">
      <div className="container mx-auto px-6">
        <SectionHeader
          badge={t('badge') as string}
          title={t('integrationTitle') as string}
          description={t('integrationDescription') as string}
        />

        <StaggerReveal className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('stats.totalStars') as string}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{data.totalStars}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('stats.totalForks') as string}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{data.totalForks}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('stats.commits30d') as string}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{data.commitsLast30d}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{t('stats.source') as string}</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-primary">{source}</p>
          </div>
        </StaggerReveal>

        <StaggerReveal className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.repositories.map((repo) => (
            <HoverCard3D key={repo.name} intensity={5}>
              <Card variant="glass" className="h-full">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-2.5">
                      <Code2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.14em] text-primary">{repo.status}</span>
                  </div>
                  <CardTitle className="text-lg">{repo.name}</CardTitle>
                  <CardDescription>{repo.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {repo.stars}</span>
                    <span className="flex items-center gap-1"><GitFork className="h-4 w-4" /> {repo.forks}</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: repo.languageColor }} />
                      {repo.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> {repo.commitVelocity}</span>
                    <span>Updated {repo.updatedAt}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <a href={repo.href} target="_blank" rel="noreferrer" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      {t('openRepository') as string}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </HoverCard3D>
          ))}
        </StaggerReveal>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ScrollReveal>
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Commit Activity</p>
              <div className="space-y-2">
                {data.activity.map((point) => (
                  <div key={point.date} className="grid grid-cols-[90px_1fr_36px] items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{point.date.slice(5)}</span>
                    <div className="h-2 rounded-full bg-secondary/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-200"
                        style={{ width: `${(point.commits / maxCommits) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-foreground">{point.commits}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Recent Releases</p>
              <div className="space-y-2">
                {data.recentReleases.map((release) => (
                  <a
                    key={`${release.repository}-${release.tagName}`}
                    href={release.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-border bg-card/55 p-3 hover:border-primary/35"
                  >
                    <p className="flex items-center gap-1 text-sm font-semibold text-foreground"><Tag className="h-3.5 w-3.5 text-primary" /> {release.tagName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{release.repository} · {release.publishedAt.slice(0, 10)}</p>
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="glass rounded-2xl p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">Deployments</p>
              <div className="space-y-2">
                {data.deployments.map((deployment) => (
                  <div key={`${deployment.repository}-${deployment.environment}`} className="rounded-lg border border-border bg-card/55 p-3">
                    <p className="flex items-center gap-1 text-sm font-semibold text-foreground"><Rocket className="h-3.5 w-3.5 text-primary" /> {deployment.repository}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{deployment.environment} · {deployment.state}</p>
                    <p className="text-[11px] text-muted-foreground">{deployment.updatedAt.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
        <SectionExploreCta domainHref="/github" label="GitHub" statusLabel="Repository intelligence" />
      </div>
    </section>
  )
}
