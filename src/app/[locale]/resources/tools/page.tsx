'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
type Pricing = 'Free' | 'Freemium' | 'Paid' | 'OSS'

type Category =
  | 'All'
  | 'AI & LLM'
  | 'CLI & DevOps'
  | 'APIs & Data'
  | 'Monitoring'
  | 'Testing'
  | 'UI Components'
  | 'State Management'
  | 'Auth'
  | 'Storage'
  | 'Search'
  | 'Queue & Jobs'
  | 'Feature Flags'

interface Tool {
  name: string
  description: string
  category: Exclude<Category, 'All'>
  url: string
  pricing: Pricing
}

const tools: Tool[] = [
  // AI & LLM
  { name: 'Claude API',    description: "Anthropic's production-grade LLM API — optimized for reasoning, coding, and long-context tasks.",                                        category: 'AI & LLM',    url: 'https://anthropic.com/api',             pricing: 'Paid' },
  { name: 'OpenAI API',    description: 'GPT-4o, embeddings, and function calling. The industry baseline for LLM integration.',                                                   category: 'AI & LLM',    url: 'https://platform.openai.com',           pricing: 'Paid' },
  { name: 'LangChain',     description: 'Framework for composable LLM application chains — agents, retrievers, and tool use.',                                                     category: 'AI & LLM',    url: 'https://langchain.com',                 pricing: 'OSS' },
  { name: 'Ollama',        description: 'Run large language models locally with a simple CLI and REST API. Zero cloud cost.',                                                       category: 'AI & LLM',    url: 'https://ollama.com',                    pricing: 'Free' },
  { name: 'n8n',           description: 'Visual workflow automation with 400+ integrations. Self-hostable and extendable with code nodes.',                                         category: 'AI & LLM',    url: 'https://n8n.io',                        pricing: 'OSS' },
  { name: 'Groq',          description: 'Ultra-fast LLM inference API. Llama, Gemma, and Mixtral at 800+ tok/s. Best for latency-sensitive features.',                             category: 'AI & LLM',    url: 'https://groq.com',                      pricing: 'Freemium' },
  { name: 'Together AI',   description: 'Open-source LLM inference with fine-tuning. 100+ models including Llama 3 and Mistral at competitive pricing.',                           category: 'AI & LLM',    url: 'https://together.ai',                   pricing: 'Paid' },
  { name: 'Replicate',     description: 'Run ML models via API. Stable Diffusion, Whisper, and thousands of community models with versioned deployments.',                          category: 'AI & LLM',    url: 'https://replicate.com',                 pricing: 'Paid' },
  // CLI & DevOps
  { name: 'Bun',           description: 'Fast all-in-one JavaScript runtime, bundler, test runner, and package manager.',                                                           category: 'CLI & DevOps', url: 'https://bun.sh',                        pricing: 'OSS' },
  { name: 'Turso',         description: 'Edge SQLite database globally distributed. SQL with low-latency reads at the network edge.',                                               category: 'CLI & DevOps', url: 'https://turso.tech',                    pricing: 'Freemium' },
  { name: 'Railway',       description: 'Zero-config cloud deployments for any language. Push code, Railway handles the rest.',                                                     category: 'CLI & DevOps', url: 'https://railway.app',                   pricing: 'Freemium' },
  { name: 'Fly.io',        description: 'Deploy Docker containers at the edge in 30+ regions. Persistent volumes and Postgres included.',                                           category: 'CLI & DevOps', url: 'https://fly.io',                        pricing: 'Freemium' },
  { name: 'Doppler',       description: 'Secrets management and environment variable sync across all environments and team members.',                                                category: 'CLI & DevOps', url: 'https://doppler.com',                   pricing: 'Freemium' },
  { name: 'Kamal',         description: 'Deploy web apps anywhere with Docker. Zero-downtime deploys via SSH. From Basecamp — no Kubernetes required.',                             category: 'CLI & DevOps', url: 'https://kamal-deploy.org',              pricing: 'OSS' },
  { name: 'Coolify',       description: 'Open-source, self-hosted Heroku/Netlify alternative. Deploy any app from Git to your VPS in minutes.',                                     category: 'CLI & DevOps', url: 'https://coolify.io',                    pricing: 'OSS' },
  { name: 'Turbo',         description: 'High-performance build system for JS/TS monorepos. Incremental builds, remote caching, and parallel task execution.',                      category: 'CLI & DevOps', url: 'https://turbo.build',                   pricing: 'OSS' },
  // APIs & Data
  { name: 'Supabase',      description: 'Open-source Firebase alternative built on PostgreSQL. Auth, storage, realtime, and edge functions.',                                       category: 'APIs & Data',  url: 'https://supabase.com',                  pricing: 'Freemium' },
  { name: 'Upstash',       description: 'Serverless Redis and Kafka. Pay per request. Ideal for rate limiting, queues, and pub/sub.',                                               category: 'APIs & Data',  url: 'https://upstash.com',                   pricing: 'Freemium' },
  { name: 'Resend',        description: 'Developer-first transactional email API built for modern stacks. React email templates included.',                                          category: 'APIs & Data',  url: 'https://resend.com',                    pricing: 'Freemium' },
  { name: 'Stripe',        description: 'Payments infrastructure for the internet — subscriptions, invoicing, and payout automation.',                                              category: 'APIs & Data',  url: 'https://stripe.com',                    pricing: 'Paid' },
  { name: 'Neon',          description: 'Serverless Postgres with branching. Scale to zero, instant start, and full compatibility with Prisma/Drizzle.',                            category: 'APIs & Data',  url: 'https://neon.tech',                     pricing: 'Freemium' },
  { name: 'PlanetScale',   description: 'MySQL-compatible serverless database with non-blocking schema changes, branching workflow, and horizontal sharding.',                      category: 'APIs & Data',  url: 'https://planetscale.com',               pricing: 'Freemium' },
  { name: 'Trigger.dev',   description: 'Background jobs for modern TypeScript apps. Long-running tasks, cron jobs, and event-driven workflows with retries.',                     category: 'APIs & Data',  url: 'https://trigger.dev',                   pricing: 'OSS' },
  // Monitoring
  { name: 'Sentry',        description: 'Error tracking and performance monitoring. Catch regressions before users report them.',                                                   category: 'Monitoring',   url: 'https://sentry.io',                     pricing: 'Freemium' },
  { name: 'PostHog',       description: 'Open-source product analytics. Session recording, feature flags, and A/B testing in one SDK.',                                            category: 'Monitoring',   url: 'https://posthog.com',                   pricing: 'OSS' },
  { name: 'Axiom',         description: 'Logs and observability at any scale. Query petabytes of data with APL in seconds.',                                                        category: 'Monitoring',   url: 'https://axiom.co',                      pricing: 'Freemium' },
  { name: 'Better Stack',  description: 'Uptime monitoring, log management, and incident management. 30s check intervals, status pages, and on-call escalation.',                  category: 'Monitoring',   url: 'https://betterstack.com',               pricing: 'Freemium' },
  { name: 'OpenTelemetry', description: 'Vendor-neutral observability framework. Traces, metrics, and logs with a single instrumentation SDK.',                                     category: 'Monitoring',   url: 'https://opentelemetry.io',              pricing: 'OSS' },
  // Testing
  { name: 'Playwright',    description: 'End-to-end testing for modern web apps. Cross-browser, parallel, and with built-in auto-wait for reliable assertions.',                    category: 'Testing',      url: 'https://playwright.dev',                pricing: 'OSS' },
  { name: 'Vitest',        description: 'Vite-native unit testing with Jest compatibility. Blazing fast, ESM-first, and co-located with your source files.',                        category: 'Testing',      url: 'https://vitest.dev',                    pricing: 'OSS' },
  { name: 'MSW',           description: 'API mocking via Service Workers. Intercept requests at the network layer — no more wrapping fetch in test helpers.',                       category: 'Testing',      url: 'https://mswjs.io',                      pricing: 'OSS' },
  { name: 'Testing Library', description: 'UI testing utilities that test behavior over implementation. Works with React, Vue, Angular, and plain DOM.',                            category: 'Testing',      url: 'https://testing-library.com',           pricing: 'OSS' },
  { name: 'Faker.js',      description: 'Generate massive amounts of realistic fake data for tests and seeds. Locale-aware, TypeScript-first.',                                     category: 'Testing',      url: 'https://fakerjs.dev',                   pricing: 'OSS' },
  { name: 'k6',            description: 'Developer-centric load testing tool. Script in JavaScript, run locally or in the cloud, get actionable reports.',                         category: 'Testing',      url: 'https://k6.io',                         pricing: 'OSS' },
  // UI Components
  { name: 'Radix UI',      description: 'Unstyled, accessible component primitives. Dialog, Dropdown, Popover — ARIA-compliant with zero visual opinions.',                         category: 'UI Components', url: 'https://radix-ui.com',                 pricing: 'OSS' },
  { name: 'shadcn/ui',     description: 'Copy-paste component library built on Radix + Tailwind. Own your code — not a npm dependency.',                                            category: 'UI Components', url: 'https://ui.shadcn.com',                pricing: 'OSS' },
  { name: 'Headless UI',   description: 'Accessible, unstyled UI components from Tailwind Labs. React and Vue. Pairs perfectly with TailwindCSS.',                                  category: 'UI Components', url: 'https://headlessui.com',               pricing: 'OSS' },
  { name: 'Mantine',       description: 'Full-featured React component library with 100+ components. Built-in dark mode, form management, and hooks.',                              category: 'UI Components', url: 'https://mantine.dev',                  pricing: 'OSS' },
  { name: 'Ark UI',        description: 'Unstyled, accessible components powered by state machines (XState/Zag). Framework-agnostic primitives.',                                   category: 'UI Components', url: 'https://ark-ui.com',                   pricing: 'OSS' },
  { name: 'Vaul',          description: 'Drawer component for React. Smooth snap points, drag-to-close, and zero layout shift. Built by emilkowalski.',                             category: 'UI Components', url: 'https://vaul.emilkowal.ski',           pricing: 'OSS' },
  // State Management
  { name: 'Jotai',         description: 'Primitive and flexible state management for React. Atoms composable like useState, no extra boilerplate.',                                  category: 'State Management', url: 'https://jotai.org',                pricing: 'OSS' },
  { name: 'Zustand',       description: 'Lightweight, unopinionated state management. Minimal API, no providers needed, and excellent DevTools support.',                           category: 'State Management', url: 'https://zustand-demo.pmnd.rs',      pricing: 'OSS' },
  { name: 'TanStack Query', description: 'Powerful async state management for data fetching, caching, synchronization, and background updates.',                                    category: 'State Management', url: 'https://tanstack.com/query',         pricing: 'OSS' },
  { name: 'XState',        description: 'State machines and statecharts for complex UI flows. Formal modeling prevents impossible states.',                                           category: 'State Management', url: 'https://xstate.js.org',             pricing: 'OSS' },
  { name: 'Valtio',        description: 'Proxy-based state management. Mutate state directly, subscriptions are automatic via Proxy traps.',                                        category: 'State Management', url: 'https://valtio.pmnd.rs',            pricing: 'OSS' },
  { name: 'Legend-State',  description: 'Extremely fast reactive state with fine-grained observability. 2x smaller bundle than Zustand, persists out of the box.',                 category: 'State Management', url: 'https://legendapp.com/open-source/state', pricing: 'OSS' },
  // Auth
  { name: 'Auth.js',       description: 'NextAuth.js v5 — authentication for the web. 60+ OAuth providers, database sessions, and edge-compatible JWT strategy.',                  category: 'Auth',         url: 'https://authjs.dev',                    pricing: 'OSS' },
  { name: 'Lucia Auth',    description: 'Session-based auth library. Handles sessions, adapters, and OAuth. No magic — just TypeScript primitives.',                                category: 'Auth',         url: 'https://lucia-auth.com',                pricing: 'OSS' },
  { name: 'Better Auth',   description: 'Framework-agnostic auth with built-in rate limiting, 2FA, teams, and passkeys. Production-ready from day one.',                            category: 'Auth',         url: 'https://better-auth.com',               pricing: 'OSS' },
  { name: 'Clerk',         description: 'Complete user management: auth, MFA, OAuth, orgs, and RBAC. React components + backend SDK. Drop-in user system.',                        category: 'Auth',         url: 'https://clerk.com',                     pricing: 'Freemium' },
  { name: 'Kinde',         description: 'Enterprise-grade auth with generous free tier. SSO, MFA, permissions, and B2B organizations built in.',                                    category: 'Auth',         url: 'https://kinde.com',                     pricing: 'Freemium' },
  { name: 'Stack Auth',    description: 'Open-source Clerk alternative. Auth, team management, and API keys. Self-host or managed cloud.',                                          category: 'Auth',         url: 'https://stack-auth.com',                pricing: 'OSS' },
  // Storage
  { name: 'Cloudflare R2', description: 'S3-compatible object storage with zero egress fees. Workers integration for edge transformations.',                                         category: 'Storage',      url: 'https://cloudflare.com/r2',             pricing: 'Freemium' },
  { name: 'AWS S3',        description: 'Industry-standard object storage. Virtually unlimited scale, lifecycle policies, and rich SDK support.',                                    category: 'Storage',      url: 'https://aws.amazon.com/s3',             pricing: 'Paid' },
  { name: 'UploadThing',   description: 'File uploads for Next.js. Type-safe server + client SDK. Handles presigned URLs, validation, and CDN delivery.',                          category: 'Storage',      url: 'https://uploadthing.com',               pricing: 'Freemium' },
  { name: 'Uploadcare',    description: 'File uploads with built-in image transformations, CDN, virus scanning, and widget UI.',                                                    category: 'Storage',      url: 'https://uploadcare.com',                pricing: 'Freemium' },
  { name: 'MinIO',         description: 'Self-hosted S3-compatible object storage. Run it on Kubernetes or bare metal with high-throughput performance.',                           category: 'Storage',      url: 'https://min.io',                        pricing: 'OSS' },
  { name: 'Tigris',        description: 'Globally distributed object storage built on Fly.io. S3 API, edge-native, zero egress.',                                                  category: 'Storage',      url: 'https://www.tigrisdata.com',            pricing: 'Freemium' },
  // Search
  { name: 'Meilisearch',   description: 'Lightning-fast search engine. Typo-tolerance, facets, synonyms. Self-host in minutes or use managed cloud.',                              category: 'Search',       url: 'https://meilisearch.com',               pricing: 'OSS' },
  { name: 'Typesense',     description: 'Open-source instant search. Powered by C++, sub-50ms response times, vector search, and geo-filtering.',                                  category: 'Search',       url: 'https://typesense.org',                 pricing: 'OSS' },
  { name: 'Algolia',       description: 'Hosted search with instant results, typo tolerance, and rich filtering out of the box.',                                                   category: 'Search',       url: 'https://algolia.com',                   pricing: 'Freemium' },
  { name: 'Elasticsearch', description: 'Distributed search and analytics engine. Full-text, structured, and vector search at scale.',                                              category: 'Search',       url: 'https://elastic.co',                    pricing: 'OSS' },
  { name: 'Orama',         description: 'Fully in-memory full-text, vector, and hybrid search engine. Works in Node, Bun, Deno, and the browser.',                                 category: 'Search',       url: 'https://orama.com',                     pricing: 'OSS' },
  // Queue & Jobs
  { name: 'BullMQ',        description: 'Premium queue and job scheduler for Node.js. Built on Redis — priority queues, rate limiting, and flow producers.',                       category: 'Queue & Jobs', url: 'https://bullmq.io',                     pricing: 'OSS' },
  { name: 'Inngest',       description: 'Background jobs, scheduled functions, and multi-step workflows. Zero infrastructure, built-in retries and observability.',                 category: 'Queue & Jobs', url: 'https://inngest.com',                   pricing: 'Freemium' },
  { name: 'QStash',        description: 'HTTP-based message queue from Upstash. Publish messages, schedule jobs, and fan-out to multiple consumers.',                              category: 'Queue & Jobs', url: 'https://upstash.com/qstash',            pricing: 'Freemium' },
  { name: 'Temporal',      description: 'Workflow orchestration platform. Write workflows as code with automatic retries, versioning, and state persistence.',                      category: 'Queue & Jobs', url: 'https://temporal.io',                   pricing: 'OSS' },
  // Feature Flags
  { name: 'GrowthBook',    description: 'Open-source feature flags and A/B testing. Bayesian stats, SDKs for every stack, self-hostable.',                                         category: 'Feature Flags', url: 'https://growthbook.io',                pricing: 'OSS' },
  { name: 'Flagsmith',     description: 'Open-source feature flag service. Segment users, schedule rollouts, and manage remote config. Self-host or cloud.',                       category: 'Feature Flags', url: 'https://flagsmith.com',                pricing: 'OSS' },
  { name: 'LaunchDarkly',  description: 'Enterprise feature management platform. Targeting rules, progressive rollouts, experimentation, and approvals.',                          category: 'Feature Flags', url: 'https://launchdarkly.com',             pricing: 'Paid' },
  { name: 'Unleash',       description: 'Open-source feature toggle service. Strategy-based targeting, variant experiments, and rich SDK ecosystem.',                              category: 'Feature Flags', url: 'https://unleash.io',                   pricing: 'OSS' },
  { name: 'OpenFeature',   description: 'CNCF standard for feature flagging. Vendor-neutral SDK that works with any provider — avoid lock-in.',                                    category: 'Feature Flags', url: 'https://openfeature.dev',              pricing: 'OSS' },
]

