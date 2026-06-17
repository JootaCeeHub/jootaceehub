// ─── Shared resource data ─────────────────────────────────────────────────────
// Single source of truth for all resource page data.
// Import from here in both page files AND admin ContentPanel.

// ─── Tools ───────────────────────────────────────────────────────────────────

export type Pricing = 'Free' | 'Freemium' | 'Paid' | 'OSS'

export type ToolCategory =
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

export interface Tool {
  name: string
  description: string
  category: ToolCategory
  url: string
  pricing: Pricing
}

export const tools: Tool[] = [
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

export const stackCombos = [
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

// ─── Repos ────────────────────────────────────────────────────────────────────

export type RepoCategory = 'TypeScript' | 'Python' | 'Go/Rust' | 'AI/LLM' | 'MCP' | 'Starters' | 'Learning'

export interface Repo {
  org: string
  name: string
  description: string
  learn: string
  lang: string
  stars: string
  url: string
  category: RepoCategory
}

export const repos: Repo[] = [
  // TypeScript
  {
    org: 'microsoft', name: 'TypeScript', description: 'TypeScript language specification and compiler. Superset of JavaScript that adds static types.',
    learn: 'Read the source to understand how types are resolved, narrowed, and erased. Invaluable for debugging complex generic constraints.',
    lang: 'TypeScript', stars: '101k', url: 'https://github.com/microsoft/TypeScript', category: 'TypeScript',
  },
  {
    org: 'vercel', name: 'next.js', description: 'The React framework for production. App Router, RSC, static export, and edge runtime.',
    learn: 'Study how App Router implements Server Components, streaming SSR, and the static export pipeline — essential context for any Next.js debugging.',
    lang: 'TypeScript', stars: '128k', url: 'https://github.com/vercel/next.js', category: 'TypeScript',
  },
  {
    org: 'shadcn-ui', name: 'ui', description: 'Beautifully designed components using Radix UI and Tailwind CSS. Copy-paste, not a dependency.',
    learn: 'See how to wrap Radix primitives with good accessibility defaults and variant-based styling. The recommended pattern for building your own design system.',
    lang: 'TypeScript', stars: '82k', url: 'https://github.com/shadcn-ui/ui', category: 'TypeScript',
  },
  {
    org: 'pmndrs', name: 'zustand', description: 'Lightweight, unopinionated state management for React. Bear necessities only.',
    learn: 'The entire implementation is ~1k lines. Learn how Proxy and subscribe work, and how to build middleware (immer, devtools, persist) from scratch.',
    lang: 'TypeScript', stars: '50k', url: 'https://github.com/pmndrs/zustand', category: 'TypeScript',
  },
  {
    org: 'colinhacks', name: 'zod', description: 'TypeScript-first schema validation with static type inference. Zero dependencies.',
    learn: 'Understand how TypeScript conditional types and inference are used to derive static types from runtime schemas — a masterclass in advanced generics.',
    lang: 'TypeScript', stars: '35k', url: 'https://github.com/colinhacks/zod', category: 'TypeScript',
  },
  {
    org: 'trpc', name: 'trpc', description: 'End-to-end typesafe APIs without code generation. Full-stack TypeScript with zero overhead.',
    learn: 'Deep-dive into how tRPC uses inference to propagate server types to the client without codegen. Patterns apply to any cross-boundary type sharing.',
    lang: 'TypeScript', stars: '35k', url: 'https://github.com/trpc/trpc', category: 'TypeScript',
  },
  {
    org: 'prisma', name: 'prisma', description: 'Next-generation ORM for Node.js and TypeScript. Auto-completion, type safety, and migrations.',
    learn: 'Study the schema-to-types pipeline and how Prisma Client generates fully-typed query builders from a declarative schema definition.',
    lang: 'TypeScript', stars: '41k', url: 'https://github.com/prisma/prisma', category: 'TypeScript',
  },
  {
    org: 'n8n-io', name: 'n8n', description: 'Fair-code licensed workflow automation tool. 400+ integrations, extendable with custom nodes.',
    learn: 'Understand how to design extensible plugin systems with typed node interfaces, credential management, and execution contexts.',
    lang: 'TypeScript', stars: '51k', url: 'https://github.com/n8n-io/n8n', category: 'TypeScript',
  },
  {
    org: 'drizzle-team', name: 'drizzle-orm', description: 'Headless TypeScript ORM. SQL-like syntax, inferred types, and a powerful migration toolkit.',
    learn: 'See how to model a SQL query builder with full TypeScript inference — join types, selected columns, and nullability all propagate through the type system.',
    lang: 'TypeScript', stars: '25k', url: 'https://github.com/drizzle-team/drizzle-orm', category: 'TypeScript',
  },
  {
    org: 'electric-sql', name: 'pglite', description: 'PostgreSQL running in WebAssembly. Full Postgres in the browser or Node.js, with zero server needed.',
    learn: 'Learn how to compile C-based systems to WebAssembly with Emscripten, and how to wrap them in ergonomic TypeScript async APIs.',
    lang: 'TypeScript', stars: '11k', url: 'https://github.com/electric-sql/pglite', category: 'TypeScript',
  },
  {
    org: 'react-hook-form', name: 'react-hook-form', description: 'Performant, flexible form library with zero re-renders on change. Integrates with Zod for schema validation.',
    learn: 'How to avoid unnecessary re-renders in React by using uncontrolled inputs and ref-based subscriptions instead of state for every keystroke.',
    lang: 'TypeScript', stars: '42k', url: 'https://github.com/react-hook-form/react-hook-form', category: 'TypeScript',
  },
  // Python
  {
    org: 'langchain-ai', name: 'langchain', description: 'Build applications with LLMs through composability — chains, agents, retrievers, and memory.',
    learn: 'Understand the LCEL (LangChain Expression Language) composition model and how to build reusable, type-annotated AI pipelines.',
    lang: 'Python', stars: '96k', url: 'https://github.com/langchain-ai/langchain', category: 'Python',
  },
  {
    org: 'anthropics', name: 'anthropic-sdk-python', description: 'Official Python SDK for the Claude API. Sync and async, streaming, tool use, and vision support.',
    learn: 'Learn idiomatic async Python SDK design patterns: transport abstraction, retry logic, streaming iterators, and typed response models.',
    lang: 'Python', stars: '3.8k', url: 'https://github.com/anthropics/anthropic-sdk-python', category: 'Python',
  },
  {
    org: 'pydantic', name: 'pydantic-ai', description: 'Production-grade agent framework built on Pydantic. Type-safe, testable, model-agnostic.',
    learn: 'How to build testable AI agents with dependency injection, structured output, and a result type system that works like a typed async function call.',
    lang: 'Python', stars: '8.4k', url: 'https://github.com/pydantic/pydantic-ai', category: 'Python',
  },
  {
    org: 'langchain-ai', name: 'langgraph', description: 'Build stateful multi-actor applications with LLMs. Cycles, controllability, and persistence baked in.',
    learn: 'Learn graph-based agent orchestration: how to model agent state as a typed dataclass and route execution through named edges with interrupts.',
    lang: 'Python', stars: '12k', url: 'https://github.com/langchain-ai/langgraph', category: 'Python',
  },
  {
    org: 'microsoft', name: 'autogen', description: 'Multi-agent conversation framework. Agents collaborate, debate, and solve tasks through chat.',
    learn: 'Patterns for structured agent-to-agent conversation, role assignment, and stopping conditions for multi-turn collaborative workflows.',
    lang: 'Python', stars: '38k', url: 'https://github.com/microsoft/autogen', category: 'Python',
  },
  {
    org: 'crewAIInc', name: 'crewAI', description: 'Framework for orchestrating role-playing autonomous AI agents. Define roles, goals, and backstories.',
    learn: 'How to assign roles, goals, and delegation policies to agents — the "crew" abstraction maps well to real business processes.',
    lang: 'Python', stars: '29k', url: 'https://github.com/crewAIInc/crewAI', category: 'Python',
  },
  {
    org: 'tiangolo', name: 'fastapi', description: 'Modern, fast web framework for building APIs with Python 3.8+ based on standard type hints.',
    learn: 'The gold standard for using Python type hints for automatic validation, serialization, and OpenAPI docs generation — essential patterns for any Python API.',
    lang: 'Python', stars: '80k', url: 'https://github.com/tiangolo/fastapi', category: 'Python',
  },
  {
    org: 'BerriAI', name: 'litellm', description: 'Call 100+ LLMs using the OpenAI format. One interface for Claude, GPT, Gemini, Llama, and more.',
    learn: 'How to build provider-agnostic LLM middleware with unified API surface, fallback routing, and cost tracking across providers.',
    lang: 'Python', stars: '18k', url: 'https://github.com/BerriAI/litellm', category: 'Python',
  },
  // Go/Rust
  {
    org: 'ollama', name: 'ollama', description: 'Get up and running with large language models locally. Llama, Mistral, Gemma, and more via REST API.',
    learn: 'How to wrap llama.cpp in a Go HTTP server with model lifecycle management, quantization selection, and a clean REST interface.',
    lang: 'Go', stars: '103k', url: 'https://github.com/ollama/ollama', category: 'Go/Rust',
  },
  {
    org: 'biomejs', name: 'biome', description: 'Fast formatter and linter for JavaScript and TypeScript. Replaces Prettier + ESLint, written in Rust.',
    learn: 'Study how to parse a language AST in Rust, walk it with visitors, and emit actionable diagnostics with source-level spans.',
    lang: 'Rust', stars: '17k', url: 'https://github.com/biomejs/biome', category: 'Go/Rust',
  },
  {
    org: 'oven-sh', name: 'bun', description: 'JavaScript runtime, bundler, test runner, and package manager — all in one incredibly fast toolkit.',
    learn: 'Architecture of a polyglot runtime: JavaScriptCore integration, native module resolution, and a Zig-based bundler pipeline.',
    lang: 'Zig', stars: '75k', url: 'https://github.com/oven-sh/bun', category: 'Go/Rust',
  },
  {
    org: 'tokio-rs', name: 'axum', description: 'Ergonomic and modular web framework built with Tokio and Tower. Zero-cost abstractions for async Rust HTTP.',
    learn: "How Rust's type system enforces request-response middleware composition via Tower's Service trait — no runtime overhead, all compile-time checked.",
    lang: 'Rust', stars: '20k', url: 'https://github.com/tokio-rs/axum', category: 'Go/Rust',
  },
  {
    org: 'launchbadge', name: 'sqlx', description: 'Async, pure Rust SQL crate with compile-time checked queries. Works with PostgreSQL, MySQL, and SQLite.',
    learn: 'Learn how proc macros can parse SQL at compile time and map query results to typed Rust structs without a code generator.',
    lang: 'Rust', stars: '13k', url: 'https://github.com/launchbadge/sqlx', category: 'Go/Rust',
  },
  // AI/LLM
  {
    org: 'anthropics', name: 'claude-code', description: 'Claude Code CLI — AI coding assistant in your terminal. Agentic with full file system access.',
    learn: 'How to build a CLI-based agentic tool: filesystem MCP integration, skill/slash-command loading, hook architecture, and context management.',
    lang: 'TypeScript', stars: '12k', url: 'https://github.com/anthropics/claude-code', category: 'AI/LLM',
  },
  {
    org: 'openai', name: 'openai-node', description: 'Official Node.js library for the OpenAI API. Streaming, tool use, structured outputs, and batch.',
    learn: 'Idiomatic TypeScript SDK patterns: discriminated union types for streaming events, retry-with-backoff, and async iterator wrapping.',
    lang: 'TypeScript', stars: '8.5k', url: 'https://github.com/openai/openai-node', category: 'AI/LLM',
  },
  {
    org: 'jxnl', name: 'instructor', description: 'Structured LLM outputs using Pydantic. Retry logic, validation, and multi-provider support.',
    learn: 'How to enforce structured output from LLMs via function calling + Pydantic, with automatic retry on validation failure.',
    lang: 'Python', stars: '10k', url: 'https://github.com/jxnl/instructor', category: 'AI/LLM',
  },
  {
    org: 'mem0ai', name: 'mem0', description: 'Intelligent memory layer for AI apps. Personalized memory across sessions for agents and chatbots.',
    learn: 'Architecture for persistent agent memory: entity extraction, vector storage, and retrieval strategies that keep context across conversation sessions.',
    lang: 'Python', stars: '26k', url: 'https://github.com/mem0ai/mem0', category: 'AI/LLM',
  },
  {
    org: 'dspy-ai', name: 'dspy', description: "Framework for algorithmically optimizing LM prompts and weights. Program, don't prompt.",
    learn: 'How to turn prompt engineering into a compilation problem: signatures, predictors, teleprompters, and metric-driven optimization.',
    lang: 'Python', stars: '22k', url: 'https://github.com/stanfordnlp/dspy', category: 'AI/LLM',
  },
  // MCP
  {
    org: 'modelcontextprotocol', name: 'servers', description: 'Official MCP server implementations: filesystem, GitHub, Postgres, Puppeteer, Brave Search, and more.',
    learn: 'The canonical reference for implementing MCP tools, resources, and prompts. Read the filesystem and GitHub servers first.',
    lang: 'TypeScript', stars: '9.2k', url: 'https://github.com/modelcontextprotocol/servers', category: 'MCP',
  },
  {
    org: 'modelcontextprotocol', name: 'typescript-sdk', description: 'The official TypeScript SDK for the Model Context Protocol. Build MCP servers and clients.',
    learn: 'How to implement the MCP wire protocol: JSON-RPC 2.0 over stdio/SSE, capability negotiation, and the request/response lifecycle.',
    lang: 'TypeScript', stars: '6.1k', url: 'https://github.com/modelcontextprotocol/typescript-sdk', category: 'MCP',
  },
  {
    org: 'jlowin', name: 'fastmcp', description: 'The fast, Pythonic way to build MCP servers. Decorator-based API for tools, resources, and prompts.',
    learn: 'How to use Python decorators and type hints to generate MCP-compliant JSON schemas automatically — zero boilerplate.',
    lang: 'Python', stars: '4.2k', url: 'https://github.com/jlowin/fastmcp', category: 'MCP',
  },
  // Starters
  {
    org: 't3-oss', name: 'create-t3-app', description: 'The best way to start a full-stack, typesafe Next.js app. Next.js + TypeScript + tRPC + Prisma + Tailwind.',
    learn: 'How to scaffold an opinionated but flexible fullstack template with environment validation, typesafe API, and database ORM wired together.',
    lang: 'TypeScript', stars: '26k', url: 'https://github.com/t3-oss/create-t3-app', category: 'Starters',
  },
  {
    org: 'vercel', name: 'nextjs-subscription-payments', description: 'Full-stack subscription SaaS with Next.js, Stripe, and Supabase. The definitive SaaS starter.',
    learn: 'Stripe Checkout + webhooks + Supabase auth integration pattern — the exact wiring you need for any subscription product.',
    lang: 'TypeScript', stars: '7.4k', url: 'https://github.com/vercel/nextjs-subscription-payments', category: 'Starters',
  },
  {
    org: 'alan2207', name: 'bulletproof-react', description: 'A simple, scalable, and powerful architecture for building production React applications.',
    learn: 'Feature-based folder structure, colocation patterns, and a full-stack demo that shows how to organize a non-trivial React app without pain.',
    lang: 'TypeScript', stars: '29k', url: 'https://github.com/alan2207/bulletproof-react', category: 'Starters',
  },
  {
    org: 'payloadcms', name: 'payload', description: 'TypeScript-first headless CMS and application framework built on Next.js.',
    learn: 'How to build a self-hosted CMS with collections, access control, hooks, and a generated Admin UI — all from a typed config object.',
    lang: 'TypeScript', stars: '30k', url: 'https://github.com/payloadcms/payload', category: 'Starters',
  },
  // Learning
  {
    org: 'trekhleb', name: 'javascript-algorithms', description: 'Algorithms and data structures implemented in JavaScript with explanations and links to further reading.',
    learn: 'Clean, commented implementations of every common algorithm — great for interview prep and understanding the Big-O of your daily code.',
    lang: 'JavaScript', stars: '188k', url: 'https://github.com/trekhleb/javascript-algorithms', category: 'Learning',
  },
  {
    org: 'donnemartin', name: 'system-design-primer', description: 'Learn how to design large-scale systems. Prep for the system design interview.',
    learn: 'How scalable systems handle tradeoffs between consistency, availability, and partition tolerance — mental models for any backend architecture decision.',
    lang: 'Python', stars: '280k', url: 'https://github.com/donnemartin/system-design-primer', category: 'Learning',
  },
  {
    org: 'kamranahmedse', name: 'developer-roadmap', description: 'Interactive roadmaps and guides to help developers choose their path and grow in their careers.',
    learn: 'A structured overview of what to learn at each stage. Use it to identify gaps in your knowledge and prioritize what to study next.',
    lang: 'TypeScript', stars: '305k', url: 'https://github.com/kamranahmedse/developer-roadmap', category: 'Learning',
  },
  {
    org: 'codecrafters-io', name: 'build-your-own-x', description: 'Master programming by recreating your favorite technologies from scratch.',
    learn: 'Build a Git, Docker, Redis, or SQLite from scratch. Nothing teaches you a technology faster than implementing it yourself.',
    lang: 'Markdown', stars: '310k', url: 'https://github.com/codecrafters-io/build-your-own-x', category: 'Learning',
  },
  {
    org: 'jwasham', name: 'coding-interview-university', description: 'A complete computer science study plan to become a software engineer.',
    learn: 'The exhaustive CS fundamentals checklist: data structures, algorithms, system design, operating systems. Systematic, battle-tested by thousands of engineers.',
    lang: 'Markdown', stars: '310k', url: 'https://github.com/jwasham/coding-interview-university', category: 'Learning',
  },
]

// ─── Workflows ────────────────────────────────────────────────────────────────

export type Complexity = 'Low' | 'Medium' | 'High'

export interface Workflow {
  title: string
  description: string
  stack: string[]
  complexity: Complexity
}

export const cicdWorkflows: Workflow[] = [
  {
    title: 'Typecheck + Lint + Test → Build → Lighthouse CI',
    description:
      'Three-stage GitHub Actions pipeline: quality gate (tsc, eslint, vitest) runs first; build job depends on quality passing; Lighthouse CI job audits the static export for performance, accessibility, and SEO regressions.',
    stack: ['GitHub Actions', 'Node 22', 'Vitest', 'Lighthouse CI', 'Next.js'],
    complexity: 'Medium',
  },
  {
    title: 'Docker Multi-stage Build with Layer Cache',
    description:
      'Uses BuildKit multi-stage Dockerfile — deps stage caches node_modules separately from the build stage. GitHub Actions cache action stores Docker layers between runs, cutting cold build time by 60–80%.',
    stack: ['Docker', 'BuildKit', 'GitHub Actions', 'Node.js'],
    complexity: 'Medium',
  },
  {
    title: 'Semantic Release with Changelog Generation',
    description:
      'Conventional Commits trigger semantic-release on merge to main. Automatically bumps semver, generates CHANGELOG.md, creates GitHub Release, and publishes to npm — zero manual version management.',
    stack: ['semantic-release', 'Conventional Commits', 'GitHub Actions', 'npm'],
    complexity: 'Low',
  },
]

export const n8nWorkflows: Workflow[] = [
  {
    title: 'GitHub Issue → Auto-label → Notify Slack',
    description:
      'Webhook triggers on issue open. GPT-4o classifies the issue type (bug/feature/docs). n8n applies the correct GitHub label via API and posts a formatted card to the #engineering Slack channel.',
    stack: ['n8n', 'GitHub API', 'OpenAI', 'Slack'],
    complexity: 'Low',
  },
  {
    title: 'RSS Feed → AI Summary → Telegram Channel',
    description:
      'Polls 5 tech RSS feeds every 6 hours. For each new item, Claude Haiku writes a 2-sentence summary with emoji. Deduplication via Redis. Posts to Telegram channel with source attribution.',
    stack: ['n8n', 'RSS', 'Claude API', 'Upstash Redis', 'Telegram'],
    complexity: 'Medium',
  },
  {
    title: 'CRM Lead → Enrich → Assign → Welcome Email',
    description:
      'New CRM lead triggers workflow. Clearbit enriches company data. Scoring logic assigns to sales rep based on company size and industry. Resend dispatches personalized welcome email with rep introduction.',
    stack: ['n8n', 'Clearbit', 'Resend', 'HubSpot'],
    complexity: 'High',
  },
  {
    title: 'Daily Metrics Digest → Email Report',
    description:
      'Runs every morning at 08:00 UTC. Pulls PostHog, GitHub, and Stripe metrics via HTTP nodes. Formats into a structured HTML report. Sends to founder inbox via Resend with key deltas highlighted.',
    stack: ['n8n', 'PostHog API', 'Stripe API', 'GitHub API', 'Resend'],
    complexity: 'Medium',
  },
  {
    title: 'New GitHub Star → Thank You Tweet (X)',
    description:
      'GitHub webhook fires on repository star. Fetches stargazer profile. Generates a personalized thank-you tweet with Claude Haiku. Posts via X API v2. Deduplication via Redis to prevent double-tweets.',
    stack: ['n8n', 'GitHub Webhook', 'Claude API', 'X API v2', 'Upstash Redis'],
    complexity: 'Medium',
  },
  {
    title: 'Nightly SEO Audit → Linear Issue Creator',
    description:
      'Runs at 02:00 UTC. Crawls the live site with Lighthouse CI. Parses results. For each failed check (score drop > 5%), creates a Linear issue with severity, affected URL, and fix suggestion generated by Claude.',
    stack: ['n8n', 'Lighthouse CI', 'Claude API', 'Linear API'],
    complexity: 'High',
  },
]

export const aiWorkflowPatterns: Workflow[] = [
  {
    title: 'RAG Pipeline: Ingest → Chunk → Embed → Retrieve → Generate',
    description:
      'Documents loaded and split into 512-token chunks with 64-token overlap. OpenAI text-embedding-3-small generates vectors stored in pgvector. At query time, top-k retrieval feeds context to the generation step with a structured system prompt.',
    stack: ['LangChain', 'pgvector', 'OpenAI Embeddings', 'PostgreSQL'],
    complexity: 'High',
  },
  {
    title: 'Multi-Agent Loop: Planner → Executor → Critic → Summarizer',
    description:
      'Planner breaks task into steps. Executor uses tool calls to carry each out. Critic evaluates output against acceptance criteria — loops back if needed. Summarizer produces the final structured response.',
    stack: ['Claude API', 'LangGraph', 'Tool Use', 'Python'],
    complexity: 'High',
  },
  {
    title: 'Document Classification Pipeline with Confidence Scoring',
    description:
      'Structured output forces JSON response with category, subcategory, and confidence 0–1. Documents below 0.7 confidence are queued for human review. High-confidence results route automatically to downstream workflows.',
    stack: ['Claude API', 'Zod', 'TypeScript', 'n8n'],
    complexity: 'Medium',
  },
  {
    title: 'Structured Output Pipeline with Zod Validation',
    description:
      'Force JSON output using tool_choice: tool + input schema derived from Zod. Validate at runtime with safeParse. Retry up to 3 times on validation failure — pass the Zod error back as user message for self-correction.',
    stack: ['Claude API', 'Zod', 'zodToJsonSchema', 'TypeScript'],
    complexity: 'Low',
  },
  {
    title: 'Streaming Agent with Real-Time UI Updates',
    description:
      'Use streaming API to show agent reasoning in real time. Parse stream chunks for tool_use blocks. Execute tools mid-stream and inject results. React to tool output before final response arrives.',
    stack: ['Claude Streaming API', 'React', 'Server-Sent Events', 'Next.js'],
    complexity: 'High',
  },
]

// ─── Prompts ─────────────────────────────────────────────────────────────────

export type PromptFilterKey = 'System' | 'Task' | 'Meta' | 'DevOps' | 'Data' | 'Business'

export interface Prompt {
  title: string
  category: string
  filterKey: PromptFilterKey
  text: string
  models: string[]
}

export const systemPrompts: Prompt[] = [
  {
    title: 'Senior TypeScript Code Reviewer',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are a senior TypeScript engineer with 10+ years of experience. Review code for: (1) type safety — no any, proper generics, discriminated unions; (2) performance — unnecessary re-renders, unoptimized loops, missing memoization; (3) maintainability — naming clarity, single responsibility, test surface area. For each issue provide: severity (critical/major/minor), location, explanation, and corrected snippet.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
  },
  {
    title: 'Architecture Decision Advisor',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are a principal software architect. When evaluating a design decision, always structure your response as: (1) Decision summary; (2) Options considered with pros/cons table; (3) Recommended choice with explicit tradeoff rationale; (4) Implementation sketch; (5) Success metrics. Prioritize operational simplicity and reversibility over theoretical elegance.`,
    models: ['Claude 3 Opus', 'GPT-4o', 'Claude 3.5 Sonnet'],
  },
  {
    title: 'Technical Documentation Writer',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are a technical writer specializing in developer-facing documentation. Produce clear, accurate docs in this structure: Overview (1 paragraph), Prerequisites, Quick Start (copy-pasteable code), API Reference (parameters table, return types, error codes), Examples (at least 2 real-world use cases), Troubleshooting. Never use passive voice. Use present tense. Every code block must be complete and runnable.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Fullstack Code Generator',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are an expert fullstack engineer specializing in TypeScript, Next.js 15+, React 19, TailwindCSS v4, and Drizzle ORM. When generating code: (1) Always use TypeScript strict mode — no 'any', proper generics; (2) CSS via co-located .styles.ts files, never inline Tailwind in .tsx; (3) Server components by default, 'use client' only when needed; (4) Drizzle for all DB operations, Zod for validation; (5) Every component gets error boundaries; (6) All async operations have proper loading and error states. Output complete, runnable files with all imports.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'],
  },
  {
    title: 'Security-First Code Reviewer',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are a senior application security engineer. Review code exclusively for security issues following OWASP Top 10. For each finding provide: (1) Vulnerability class (e.g., A03:Injection); (2) CWE identifier; (3) Severity (Critical/High/Medium/Low/Info); (4) Exact vulnerable lines; (5) Attack scenario explaining how it could be exploited; (6) Fixed code; (7) Test case that validates the fix. Never comment on code style or non-security concerns.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'],
  },
  {
    title: 'Product Manager — PRD Writer',
    category: 'System Prompt',
    filterKey: 'System',
    text: `You are a senior product manager. When given a feature idea, produce a complete PRD structured as: (1) Problem Statement — user pain, current workaround, frequency; (2) Success Metrics — 3 measurable KPIs; (3) User Stories — in "As a [user], I want [goal], so that [benefit]" format; (4) Acceptance Criteria — MUST/SHOULD/MUST NOT per story; (5) Out of Scope — explicit non-goals; (6) Open Questions — ranked by blocking risk. Be precise. Avoid vague language like "improve" — quantify.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
]

export const taskPrompts: Prompt[] = [
  {
    title: 'Refactor for Readability',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Refactor the following code for maximum readability. Apply: early returns to reduce nesting, descriptive variable names that encode intent, extraction of complex conditions into named predicates, and removal of any dead code. Do NOT change external behavior. Show the refactored version followed by a bullet list of every change made and why.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
  },
  {
    title: 'Debug Root Cause Analysis',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Perform systematic root cause analysis on this bug. Follow this sequence: (1) Reproduce — identify the minimal conditions that trigger the issue; (2) Isolate — narrow to the exact code path responsible; (3) Explain — describe WHY the bug occurs at a mechanism level; (4) Fix — provide the corrected code; (5) Prevent — suggest a test or assertion that would catch this regression.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'API Design Review',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Review this API design for: REST/GraphQL/tRPC conventions, naming consistency, error handling completeness, versioning strategy, pagination approach, and security surface area. Rate each dimension 1–5 and explain. Finish with a prioritized list of changes ordered by impact/effort ratio.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'],
  },
  {
    title: 'Database Query Optimizer',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Analyze this SQL query for performance. Identify: missing indexes (include CREATE INDEX statements), N+1 patterns, full table scans, expensive JOINs, and subquery rewrite opportunities. For each issue provide the original clause, the problem, and the optimized version. Include EXPLAIN ANALYZE output interpretation if provided.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Data Migration Script Generator',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Given the source schema and target schema below, write a TypeScript migration script that: (1) Reads all rows from source (paginated at 1000 rows/batch); (2) Transforms each row to the target schema; (3) Validates transformed data with Zod before inserting; (4) Uses transactions — roll back the entire batch on any error; (5) Logs progress (batch N/total, elapsed time, error count); (6) Produces a migration report (rows processed, rows failed, duration). Use Drizzle ORM for both source and target.\n\nSource schema: [PASTE HERE]\nTarget schema: [PASTE HERE]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'E2E Test Writer (Playwright)',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Write Playwright E2E tests for the following user flow. Requirements: (1) Use Page Object Model — one class per page; (2) Test happy path AND the 3 most likely failure modes; (3) Assert visible content, not implementation details; (4) Use data-testid attributes for selectors; (5) Mock all external API calls with page.route(); (6) Add retry logic for flaky network assertions; (7) Include a beforeAll fixture that seeds required test data.\n\nUser flow to test: [DESCRIBE FLOW]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Performance Bottleneck Finder',
    category: 'Task Prompt',
    filterKey: 'Task',
    text: `Analyze this code for performance issues. Check: (1) O(n²) or worse algorithms — propose O(n log n) or better; (2) Unnecessary re-renders in React (missing useMemo/useCallback, unstable reference identity); (3) Waterfall requests that could be parallelized with Promise.all; (4) Missing database indexes (examine all WHERE and JOIN clauses); (5) N+1 query patterns; (6) Synchronous operations that should be async. For each issue: show the problematic code, explain the performance cost, and provide the optimized version with a Big-O annotation.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
  },
]

export const metaPrompts: Prompt[] = [
  {
    title: 'Chain of Thought Activator',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `Before answering, think through this step by step. Show your reasoning explicitly: list your assumptions, work through the logic sequentially, identify potential failure points, then state your conclusion. Format each step as: [STEP N] <reasoning>. End with [CONCLUSION] <final answer>.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Opus'],
  },
  {
    title: 'Persona Calibrator',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `For this project you are [ROLE]. Your expertise spans [DOMAINS]. Your communication style is [STYLE: concise/technical/didactic]. You prioritize [VALUES]. When uncertain, you say so explicitly rather than confabulating. Maintain this persona consistently across the entire conversation.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Output Format Enforcer',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `Always respond in valid JSON matching this exact schema: { "summary": string, "confidence": number (0-1), "items": Array<{ "id": string, "content": string, "tags": string[] }>, "metadata": { "model": string, "timestamp": string } }. Do not include any text outside the JSON object. If you cannot produce valid JSON for any item, omit it rather than producing invalid output.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
  },
  {
    title: 'Few-Shot Example Injector',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `Before solving the main task, I will show you 3 examples of the exact input-output format expected. Study the pattern, then apply it to the real input.\n\nExample 1:\nInput: [EXAMPLE_INPUT_1]\nOutput: [EXAMPLE_OUTPUT_1]\n\nExample 2:\nInput: [EXAMPLE_INPUT_2]\nOutput: [EXAMPLE_OUTPUT_2]\n\nExample 3:\nInput: [EXAMPLE_INPUT_3]\nOutput: [EXAMPLE_OUTPUT_3]\n\nNow solve:\nInput: [REAL_INPUT]\nOutput:`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Opus'],
  },
  {
    title: 'Socratic Clarifier',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `Before attempting to answer or solve, ask me exactly 3 targeted clarifying questions — the 3 that would most change your approach if answered differently. After I respond, proceed with confidence. Do not ask more than 3 questions. Do not start solving before I answer.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Rubber Duck Debugger',
    category: 'Meta Prompt',
    filterKey: 'Meta',
    text: `I will explain my code and the bug to you as if you are a rubber duck — ask only clarifying questions, never suggest solutions. Force me to explain: (1) What the code is supposed to do; (2) What it actually does; (3) Where exactly it deviates; (4) What I have already tried. After I answer all four, you may offer one hypothesis.`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
]

export const devopsPrompts: Prompt[] = [
  {
    title: 'Incident Post-Mortem Generator',
    category: 'DevOps Prompt',
    filterKey: 'DevOps',
    text: `Generate a blameless incident post-mortem based on the incident timeline I will provide. Structure it as: (1) Incident Summary — one paragraph, impact, duration, affected users; (2) Timeline — chronological events with UTC timestamps; (3) Root Cause Analysis — use the 5 Whys technique; (4) Contributing Factors — non-root-cause factors that increased severity; (5) What Went Well — detection, communication, response; (6) Action Items — each with owner, priority (P0/P1/P2), and due date; (7) Lessons Learned — systemic improvements beyond the immediate fix. Tone: factual, blameless, forward-looking.\n\nIncident timeline: [PASTE HERE]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Infrastructure Cost Analysis',
    category: 'DevOps Prompt',
    filterKey: 'DevOps',
    text: `Analyze this cloud infrastructure configuration for cost optimization opportunities. For each resource: (1) Identify the current cost driver; (2) Propose a specific optimization (right-sizing, reserved instances, spot usage, architectural change); (3) Estimate monthly savings in USD; (4) Rate implementation risk (Low/Medium/High) and effort (hours). Prioritize by savings/effort ratio. Conclude with a top-5 actions list and projected total monthly savings.\n\nInfrastructure config: [PASTE TERRAFORM/CDK/YAML]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'],
  },
  {
    title: 'Security Audit Checklist Generator',
    category: 'DevOps Prompt',
    filterKey: 'DevOps',
    text: `Generate a security audit checklist tailored to this application stack. Cover: (1) Authentication & Authorization — JWT validation, session management, RBAC; (2) API Security — input validation, rate limiting, CORS, auth header checks; (3) Data Protection — encryption at rest, in transit, PII handling, backup encryption; (4) Infrastructure — network segmentation, IAM least privilege, secrets management, image scanning; (5) Dependency Hygiene — outdated packages, known CVEs, license compliance; (6) Observability — audit logging, alerting on auth failures, anomaly detection. Format as a checklist with Pass/Fail/N-A columns.\n\nStack: [DESCRIBE YOUR STACK]`,
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o'],
  },
]

export const dataPrompts: Prompt[] = [
  {
    title: 'Dataset Exploration and Statistical Summary',
    category: 'Data Analysis Prompt',
    filterKey: 'Data',
    text: `Perform a thorough exploratory data analysis on this dataset. Provide: (1) Shape — row count, column count, memory usage; (2) Schema — data types, nullable columns, unique value counts; (3) Missing Data — percentage missing per column, patterns (MCAR/MAR/MNAR assessment); (4) Distributions — mean, median, std, min, max, p25/p75/p95 for numerics; value counts for categoricals; (5) Outliers — IQR method findings for numeric columns; (6) Correlations — top 10 strongest Pearson/Spearman correlations; (7) Recommendations — top 3 data quality issues to fix before modeling.\n\nDataset sample or schema: [PASTE HERE]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
  },
  {
    title: 'SQL Query Optimizer and Explainer',
    category: 'Data Analysis Prompt',
    filterKey: 'Data',
    text: `Analyze this SQL query and provide: (1) Plain English explanation — what this query does in 2-3 sentences for a non-technical reader; (2) Execution plan walkthrough — what each clause does and in what order the database executes it; (3) Performance issues — identify full table scans, missing indexes, Cartesian products, or subquery inefficiencies; (4) Optimized rewrite — provide a faster version with comments explaining each change; (5) Recommended indexes — exact CREATE INDEX statements with justification; (6) Estimated improvement — rough speedup factor if the optimizations are applied.\n\nQuery: [PASTE SQL]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Data Pipeline Design Advisor',
    category: 'Data Analysis Prompt',
    filterKey: 'Data',
    text: `Design a data pipeline architecture for the following requirements. Produce: (1) Architecture diagram description — sources, ingestion layer, transformation layer, storage layer, serving layer; (2) Technology recommendations — specific tools for each layer with justification; (3) Data flow narrative — step-by-step data journey from source to consumer; (4) Reliability design — idempotency, exactly-once semantics, dead letter queues, schema evolution strategy; (5) Monitoring plan — what metrics to track, alert thresholds, and data quality checks; (6) Cost estimate — rough monthly cost at 1M, 100M, and 1B events/day.\n\nRequirements: [DESCRIBE YOUR USE CASE]`,
    models: ['Claude 3 Opus', 'Claude 3.5 Sonnet', 'GPT-4o'],
  },
]

export const businessPrompts: Prompt[] = [
  {
    title: 'Go-to-Market Strategy Builder',
    category: 'Business Prompt',
    filterKey: 'Business',
    text: `Build a go-to-market strategy for this product. Structure the output as: (1) ICP Definition — describe the Ideal Customer Profile with demographics, psychographics, job titles, company size, and pain points; (2) Positioning Statement — fill the template "For [ICP] who [problem], [Product] is a [category] that [key benefit]. Unlike [competitor], we [differentiator]"; (3) Channel Strategy — rank the top 3 acquisition channels with rationale and estimated CAC; (4) Launch Sequencing — Week 1-4 tactical plan; (5) Success Metrics — define the 90-day north star metric and leading indicators; (6) Competitive Moat — what makes this defensible in 12 months.\n\nProduct description: [DESCRIBE YOUR PRODUCT]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'],
  },
  {
    title: 'Competitive Analysis Framework',
    category: 'Business Prompt',
    filterKey: 'Business',
    text: `Conduct a structured competitive analysis for this market. Produce: (1) Competitor Matrix — table with columns: Competitor, Target Customer, Pricing, Key Features, Strengths, Weaknesses; (2) Feature Gap Analysis — features competitors have that we don't, and features we have that they don't; (3) Positioning Map — describe placement on 2 key axes (price vs features, or ease of use vs power); (4) Win/Loss Hypotheses — 3 scenarios where we win and 3 where we lose; (5) Strategic Recommendations — top 3 moves to improve competitive position in the next 6 months.\n\nOur product: [DESCRIBE]\nCompetitors to analyze: [LIST THEM]`,
    models: ['Claude 3.5 Sonnet', 'GPT-4o'],
  },
  {
    title: 'Product Requirements Document (PRD) Generator',
    category: 'Business Prompt',
    filterKey: 'Business',
    text: `Generate a complete PRD for this feature. Include: (1) Executive Summary — problem, solution, and why now (1 paragraph); (2) Background & Context — market data, user research insights, and strategic fit; (3) Goals & Non-Goals — explicit bullet list of both; (4) User Stories — at least 5, in "As a [persona], I want [capability] so that [outcome]" format; (5) Functional Requirements — numbered list, each starting with "The system SHALL..."; (6) Non-Functional Requirements — performance targets, security constraints, accessibility requirements; (7) UX Considerations — key user flows described in words; (8) Dependencies — other teams, APIs, or features this depends on; (9) Open Questions — unresolved decisions with owners; (10) Success Metrics — measurable outcomes at 30/60/90 days.\n\nFeature request: [DESCRIBE THE FEATURE]`,
    models: ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'GPT-4o'],
  },
]

export const allPrompts: Prompt[] = [
  ...systemPrompts, ...taskPrompts, ...metaPrompts, ...devopsPrompts, ...dataPrompts, ...businessPrompts,
]

// ─── MCP Servers ──────────────────────────────────────────────────────────────

export type McpCategory = 'official' | 'database' | 'productivity' | 'devops' | 'ai' | 'communication'

export interface McpServer {
  name: string
  category: McpCategory
  description: string
  install: string
  tools: string[]
  needs?: string[]
}

export const servers: McpServer[] = [
  // --- OFFICIAL ---
  {
    name: 'filesystem',
    category: 'official',
    description: 'Read, write, list, and manage local filesystem. Essential for any code-working agent.',
    install: 'npx @modelcontextprotocol/server-filesystem <path>',
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory', 'move_file', 'search_files'],
  },
  {
    name: 'brave-search',
    category: 'official',
    description: 'Real-time web search via Brave Search API. Returns titles, URLs, and snippets.',
    install: 'npx @modelcontextprotocol/server-brave-search',
    tools: ['brave_web_search', 'brave_local_search'],
    needs: ['BRAVE_API_KEY'],
  },
  {
    name: 'github',
    category: 'official',
    description: 'Full GitHub API — repos, files, commits, issues, PRs, branches.',
    install: 'npx @modelcontextprotocol/server-github',
    tools: ['search_repositories', 'get_file_contents', 'create_issue', 'list_commits', 'create_pull_request'],
    needs: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
  },
  {
    name: 'postgres',
    category: 'official',
    description: 'Execute queries, inspect schema, list tables on any PostgreSQL database.',
    install: 'npx @modelcontextprotocol/server-postgres <connection-string>',
    tools: ['query', 'list_tables', 'describe_table'],
  },
  {
    name: 'sqlite',
    category: 'official',
    description: 'Full SQLite read/write operations on local .db files.',
    install: 'npx @modelcontextprotocol/server-sqlite <path>',
    tools: ['read_query', 'write_query', 'create_table', 'list_tables'],
  },
  {
    name: 'puppeteer',
    category: 'official',
    description: 'Headless browser automation: navigate, screenshot, fill forms, extract DOM.',
    install: 'npx @modelcontextprotocol/server-puppeteer',
    tools: ['puppeteer_navigate', 'puppeteer_screenshot', 'puppeteer_click', 'puppeteer_fill', 'puppeteer_evaluate'],
  },
  {
    name: 'fetch',
    category: 'official',
    description: 'HTTP GET/POST requests. Web scraping, API calls, form submission.',
    install: 'npx @modelcontextprotocol/server-fetch',
    tools: ['fetch', 'fetch_post'],
  },
  {
    name: 'memory',
    category: 'official',
    description: 'Persistent knowledge graph with entities, relations, and observations.',
    install: 'npx @modelcontextprotocol/server-memory',
    tools: ['create_entities', 'create_relations', 'add_observations', 'read_graph', 'search_nodes'],
  },
  {
    name: 'sequential-thinking',
    category: 'official',
    description: 'Forces structured multi-step reasoning with branching.',
    install: 'npx @modelcontextprotocol/server-sequential-thinking',
    tools: ['sequentialthinking'],
  },
  // --- DATABASE ---
  {
    name: 'mysql',
    category: 'database',
    description: 'Execute queries, inspect schema, manage tables on any MySQL/MariaDB database.',
    install: 'npx @modelcontextprotocol/server-mysql <connection-string>',
    tools: ['query', 'list_tables', 'describe_table', 'execute'],
  },
  {
    name: 'mongodb',
    category: 'database',
    description: 'MongoDB CRUD operations, aggregation pipelines, index management, and collection listing.',
    install: 'npx mcp-server-mongodb <connection-string>',
    tools: ['find', 'insert', 'update', 'delete', 'aggregate', 'list_collections'],
  },
  {
    name: 'redis',
    category: 'database',
    description: 'Full Redis command set: strings, hashes, lists, sets, sorted sets, pub/sub, and key expiry.',
    install: 'npx mcp-server-redis',
    tools: ['redis_get', 'redis_set', 'redis_del', 'redis_hset', 'redis_lpush', 'redis_keys'],
    needs: ['REDIS_URL'],
  },
  {
    name: 'elasticsearch',
    category: 'database',
    description: 'Full-text search, index management, document CRUD, and cluster health on Elasticsearch/OpenSearch.',
    install: 'npx mcp-server-elasticsearch',
    tools: ['search', 'index_document', 'get_document', 'list_indices', 'cluster_health'],
    needs: ['ELASTICSEARCH_URL', 'ELASTICSEARCH_API_KEY'],
  },
  {
    name: 'supabase',
    category: 'database',
    description: 'Supabase database queries, storage, and auth operations.',
    install: 'npx mcp-server-supabase',
    tools: ['execute_sql', 'list_tables', 'get_storage_files'],
    needs: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
  },
  // --- PRODUCTIVITY ---
  {
    name: 'google-drive',
    category: 'productivity',
    description: 'List, read, create, update, and share files and folders in Google Drive.',
    install: 'npx @modelcontextprotocol/server-gdrive',
    tools: ['list_files', 'read_file', 'create_file', 'update_file', 'share_file'],
    needs: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    name: 'google-maps',
    category: 'productivity',
    description: 'Geocoding, route planning, place search, and distance matrix via Google Maps API.',
    install: 'npx @modelcontextprotocol/server-google-maps',
    tools: ['geocode', 'reverse_geocode', 'search_places', 'get_directions', 'distance_matrix'],
    needs: ['GOOGLE_MAPS_API_KEY'],
  },
  {
    name: 'obsidian',
    category: 'productivity',
    description: 'Read and write Obsidian vault notes, search by tag, list recent files, and manage frontmatter.',
    install: 'npx mcp-obsidian <vault-path>',
    tools: ['read_note', 'write_note', 'list_notes', 'search_notes', 'get_tags'],
  },
  {
    name: 'airtable',
    category: 'productivity',
    description: 'Read and write Airtable bases, tables, records, and fields. Schema introspection included.',
    install: 'npx mcp-airtable',
    tools: ['list_bases', 'list_tables', 'get_records', 'create_record', 'update_record'],
    needs: ['AIRTABLE_API_KEY'],
  },
  {
    name: 'notion',
    category: 'productivity',
    description: 'Read/write Notion pages, databases, blocks.',
    install: 'npx mcp-notion-server',
    tools: ['get_page', 'create_page', 'update_page', 'query_database'],
    needs: ['NOTION_API_KEY'],
  },
  {
    name: 'linear',
    category: 'productivity',
    description: 'Create, update, transition, and search Linear issues, cycles, and projects.',
    install: 'npx @linear/mcp-server',
    tools: ['create_issue', 'list_issues', 'update_issue', 'list_projects'],
    needs: ['LINEAR_API_KEY'],
  },
  {
    name: 'jira',
    category: 'productivity',
    description: 'Create, update, transition, and search Jira issues, sprints, and projects.',
    install: 'npx mcp-server-jira',
    tools: ['get_issue', 'create_issue', 'update_issue', 'transition_issue', 'search_issues', 'list_projects'],
    needs: ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  },
  // --- DEVOPS ---
  {
    name: 'git',
    category: 'devops',
    description: 'Local Git operations: status, diff, log, commit, branch, checkout, push, and merge.',
    install: 'npx @modelcontextprotocol/server-git --repository <path>',
    tools: ['git_status', 'git_diff', 'git_log', 'git_commit', 'git_branch', 'git_checkout'],
  },
  {
    name: 'docker',
    category: 'devops',
    description: 'Docker container lifecycle, log tailing, exec, image management, and network inspection.',
    install: 'npx mcp-server-docker',
    tools: ['list_containers', 'start_container', 'stop_container', 'get_logs', 'exec_in_container', 'list_images'],
  },
  {
    name: 'kubernetes',
    category: 'devops',
    description: 'Kubernetes cluster operations: pods, deployments, services, ConfigMaps, logs, and exec.',
    install: 'npx mcp-server-kubernetes',
    tools: ['list_pods', 'get_pod_logs', 'apply_manifest', 'delete_resource', 'get_deployments', 'exec_in_pod'],
    needs: ['KUBECONFIG'],
  },
  {
    name: 'cloudflare',
    category: 'devops',
    description: 'Manage Cloudflare Workers, KV namespaces, D1 databases, R2 buckets, and DNS records.',
    install: 'npx @cloudflare/mcp-server-cloudflare',
    tools: ['kv_get', 'kv_put', 'kv_delete', 'workers_list', 'd1_query', 'dns_list_records'],
    needs: ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  },
  {
    name: 'sentry',
    category: 'devops',
    description: 'Query Sentry for issues, events, releases, and performance data. Triage errors with AI.',
    install: 'npx mcp-server-sentry',
    tools: ['list_issues', 'get_issue', 'list_events', 'resolve_issue', 'list_releases'],
    needs: ['SENTRY_AUTH_TOKEN', 'SENTRY_ORG'],
  },
  // --- AI ---
  {
    name: 'tavily',
    category: 'ai',
    description: 'AI-optimized web search returning clean, structured results. Faster than raw HTML scraping.',
    install: 'npx tavily-mcp',
    tools: ['tavily_search', 'tavily_extract'],
    needs: ['TAVILY_API_KEY'],
  },
  {
    name: 'stripe',
    category: 'ai',
    description: 'Stripe customers, subscriptions, invoices, payments.',
    install: 'npx @stripe/agent-toolkit',
    tools: ['create_customer', 'list_subscriptions', 'create_invoice', 'retrieve_payment_intent'],
    needs: ['STRIPE_SECRET_KEY'],
  },
  {
    name: 'aws-kb-retrieval',
    category: 'ai',
    description: 'AWS Knowledge Base RAG — retrieve grounded context from Amazon Bedrock Knowledge Bases.',
    install: 'npx @modelcontextprotocol/server-aws-kb-retrieval-server',
    tools: ['retrieve'],
    needs: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'KNOWLEDGE_BASE_ID'],
  },
  {
    name: 'everything',
    category: 'ai',
    description: 'Reference implementation and test server. Exercises all MCP primitives: tools, resources, prompts, sampling.',
    install: 'npx @modelcontextprotocol/server-everything',
    tools: ['echo', 'add', 'longRunningOperation', 'sampleLLM', 'getTinyImage'],
  },
  // --- COMMUNICATION ---
  {
    name: 'slack',
    category: 'communication',
    description: 'Post messages, list channels, fetch thread history.',
    install: 'npx mcp-server-slack',
    tools: ['list_channels', 'post_message', 'reply_to_thread', 'get_channel_history'],
    needs: ['SLACK_BOT_TOKEN', 'SLACK_TEAM_ID'],
  },
  {
    name: 'gmail',
    category: 'communication',
    description: 'Read, send, search, and label Gmail messages. Draft management and attachment handling.',
    install: 'npx mcp-server-gmail',
    tools: ['list_messages', 'get_message', 'send_email', 'create_draft', 'search_messages'],
    needs: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    name: 'telegram',
    category: 'communication',
    description: 'Send messages and files to Telegram chats and channels via Bot API.',
    install: 'npx mcp-server-telegram',
    tools: ['send_message', 'send_document', 'get_chat_info', 'get_updates'],
    needs: ['TELEGRAM_BOT_TOKEN'],
  },
  {
    name: 'resend',
    category: 'communication',
    description: 'Send transactional email via Resend API. Supports React Email templates.',
    install: 'npx mcp-server-resend',
    tools: ['send_email'],
    needs: ['RESEND_API_KEY'],
  },
]

// ─── Agent Patterns ───────────────────────────────────────────────────────────

export interface AgentPattern {
  title: string
  description: string
  pseudocode?: string
  strengths: string[]
  useWhen?: string[]
  stack: string[]
}

export const patterns: AgentPattern[] = [
  {
    title: 'ReAct (Reason + Act)',
    description:
      'The foundational loop. The model reasons about the task, picks a tool, observes the result, and reasons again until complete.',
    pseudocode: `while not done:
  thought = llm.think(history)
  if thought.action:
    result = tools[thought.action](thought.input)
    history.append(observation=result)
  else:
    return thought.final_answer`,
    strengths: ['Simple', 'Debuggable', 'Works with any tool-capable model'],
    useWhen: ['Single-agent tasks', 'Tool-heavy operations', 'Step-by-step problems'],
    stack: ['Claude API', 'OpenAI', 'LangChain AgentExecutor'],
  },
  {
    title: 'Multi-Agent Orchestration',
    description:
      'Orchestrator breaks task into subtasks, dispatches to specialist agents, aggregates results.',
    pseudocode: `User → Orchestrator → [Agent A | Agent B | Agent C]
              → Aggregator → Response`,
    strengths: ['Parallelism', 'Domain specialization', 'Easier testing'],
    useWhen: ['Complex tasks with distinct subtasks', 'Parallelizable work'],
    stack: ['LangGraph', 'AutoGen', 'CrewAI'],
  },
  {
    title: 'RAG Agent',
    description:
      'Agent decides when to retrieve context. Retrieval is a tool call, not a preprocessing step.',
    pseudocode: `Query → Embedding → Vector Search → Context Injection → Generation
Key params: chunk_size=512, overlap=64, top_k=5, reranker=cross-encoder`,
    strengths: ['Up-to-date knowledge', 'Grounded responses', 'Auditable sources'],
    stack: ['LangChain + pgvector', 'Weaviate', 'Pinecone'],
  },
  {
    title: 'Memory Agent (Short + Long Term)',
    description:
      'Short-term = conversation context window. Long-term = vector store of past interactions. On each turn: retrieve relevant memories → inject into context → generate → store new memory.',
    strengths: ['Continuity across sessions', 'Personalization', 'Accumulated knowledge'],
    stack: ['Claude + MCP memory server', 'LangChain Memory', 'Mem0'],
  },
  {
    title: 'Critic-Refinement Loop',
    description:
      'Generator produces output → Critic evaluates against criteria → Refiner incorporates feedback → repeat until pass.',
    pseudocode: `output = generator.generate(task)
for i in range(max_iterations):
  feedback = critic.evaluate(output, criteria)
  if feedback.passes: break
  output = refiner.improve(output, feedback)
return output`,
    strengths: ['Self-improving output', 'Catches errors before delivery'],
    useWhen: ['Code generation', 'Document writing', 'Structured data extraction'],
    stack: ['Claude API with two system prompts'],
  },
  {
    title: 'Tool-Use Pattern (Parallel Calls)',
    description:
      'Model identifies all independent tool calls and executes them in parallel. Use tool_choice: "auto" with multiple tools defined. Model emits multiple tool_use blocks in one response.',
    pseudocode: `# Simultaneously fetch GitHub stats + Stripe revenue + PostHog analytics
# → compose dashboard
# Result: 3–5× speedup vs sequential; fewer total LLM turns`,
    strengths: ['3–5× speedup vs sequential', 'Reduces total LLM turns'],
    stack: ['Claude API', 'OpenAI with parallel_tool_calls'],
  },
  {
    title: 'Supervisor / Router Pattern',
    description:
      'Supervisor classifies intent → routes to specialized subagent → returns to supervisor for output handling.',
    pseudocode: `Input → Supervisor (classify)
      → [CodeAgent | ResearchAgent | DataAgent]
      → Supervisor (format) → Output`,
    strengths: ['Each agent is narrow and optimizable', 'Easy to add new agents'],
    stack: ['LangGraph StateGraph', 'Claude with structured routing'],
  },
  {
    title: 'Event-Driven Agent',
    description:
      'Agent wakes on external event (webhook, schedule, file change). Performs task. Goes back to sleep. No persistent conversation — each invocation is stateless (state lives in external store).',
    strengths: ['Scalable', 'Cost-efficient', 'Integrates with existing infrastructure'],
    useWhen: ['Automated pipelines', 'Background tasks', 'Monitoring agents'],
    stack: ['n8n + Claude API', 'GitHub Actions + Claude', 'Temporal'],
  },
  {
    title: 'Self-Healing Agent',
    description: 'Agent catches its own errors and attempts automated recovery. On tool failure: retry with modified input, try alternative tool, or escalate to human.',
    pseudocode: `try:
  result = agent.execute(task)
except ToolError as e:
  strategy = error_classifier.classify(e)
  if strategy == 'retry':
    result = agent.execute(task, hint=e.message)
  elif strategy == 'fallback':
    result = fallback_tool.execute(task)
  else:
    return escalate_to_human(task, e)`,
    strengths: ['High autonomy', 'Reduced human intervention', 'Graceful degradation'],
    useWhen: ['Production systems', 'Long-running pipelines', 'Unmonitored overnight tasks'],
    stack: ['Claude API', 'LangGraph error handlers', 'Temporal retry policies'],
  },
  {
    title: 'Plan-and-Execute',
    description: 'Planner LLM generates a full task plan upfront. Executor LLM carries out each step. Planner can revise the plan based on execution results.',
    pseudocode: `plan = planner_llm.create_plan(task)
results = []
for step in plan.steps:
  result = executor_llm.run(step, context=results)
  results.append(result)
  if result.needs_replan:
    plan = planner_llm.revise(plan, result)
return synthesizer.combine(results)`,
    strengths: ['Long-horizon tasks', 'Transparent execution', 'Efficient use of weaker executor models'],
    useWhen: ['Multi-step research', 'Code migrations', 'Data transformation pipelines'],
    stack: ['Claude 3 Opus (planner)', 'Claude Haiku (executor)', 'LangGraph'],
  },
  {
    title: 'Human-in-the-Loop (HITL)',
    description: 'Agent pauses at defined checkpoints to request human approval before proceeding. Supports async approval via Slack, email, or UI.',
    pseudocode: `for step in plan:
  agent.execute(step)
  if step.requires_approval:
    approval = await human_gateway.request(
      action=step.description,
      timeout=3600
    )
    if not approval.granted:
      return abort_with_explanation(approval.reason)`,
    strengths: ['Safe for high-stakes actions', 'Auditable', 'Builds user trust'],
    useWhen: ['Financial operations', 'Production deployments', 'Data deletion', 'Customer communications'],
    stack: ['Claude API', 'Slack Approval Bot', 'n8n + Telegram', 'LangGraph interrupt()'],
  },
  {
    title: 'Structured Extraction Agent',
    description: 'Specialized agent for transforming unstructured data (documents, emails, web pages) into typed, validated schemas using forced JSON output.',
    pseudocode: `const schema = z.object({
  title: z.string(),
  date: z.string().datetime(),
  items: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })),
})

const result = await anthropic.messages.create({
  tools: [{ name: 'extract', input_schema: zodToJsonSchema(schema) }],
  tool_choice: { type: 'tool', name: 'extract' },
  messages: [{ role: 'user', content: rawDocument }],
})`,
    strengths: ['100% structured output', 'Schema-validated', 'Composable with downstream systems'],
    useWhen: ['Invoice processing', 'Form extraction', 'Email parsing', 'Web scraping'],
    stack: ['Claude API', 'Zod', 'zodToJsonSchema', 'TypeScript'],
  },
  {
    title: 'Agentic Code Interpreter',
    description: 'Agent writes code, executes it in a sandbox, reads the output, and iterates until the result matches the goal. Combines code generation with tool-based execution.',
    pseudocode: `goal = "Analyze sales_data.csv and find the top 5 products by revenue"
while not satisfied:
  code = llm.write_code(goal, context=previous_outputs)
  stdout, stderr = sandbox.execute(code)
  if stderr:
    context.add(error=stderr)
  elif not satisfies_goal(stdout, goal):
    context.add(output=stdout, feedback="Not quite — refine")
  else:
    return format_result(stdout)`,
    strengths: ['Handles complex data analysis', 'Self-correcting', 'No schema required'],
    useWhen: ['Data analysis tasks', 'Report generation', 'Algorithm verification', 'Mathematical computation'],
    stack: ['Claude API', 'E2B Sandbox', 'Docker executor', 'Deno sandbox'],
  },
]

// ─── Skills ───────────────────────────────────────────────────────────────────

export interface SkillItem {
  command: string
  title: string
  description: string
  example?: string
  builtin?: boolean
}

export const builtinSkills: SkillItem[] = [
  {
    command: '/ultrareview',
    title: 'Ultra Review',
    builtin: true,
    description:
      'Multi-agent cloud review of current branch or PR. Spawns specialized reviewers for Security, Performance, Architecture, and Test Coverage.',
    example: '/ultrareview\n/ultrareview 42',
  },
  {
    command: '/plan',
    title: 'Architecture Planner',
    builtin: true,
    description:
      'Enter architecture planning mode. Produces structured implementation plan: phase breakdown, file map, dependency graph, and verification checklist.',
    example: '/plan',
  },
  {
    command: '/fast',
    title: 'Fast Mode',
    builtin: true,
    description:
      'Toggle Fast mode (Claude Opus with faster output). Use for speed-critical tasks where throughput matters more than maximum reasoning depth.',
    example: '/fast',
  },
]

export const customSkills: SkillItem[] = [
  {
    command: '/deploy',
    title: 'Deploy to Railway',
    description:
      'Run railway up --environment production, tail logs, confirm healthy. Needs RAILWAY_TOKEN env var and project ID configured.',
    example: '/deploy',
  },
  {
    command: '/test <file>',
    title: 'Generate Tests',
    description:
      "Analyze the file's public API surface. Generate Vitest unit tests for all exported functions. Follow existing test patterns in src/test/.",
    example: '/test src/lib/utils.ts',
  },
  {
    command: '/docs <file>',
    title: 'Document API',
    description:
      'Read the file. Generate TypeScript JSDoc for every exported symbol. Produce a companion .md API reference with examples.',
    example: '/docs src/lib/admin/store.tsx',
  },
  {
    command: '/audit',
    title: 'Security Audit',
    description:
      'Scan all source files for SQL injection vectors, XSS sinks, insecure dependencies, exposed secrets, and OWASP Top 10 patterns. Report with severity and fix.',
    example: '/audit',
  },
  {
    command: '/commit',
    title: 'Smart Commit',
    description:
      'Stage all changes. Generate a conventional commit message from the diff. Show the message, ask for approval, then commit.',
    example: '/commit',
  },
  {
    command: '/changelog',
    title: 'Generate Changelog',
    description:
      'Read git log since last tag. Group commits by type (feat/fix/chore/docs). Generate CHANGELOG.md entry in Keep a Changelog format with date header.',
    example: '/changelog',
  },
  {
    command: '/bundle',
    title: 'Analyze Bundle',
    description:
      'Run ANALYZE=true npm run build. Parse treemap output. Report the 5 largest chunks with import paths and optimization suggestions.',
    example: '/bundle',
  },
  {
    command: '/migrate <name>',
    title: 'DB Migration',
    description:
      'Create a new Drizzle migration with the given name. Run drizzle-kit generate, then drizzle-kit migrate. Verify schema diff and summarize changes.',
    example: '/migrate add_user_preferences',
  },
  {
    command: '/review',
    title: 'Code Review',
    description:
      'Review staged changes or a specific file. Check for: type safety, performance, test coverage, naming, and SOLID violations. Rate each dimension.',
    example: '/review\n/review src/lib/utils.ts',
  },
  {
    command: '/optimize <file>',
    title: 'Performance Optimizer',
    description:
      'Profile the file for: unnecessary re-renders, missing memoization, unoptimized loops, large bundle imports. Suggest and apply fixes.',
    example: '/optimize src/components/LabsSection.tsx',
  },
  {
    command: '/i18n',
    title: 'i18n Coverage Check',
    description:
      'Scan all .tsx files for hardcoded strings. Compare against messages/en.json. Report missing keys. Generate the missing translation entries.',
    example: '/i18n',
  },
  {
    command: '/types',
    title: 'Type Generation',
    description:
      'Read an API response or JSON schema. Generate TypeScript interfaces with JSDoc. Place output in src/lib/types/ with proper exports.',
    example: '/types api-response.json',
  },
]
