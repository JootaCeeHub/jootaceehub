import type { GitHubIntelligence } from '@/lib/github/types'

// Static timestamp — must NOT use new Date() to avoid SSR/client hydration mismatch.
// Update manually when refreshing data.
const GENERATED_AT = '2026-05-28T00:00:00.000Z'

export const mockGitHubIntelligence: GitHubIntelligence = {
  revision: 'phase-5-github-intelligence',
  generatedAt: GENERATED_AT,
  source: 'mock',
  profile: {
    username: 'JootaCee',
    displayName: 'JootaCee',
    bio: 'AI Systems Architect. Building autonomous infrastructures, multi-agent orchestration, and modular digital ecosystems.',
    location: 'Europe',
    url: 'https://github.com/JootaCee',
    avatarUrl: 'https://github.com/JootaCee.png',
    followers: 148,
    following: 62,
    publicRepos: 18,
  },
  repositories: [
    {
      name: 'aura-core',
      description:
        'Multi-model AI orchestration runtime with persistent graph memory. Routes, arbitrates, and coordinates Claude, GPT-4, and Gemini through a unified MCP-compliant tool layer.',
      stars: 312,
      forks: 54,
      language: 'TypeScript',
      languageColor: '#3178C6',
      status: 'active',
      updatedAt: '3 hours ago',
      href: 'https://github.com/JootaCee/aura-core',
      commitVelocity: '26 commits/week',
    },
    {
      name: 'trading-intelligence',
      description:
        'Multi-signal AI execution engine for systematic markets. Combines LSTM price prediction, momentum analysis, and risk-adjusted position sizing into a unified pipeline.',
      stars: 187,
      forks: 38,
      language: 'Python',
      languageColor: '#3572A5',
      status: 'active',
      updatedAt: '1 day ago',
      href: 'https://github.com/JootaCee/trading-intelligence',
      commitVelocity: '14 commits/week',
    },
    {
      name: 'stl-generator',
      description:
        'Natural language to production-ready 3D geometry. Translates structured prompts into parametric meshes via an LLM parsing layer and geometry synthesis engine.',
      stars: 94,
      forks: 21,
      language: 'Python',
      languageColor: '#3572A5',
      status: 'active',
      updatedAt: '2 days ago',
      href: 'https://github.com/JootaCee/stl-generator',
      commitVelocity: '9 commits/week',
    },
    {
      name: 'crm-intelligence',
      description:
        'AI-first pipeline intelligence with autonomous lead qualification, deal-risk analysis, and revenue forecasting. Built for data-driven sales teams.',
      stars: 76,
      forks: 14,
      language: 'TypeScript',
      languageColor: '#3178C6',
      status: 'active',
      updatedAt: '3 days ago',
      href: 'https://github.com/JootaCee/crm-intelligence',
      commitVelocity: '11 commits/week',
    },
    {
      name: 'jootacee-hub',
      description:
        'Personal digital headquarters — Next.js 16 static site with custom i18n, headless CMS admin panel, React Three Fiber, and full PWA support.',
      stars: 43,
      forks: 8,
      language: 'TypeScript',
      languageColor: '#3178C6',
      status: 'active',
      updatedAt: '5 hours ago',
      href: 'https://github.com/JootaCee/jootacee-hub',
      commitVelocity: '19 commits/week',
    },
  ],
  totalStars: 712,
  totalForks: 135,
  commitsLast30d: 247,
  recentReleases: [
    { repository: 'aura-core', tagName: 'v2.1.0', publishedAt: '2026-05-22', url: 'https://github.com/JootaCee/aura-core/releases/tag/v2.1.0' },
    { repository: 'trading-intelligence', tagName: 'v0.4.1', publishedAt: '2026-05-19', url: 'https://github.com/JootaCee/trading-intelligence/releases/tag/v0.4.1' },
    { repository: 'stl-generator', tagName: 'v0.2.3', publishedAt: '2026-05-15', url: 'https://github.com/JootaCee/stl-generator/releases/tag/v0.2.3' },
    { repository: 'crm-intelligence', tagName: 'v0.3.0', publishedAt: '2026-05-12', url: 'https://github.com/JootaCee/crm-intelligence/releases/tag/v0.3.0' },
  ],
  deployments: [
    { repository: 'aura-core', environment: 'production', state: 'success', updatedAt: '2026-05-28T08:14:00Z' },
    { repository: 'trading-intelligence', environment: 'staging', state: 'success', updatedAt: '2026-05-27T22:45:00Z' },
    { repository: 'stl-generator', environment: 'production', state: 'success', updatedAt: '2026-05-27T18:30:00Z' },
    { repository: 'crm-intelligence', environment: 'staging', state: 'pending', updatedAt: '2026-05-28T09:02:00Z' },
  ],
  activity: [
    { date: '2026-05-22', commits: 8 },
    { date: '2026-05-23', commits: 11 },
    { date: '2026-05-24', commits: 6 },
    { date: '2026-05-25', commits: 14 },
    { date: '2026-05-26', commits: 9 },
    { date: '2026-05-27', commits: 12 },
    { date: '2026-05-28', commits: 7 },
  ],
}