type AllCategory = Exclude<Category, 'All'>

const categories: Category[] = [
  'All', 'AI & LLM', 'CLI & DevOps', 'APIs & Data', 'Monitoring',
  'Testing', 'UI Components', 'State Management', 'Auth', 'Storage', 'Search', 'Queue & Jobs', 'Feature Flags',
]

const allCategories: AllCategory[] = [
  'AI & LLM', 'CLI & DevOps', 'APIs & Data', 'Monitoring',
  'Testing', 'UI Components', 'State Management', 'Auth', 'Storage', 'Search', 'Queue & Jobs', 'Feature Flags',
]

const grouped = allCategories.reduce<Record<AllCategory, Tool[]>>((acc, cat) => {
  acc[cat] = tools.filter(t => t.category === cat)
  return acc
}, {} as Record<AllCategory, Tool[]>)

const stackCombos = [
  {
    name: 'Next.js SaaS Starter',
    description: 'The modern full-stack SaaS baseline. Authentication, payments, email, and error tracking out of the box.',
    tools: [
      { name: 'Next.js', url: 'https://nextjs.org' },
      { name: 'Vercel', url: 'https://vercel.com' },
      { name: 'Supabase', url: 'https://supabase.com' },
      { name: 'Stripe', url: 'https://stripe.com' },
      { name: 'Clerk', url: 'https://clerk.com' },
      { name: 'Resend', url: 'https://resend.com' },
      { name: 'Sentry', url: 'https://sentry.io' },
    ],
  },
  {
    name: 'AI Application',
    description: 'Build production AI features with long-running jobs, vector memory, and caching.',
    tools: [
      { name: 'Next.js', url: 'https://nextjs.org' },
      { name: 'Claude API', url: 'https://anthropic.com/api' },
      { name: 'LangChain', url: 'https://langchain.com' },
      { name: 'Upstash', url: 'https://upstash.com' },
      { name: 'Trigger.dev', url: 'https://trigger.dev' },
      { name: 'Neon', url: 'https://neon.tech' },
    ],
  },
  {
    name: 'Fullstack TypeScript API',
    description: 'Lean server-side stack with end-to-end type safety, edge-ready SQLite, and structured validation.',
    tools: [
      { name: 'Bun', url: 'https://bun.sh' },
      { name: 'Hono', url: 'https://hono.dev' },
      { name: 'Drizzle', url: 'https://orm.drizzle.team' },
      { name: 'Turso', url: 'https://turso.tech' },
      { name: 'Zod', url: 'https://zod.dev' },
      { name: 'tRPC', url: 'https://trpc.io' },
      { name: 'Better Auth', url: 'https://better-auth.com' },
    ],
  },
  {
    name: 'Edge-First Stack',
    description: 'Deploy globally with zero cold starts. Everything runs at the edge.',
    tools: [
      { name: 'CF Workers', url: 'https://workers.cloudflare.com' },
      { name: 'Hono', url: 'https://hono.dev' },
      { name: 'KV', url: 'https://cloudflare.com/kv' },
      { name: 'R2', url: 'https://cloudflare.com/r2' },
      { name: 'D1', url: 'https://cloudflare.com/d1' },
      { name: 'Durable Objects', url: 'https://cloudflare.com/durable-objects' },
      { name: 'Queues', url: 'https://cloudflare.com/queues' },
    ],
  },
]

const pricingClass: Record<Pricing, string> = {
  Free: "shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400",
  Freemium: "shrink-0 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-sky-400",
  Paid: "shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber-400",
  OSS: "shrink-0 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-violet-400",
}

export default function ResourcesToolsPage() {
  const [active, setActive] = useState<Category>('All')

  const sectionsToRender: AllCategory[] = active === 'All'
    ? allCategories
    : [active as AllCategory]

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / Tools
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Developer Tools.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Curated tools that make the difference — from AI APIs and edge databases to deployment platforms,
          UI primitives, authentication, search engines, and job queues.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={active === cat ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary cursor-pointer" : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-all hover:border-primary/40 hover:text-primary cursor-pointer"}
          >
            {cat}
          </button>
        ))}
      </div>

      {sectionsToRender.map((cat, si) => (
        <div key={cat}>
          <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >{cat}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[cat].map((tool, i) => (
              <ScrollReveal key={tool.name} delay={(si * 5 + i) * 0.04}>
                <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] hover:border-white/15" >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{tool.name}</span>
                      <span className={pricingClass[tool.pricing]}>{tool.pricing}</span>
                    </div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-white/20 transition-colors group-hover:text-primary/60"
                      aria-label={`Open ${tool.name}`}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      ))}

      {/* Recommended Stack Combos */}
      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Recommended Stack Combos</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stackCombos.map((combo, i) => (
          <ScrollReveal key={combo.name} delay={i * 0.07}>
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-5 transition-all hover:border-primary/25 hover:bg-primary/[0.07]" >
              <p className="mb-1 text-sm font-bold text-white">{combo.name}</p>
              <p className="mb-4 text-xs text-muted-foreground leading-relaxed">{combo.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {combo.tools.map((t) => (
                  <a
                    key={t.name}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-primary/25 bg-primary/8 px-2.5 py-1 font-mono text-[10px] text-primary/80 transition-colors hover:border-primary/50 hover:text-primary" >
                    {t.name}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </DomainLayout>
  )
}
