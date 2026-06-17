// Lightweight registry for admin panel — source of truth for category metadata
// and compact item summaries. Full item data (descriptions, code, learn notes)
// lives in the individual page files at src/app/[locale]/resources/*/page.tsx

export type RCatKey = 'tools' | 'repos' | 'workflows' | 'prompts' | 'mcp' | 'agents' | 'skills'

export interface RCategory {
  key: RCatKey
  label: string
  description: string
  count: string
  accent: string
  path: string
  subCategories: string[]
}

export const RESOURCE_CATEGORIES: RCategory[] = [
  {
    key: 'tools',
    label: 'Developer Tools',
    description: 'AI APIs, CLI utilities, cloud services, and monitoring platforms that accelerate modern development.',
    count: '60+',
    accent: '#34d399',
    path: '/en/resources/tools',
    subCategories: ['AI & LLM', 'CLI & DevOps', 'APIs & Data', 'Monitoring', 'Testing', 'UI Components', 'State Management', 'Auth', 'Storage', 'Search', 'Queue & Jobs', 'Feature Flags'],
  },
  {
    key: 'repos',
    label: 'Open Source Repos',
    description: 'Essential GitHub repositories every TypeScript and full-stack developer should know and bookmark.',
    count: '40+',
    accent: '#60a5fa',
    path: '/en/resources/repos',
    subCategories: ['TypeScript', 'Python', 'Go/Rust', 'AI/LLM', 'MCP', 'Starters', 'Learning'],
  },
  {
    key: 'workflows',
    label: 'Automation Workflows',
    description: 'CI/CD pipelines, n8n templates, and AI automation patterns ready to adapt for your projects.',
    count: '15+',
    accent: '#a78bfa',
    path: '/en/resources/workflows',
    subCategories: ['CI/CD', 'n8n', 'AI Patterns'],
  },
  {
    key: 'prompts',
    label: 'AI Prompts',
    description: 'System prompts, task prompts, and meta-prompts for code review, architecture, and documentation.',
    count: '20+',
    accent: '#fbbf24',
    path: '/en/resources/prompts',
    subCategories: ['System', 'Task', 'Meta', 'DevOps', 'Data', 'Business'],
  },
  {
    key: 'mcp',
    label: 'MCP Servers',
    description: 'Model Context Protocol servers for Claude — filesystem, GitHub, databases, browser automation, and custom integrations.',
    count: '30+',
    accent: '#38bdf8',
    path: '/en/resources/mcp',
    subCategories: ['Official', 'Database', 'Productivity', 'DevOps', 'AI', 'Communication'],
  },
  {
    key: 'agents',
    label: 'AI Agent Templates',
    description: 'Production-ready agent architectures: ReAct, multi-agent orchestration, RAG, memory, and critic-loop patterns.',
    count: '10+',
    accent: '#f472b6',
    path: '/en/resources/agents',
    subCategories: ['Orchestration', 'Memory', 'Structured Output', 'Self-Healing', 'HITL'],
  },
  {
    key: 'skills',
    label: 'Skills & Capabilities',
    description: 'Claude Code skills (slash commands), Hermes agent capabilities, and AI tool-use patterns you can deploy today.',
    count: '20+',
    accent: '#fb923c',
    path: '/en/resources/skills',
    subCategories: ['Built-in Skills', 'Custom Skills', 'Hooks', 'Settings'],
  },
]

// ─── Compact item lists (admin display only) ──────────────────────────────────

export interface ToolItem   { name: string; subCat: string; url: string; pricing: string }
export interface RepoItem   { org: string; name: string; lang: string; stars: string; url: string; cat: string }
export interface WorkItem   { title: string; type: 'cicd' | 'n8n' | 'ai'; complexity: string }
export interface PromptItem { title: string; cat: string; models: string[] }
export interface McpItem    { name: string; cat: string; install: string; toolCount: number }
export interface AgentItem  { title: string; stack: string[] }
export interface SkillItem  { command: string; title: string; builtin: boolean }

export const toolItems: ToolItem[] = [
  // AI & LLM
  { name: 'Claude API',       subCat: 'AI & LLM',          url: 'https://anthropic.com/api',         pricing: 'Paid'     },
  { name: 'OpenAI API',       subCat: 'AI & LLM',          url: 'https://platform.openai.com',       pricing: 'Paid'     },
  { name: 'LangChain',        subCat: 'AI & LLM',          url: 'https://langchain.com',             pricing: 'OSS'      },
  { name: 'Ollama',           subCat: 'AI & LLM',          url: 'https://ollama.com',                pricing: 'Free'     },
  { name: 'n8n',              subCat: 'AI & LLM',          url: 'https://n8n.io',                    pricing: 'OSS'      },
  { name: 'Groq',             subCat: 'AI & LLM',          url: 'https://groq.com',                  pricing: 'Freemium' },
  { name: 'Together AI',      subCat: 'AI & LLM',          url: 'https://together.ai',               pricing: 'Paid'     },
  { name: 'Replicate',        subCat: 'AI & LLM',          url: 'https://replicate.com',             pricing: 'Paid'     },
  // CLI & DevOps
  { name: 'Bun',              subCat: 'CLI & DevOps',       url: 'https://bun.sh',                    pricing: 'OSS'      },
  { name: 'Turso',            subCat: 'CLI & DevOps',       url: 'https://turso.tech',                pricing: 'Freemium' },
  { name: 'Railway',          subCat: 'CLI & DevOps',       url: 'https://railway.app',               pricing: 'Freemium' },
  { name: 'Fly.io',           subCat: 'CLI & DevOps',       url: 'https://fly.io',                    pricing: 'Freemium' },
  { name: 'Doppler',          subCat: 'CLI & DevOps',       url: 'https://doppler.com',               pricing: 'Freemium' },
  { name: 'Kamal',            subCat: 'CLI & DevOps',       url: 'https://kamal-deploy.org',          pricing: 'OSS'      },
  { name: 'Coolify',          subCat: 'CLI & DevOps',       url: 'https://coolify.io',                pricing: 'OSS'      },
  { name: 'Turbo',            subCat: 'CLI & DevOps',       url: 'https://turbo.build',               pricing: 'OSS'      },
  // APIs & Data
  { name: 'Supabase',         subCat: 'APIs & Data',        url: 'https://supabase.com',              pricing: 'Freemium' },
  { name: 'Upstash',          subCat: 'APIs & Data',        url: 'https://upstash.com',               pricing: 'Freemium' },
  { name: 'Resend',           subCat: 'APIs & Data',        url: 'https://resend.com',                pricing: 'Freemium' },
  { name: 'Stripe',           subCat: 'APIs & Data',        url: 'https://stripe.com',                pricing: 'Paid'     },
  { name: 'Neon',             subCat: 'APIs & Data',        url: 'https://neon.tech',                 pricing: 'Freemium' },
  { name: 'PlanetScale',      subCat: 'APIs & Data',        url: 'https://planetscale.com',           pricing: 'Freemium' },
  { name: 'Trigger.dev',      subCat: 'APIs & Data',        url: 'https://trigger.dev',               pricing: 'OSS'      },
  // Monitoring
  { name: 'Sentry',           subCat: 'Monitoring',         url: 'https://sentry.io',                 pricing: 'Freemium' },
  { name: 'PostHog',          subCat: 'Monitoring',         url: 'https://posthog.com',               pricing: 'OSS'      },
  { name: 'Axiom',            subCat: 'Monitoring',         url: 'https://axiom.co',                  pricing: 'Freemium' },
  { name: 'Better Stack',     subCat: 'Monitoring',         url: 'https://betterstack.com',           pricing: 'Freemium' },
  { name: 'OpenTelemetry',    subCat: 'Monitoring',         url: 'https://opentelemetry.io',          pricing: 'OSS'      },
  // Testing
  { name: 'Playwright',       subCat: 'Testing',            url: 'https://playwright.dev',            pricing: 'OSS'      },
  { name: 'Vitest',           subCat: 'Testing',            url: 'https://vitest.dev',                pricing: 'OSS'      },
  { name: 'MSW',              subCat: 'Testing',            url: 'https://mswjs.io',                  pricing: 'OSS'      },
  { name: 'Testing Library',  subCat: 'Testing',            url: 'https://testing-library.com',       pricing: 'OSS'      },
  { name: 'Faker.js',         subCat: 'Testing',            url: 'https://fakerjs.dev',               pricing: 'OSS'      },
  { name: 'k6',               subCat: 'Testing',            url: 'https://k6.io',                     pricing: 'OSS'      },
  // UI Components
  { name: 'Radix UI',         subCat: 'UI Components',      url: 'https://radix-ui.com',              pricing: 'OSS'      },
  { name: 'shadcn/ui',        subCat: 'UI Components',      url: 'https://ui.shadcn.com',             pricing: 'OSS'      },
  { name: 'Headless UI',      subCat: 'UI Components',      url: 'https://headlessui.com',            pricing: 'OSS'      },
  { name: 'Mantine',          subCat: 'UI Components',      url: 'https://mantine.dev',               pricing: 'OSS'      },
  { name: 'Ark UI',           subCat: 'UI Components',      url: 'https://ark-ui.com',                pricing: 'OSS'      },
  { name: 'Vaul',             subCat: 'UI Components',      url: 'https://vaul.emilkowal.ski',        pricing: 'OSS'      },
  // State Management
  { name: 'Jotai',            subCat: 'State Management',   url: 'https://jotai.org',                 pricing: 'OSS'      },
  { name: 'Zustand',          subCat: 'State Management',   url: 'https://zustand-demo.pmnd.rs',      pricing: 'OSS'      },
  { name: 'TanStack Query',   subCat: 'State Management',   url: 'https://tanstack.com/query',        pricing: 'OSS'      },
  { name: 'XState',           subCat: 'State Management',   url: 'https://xstate.js.org',             pricing: 'OSS'      },
  { name: 'Valtio',           subCat: 'State Management',   url: 'https://valtio.pmnd.rs',            pricing: 'OSS'      },
  { name: 'Legend-State',     subCat: 'State Management',   url: 'https://legendapp.com/open-source/state', pricing: 'OSS' },
  // Auth
  { name: 'Auth.js',          subCat: 'Auth',               url: 'https://authjs.dev',                pricing: 'OSS'      },
  { name: 'Lucia Auth',       subCat: 'Auth',               url: 'https://lucia-auth.com',            pricing: 'OSS'      },
  { name: 'Better Auth',      subCat: 'Auth',               url: 'https://better-auth.com',           pricing: 'OSS'      },
  { name: 'Clerk',            subCat: 'Auth',               url: 'https://clerk.com',                 pricing: 'Freemium' },
  { name: 'Kinde',            subCat: 'Auth',               url: 'https://kinde.com',                 pricing: 'Freemium' },
  { name: 'Stack Auth',       subCat: 'Auth',               url: 'https://stack-auth.com',            pricing: 'OSS'      },
  // Storage
  { name: 'Cloudflare R2',    subCat: 'Storage',            url: 'https://cloudflare.com/r2',         pricing: 'Freemium' },
  { name: 'AWS S3',           subCat: 'Storage',            url: 'https://aws.amazon.com/s3',         pricing: 'Paid'     },
  { name: 'UploadThing',      subCat: 'Storage',            url: 'https://uploadthing.com',           pricing: 'Freemium' },
  { name: 'Uploadcare',       subCat: 'Storage',            url: 'https://uploadcare.com',            pricing: 'Freemium' },
  { name: 'MinIO',            subCat: 'Storage',            url: 'https://min.io',                    pricing: 'OSS'      },
  { name: 'Tigris',           subCat: 'Storage',            url: 'https://www.tigrisdata.com',        pricing: 'Freemium' },
  // Search
  { name: 'Meilisearch',      subCat: 'Search',             url: 'https://meilisearch.com',           pricing: 'OSS'      },
  { name: 'Typesense',        subCat: 'Search',             url: 'https://typesense.org',             pricing: 'OSS'      },
  { name: 'Algolia',          subCat: 'Search',             url: 'https://algolia.com',               pricing: 'Freemium' },
  { name: 'Elasticsearch',    subCat: 'Search',             url: 'https://elastic.co',                pricing: 'OSS'      },
  { name: 'Orama',            subCat: 'Search',             url: 'https://orama.com',                 pricing: 'OSS'      },
  // Queue & Jobs
  { name: 'BullMQ',           subCat: 'Queue & Jobs',       url: 'https://bullmq.io',                 pricing: 'OSS'      },
  { name: 'Inngest',          subCat: 'Queue & Jobs',       url: 'https://inngest.com',               pricing: 'Freemium' },
  { name: 'QStash',           subCat: 'Queue & Jobs',       url: 'https://upstash.com/qstash',        pricing: 'Freemium' },
  { name: 'Temporal',         subCat: 'Queue & Jobs',       url: 'https://temporal.io',               pricing: 'OSS'      },
  // Feature Flags
  { name: 'GrowthBook',       subCat: 'Feature Flags',      url: 'https://growthbook.io',             pricing: 'OSS'      },
  { name: 'Flagsmith',        subCat: 'Feature Flags',      url: 'https://flagsmith.com',             pricing: 'OSS'      },
  { name: 'LaunchDarkly',     subCat: 'Feature Flags',      url: 'https://launchdarkly.com',          pricing: 'Paid'     },
  { name: 'Unleash',          subCat: 'Feature Flags',      url: 'https://unleash.io',                pricing: 'OSS'      },
  { name: 'OpenFeature',      subCat: 'Feature Flags',      url: 'https://openfeature.dev',           pricing: 'OSS'      },
]

export const repoItems: RepoItem[] = [
  { org: 'microsoft',       name: 'TypeScript',                    lang: 'TypeScript',  stars: '101k',  url: 'https://github.com/microsoft/TypeScript',                     cat: 'TypeScript' },
  { org: 'vercel',          name: 'next.js',                       lang: 'TypeScript',  stars: '128k',  url: 'https://github.com/vercel/next.js',                           cat: 'TypeScript' },
  { org: 'shadcn-ui',       name: 'ui',                            lang: 'TypeScript',  stars: '82k',   url: 'https://github.com/shadcn-ui/ui',                             cat: 'TypeScript' },
  { org: 'pmndrs',          name: 'zustand',                       lang: 'TypeScript',  stars: '50k',   url: 'https://github.com/pmndrs/zustand',                           cat: 'TypeScript' },
  { org: 'colinhacks',      name: 'zod',                           lang: 'TypeScript',  stars: '35k',   url: 'https://github.com/colinhacks/zod',                           cat: 'TypeScript' },
  { org: 'trpc',            name: 'trpc',                          lang: 'TypeScript',  stars: '35k',   url: 'https://github.com/trpc/trpc',                               cat: 'TypeScript' },
  { org: 'prisma',          name: 'prisma',                        lang: 'TypeScript',  stars: '41k',   url: 'https://github.com/prisma/prisma',                            cat: 'TypeScript' },
  { org: 'n8n-io',          name: 'n8n',                           lang: 'TypeScript',  stars: '51k',   url: 'https://github.com/n8n-io/n8n',                              cat: 'TypeScript' },
  { org: 'drizzle-team',    name: 'drizzle-orm',                   lang: 'TypeScript',  stars: '25k',   url: 'https://github.com/drizzle-team/drizzle-orm',                 cat: 'TypeScript' },
  { org: 'electric-sql',    name: 'pglite',                        lang: 'TypeScript',  stars: '11k',   url: 'https://github.com/electric-sql/pglite',                      cat: 'TypeScript' },
  { org: 'react-hook-form', name: 'react-hook-form',               lang: 'TypeScript',  stars: '42k',   url: 'https://github.com/react-hook-form/react-hook-form',          cat: 'TypeScript' },
  { org: 'langchain-ai',    name: 'langchain',                     lang: 'Python',      stars: '96k',   url: 'https://github.com/langchain-ai/langchain',                   cat: 'Python'     },
  { org: 'anthropics',      name: 'anthropic-sdk-python',          lang: 'Python',      stars: '3.8k',  url: 'https://github.com/anthropics/anthropic-sdk-python',          cat: 'Python'     },
  { org: 'pydantic',        name: 'pydantic-ai',                   lang: 'Python',      stars: '8.4k',  url: 'https://github.com/pydantic/pydantic-ai',                     cat: 'Python'     },
  { org: 'langchain-ai',    name: 'langgraph',                     lang: 'Python',      stars: '12k',   url: 'https://github.com/langchain-ai/langgraph',                   cat: 'Python'     },
  { org: 'microsoft',       name: 'autogen',                       lang: 'Python',      stars: '38k',   url: 'https://github.com/microsoft/autogen',                        cat: 'Python'     },
  { org: 'crewAIInc',       name: 'crewAI',                        lang: 'Python',      stars: '29k',   url: 'https://github.com/crewAIInc/crewAI',                         cat: 'Python'     },
  { org: 'tiangolo',        name: 'fastapi',                       lang: 'Python',      stars: '80k',   url: 'https://github.com/tiangolo/fastapi',                         cat: 'Python'     },
  { org: 'BerriAI',         name: 'litellm',                       lang: 'Python',      stars: '18k',   url: 'https://github.com/BerriAI/litellm',                          cat: 'Python'     },
  { org: 'ollama',          name: 'ollama',                        lang: 'Go',          stars: '103k',  url: 'https://github.com/ollama/ollama',                            cat: 'Go/Rust'    },
  { org: 'biomejs',         name: 'biome',                         lang: 'Rust',        stars: '17k',   url: 'https://github.com/biomejs/biome',                            cat: 'Go/Rust'    },
  { org: 'oven-sh',         name: 'bun',                           lang: 'Zig',         stars: '75k',   url: 'https://github.com/oven-sh/bun',                              cat: 'Go/Rust'    },
  { org: 'tokio-rs',        name: 'axum',                          lang: 'Rust',        stars: '20k',   url: 'https://github.com/tokio-rs/axum',                            cat: 'Go/Rust'    },
  { org: 'launchbadge',     name: 'sqlx',                          lang: 'Rust',        stars: '13k',   url: 'https://github.com/launchbadge/sqlx',                         cat: 'Go/Rust'    },
  { org: 'anthropics',      name: 'claude-code',                   lang: 'TypeScript',  stars: '12k',   url: 'https://github.com/anthropics/claude-code',                   cat: 'AI/LLM'     },
  { org: 'openai',          name: 'openai-node',                   lang: 'TypeScript',  stars: '8.5k',  url: 'https://github.com/openai/openai-node',                       cat: 'AI/LLM'     },
  { org: 'jxnl',            name: 'instructor',                    lang: 'Python',      stars: '10k',   url: 'https://github.com/jxnl/instructor',                          cat: 'AI/LLM'     },
  { org: 'mem0ai',          name: 'mem0',                          lang: 'Python',      stars: '26k',   url: 'https://github.com/mem0ai/mem0',                              cat: 'AI/LLM'     },
  { org: 'dspy-ai',         name: 'dspy',                          lang: 'Python',      stars: '22k',   url: 'https://github.com/stanfordnlp/dspy',                         cat: 'AI/LLM'     },
  { org: 'modelcontextprotocol', name: 'servers',                  lang: 'TypeScript',  stars: '9.2k',  url: 'https://github.com/modelcontextprotocol/servers',             cat: 'MCP'        },
  { org: 'modelcontextprotocol', name: 'typescript-sdk',           lang: 'TypeScript',  stars: '6.1k',  url: 'https://github.com/modelcontextprotocol/typescript-sdk',      cat: 'MCP'        },
  { org: 'jlowin',          name: 'fastmcp',                       lang: 'Python',      stars: '4.2k',  url: 'https://github.com/jlowin/fastmcp',                           cat: 'MCP'        },
  { org: 't3-oss',          name: 'create-t3-app',                 lang: 'TypeScript',  stars: '26k',   url: 'https://github.com/t3-oss/create-t3-app',                     cat: 'Starters'   },
  { org: 'vercel',          name: 'nextjs-subscription-payments',  lang: 'TypeScript',  stars: '7.4k',  url: 'https://github.com/vercel/nextjs-subscription-payments',      cat: 'Starters'   },
  { org: 'alan2207',        name: 'bulletproof-react',             lang: 'TypeScript',  stars: '29k',   url: 'https://github.com/alan2207/bulletproof-react',               cat: 'Starters'   },
  { org: 'payloadcms',      name: 'payload',                       lang: 'TypeScript',  stars: '30k',   url: 'https://github.com/payloadcms/payload',                       cat: 'Starters'   },
  { org: 'trekhleb',        name: 'javascript-algorithms',         lang: 'JavaScript',  stars: '188k',  url: 'https://github.com/trekhleb/javascript-algorithms',           cat: 'Learning'   },
  { org: 'donnemartin',     name: 'system-design-primer',          lang: 'Python',      stars: '280k',  url: 'https://github.com/donnemartin/system-design-primer',         cat: 'Learning'   },
  { org: 'kamranahmedse',   name: 'developer-roadmap',             lang: 'TypeScript',  stars: '305k',  url: 'https://github.com/kamranahmedse/developer-roadmap',          cat: 'Learning'   },
  { org: 'codecrafters-io', name: 'build-your-own-x',              lang: 'Markdown',    stars: '310k',  url: 'https://github.com/codecrafters-io/build-your-own-x',         cat: 'Learning'   },
  { org: 'jwasham',         name: 'coding-interview-university',   lang: 'Markdown',    stars: '310k',  url: 'https://github.com/jwasham/coding-interview-university',      cat: 'Learning'   },
]

export const workflowItems: WorkItem[] = [
  { title: 'Typecheck + Lint + Test → Build → Lighthouse CI',    type: 'cicd', complexity: 'Medium' },
  { title: 'Docker Multi-stage Build with Layer Cache',           type: 'cicd', complexity: 'Medium' },
  { title: 'Semantic Release with Changelog Generation',          type: 'cicd', complexity: 'Low'    },
  { title: 'GitHub Issue → Auto-label → Notify Slack',           type: 'n8n',  complexity: 'Low'    },
  { title: 'RSS Feed → AI Summary → Telegram Channel',           type: 'n8n',  complexity: 'Medium' },
  { title: 'CRM Lead → Enrich → Assign → Welcome Email',         type: 'n8n',  complexity: 'High'   },
  { title: 'Daily Metrics Digest → Email Report',                 type: 'n8n',  complexity: 'Medium' },
  { title: 'New GitHub Star → Thank You Tweet (X)',               type: 'n8n',  complexity: 'Medium' },
  { title: 'Nightly SEO Audit → Linear Issue Creator',            type: 'n8n',  complexity: 'High'   },
  { title: 'RAG Pipeline: Ingest → Chunk → Embed → Retrieve',    type: 'ai',   complexity: 'High'   },
  { title: 'Multi-Agent Loop: Planner → Executor → Critic',      type: 'ai',   complexity: 'High'   },
  { title: 'Document Classification with Confidence Scoring',     type: 'ai',   complexity: 'Medium' },
  { title: 'Structured Output Pipeline with Zod Validation',      type: 'ai',   complexity: 'Low'    },
  { title: 'Streaming Agent with Real-Time UI Updates',           type: 'ai',   complexity: 'High'   },
]

export const promptItems: PromptItem[] = [
  { title: 'Senior TypeScript Code Reviewer',        cat: 'System',   models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'] },
  { title: 'Architecture Decision Advisor',           cat: 'System',   models: ['Claude 3 Opus', 'GPT-4o'] },
  { title: 'Technical Documentation Writer',          cat: 'System',   models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'Fullstack Code Generator',                cat: 'System',   models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'] },
  { title: 'Security-First Code Reviewer',            cat: 'System',   models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Opus'] },
  { title: 'Product Manager — PRD Writer',            cat: 'System',   models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'E2E Test Writer (Playwright)',             cat: 'Task',     models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'Performance Bottleneck Finder',           cat: 'Task',     models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'] },
  { title: 'Chain of Thought Activator',              cat: 'Meta',     models: ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Opus'] },
  { title: 'Persona Calibrator',                      cat: 'Meta',     models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'CI/CD Pipeline Debugger',                 cat: 'DevOps',   models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'Docker Compose Generator',                cat: 'DevOps',   models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'SQL Query Optimizer',                     cat: 'Data',     models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'Data Pipeline Designer',                  cat: 'Data',     models: ['Claude 3.5 Sonnet', 'Claude 3 Opus'] },
  { title: 'Competitive Analysis Report',             cat: 'Business', models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
  { title: 'Investor Update Writer',                  cat: 'Business', models: ['Claude 3.5 Sonnet', 'GPT-4o'] },
]

export const mcpItems: McpItem[] = [
  { name: 'filesystem',          cat: 'official',      install: 'npx @modelcontextprotocol/server-filesystem', toolCount: 6  },
  { name: 'brave-search',        cat: 'official',      install: 'npx @modelcontextprotocol/server-brave-search', toolCount: 2 },
  { name: 'github',              cat: 'official',      install: 'npx @modelcontextprotocol/server-github',     toolCount: 5  },
  { name: 'postgres',            cat: 'official',      install: 'npx @modelcontextprotocol/server-postgres',   toolCount: 3  },
  { name: 'sqlite',              cat: 'official',      install: 'npx @modelcontextprotocol/server-sqlite',     toolCount: 4  },
  { name: 'puppeteer',           cat: 'official',      install: 'npx @modelcontextprotocol/server-puppeteer',  toolCount: 5  },
  { name: 'fetch',               cat: 'official',      install: 'npx @modelcontextprotocol/server-fetch',      toolCount: 2  },
  { name: 'memory',              cat: 'official',      install: 'npx @modelcontextprotocol/server-memory',     toolCount: 5  },
  { name: 'sequential-thinking', cat: 'official',      install: 'npx @modelcontextprotocol/server-sequential-thinking', toolCount: 1 },
  { name: 'mysql',               cat: 'database',      install: 'npx @modelcontextprotocol/server-mysql',     toolCount: 4  },
  { name: 'mongodb',             cat: 'database',      install: 'npx mcp-server-mongodb',                     toolCount: 6  },
  { name: 'redis',               cat: 'database',      install: 'npx mcp-server-redis',                       toolCount: 6  },
  { name: 'elasticsearch',       cat: 'database',      install: 'npx mcp-server-elasticsearch',               toolCount: 5  },
  { name: 'supabase',            cat: 'database',      install: 'npx mcp-server-supabase',                    toolCount: 3  },
  { name: 'google-drive',        cat: 'productivity',  install: 'npx @modelcontextprotocol/server-gdrive',    toolCount: 5  },
  { name: 'google-maps',         cat: 'productivity',  install: 'npx @modelcontextprotocol/server-google-maps', toolCount: 5 },
  { name: 'obsidian',            cat: 'productivity',  install: 'npx mcp-obsidian',                           toolCount: 5  },
  { name: 'airtable',            cat: 'productivity',  install: 'npx mcp-airtable',                           toolCount: 5  },
  { name: 'notion',              cat: 'productivity',  install: 'npx mcp-notion-server',                      toolCount: 4  },
  { name: 'linear',              cat: 'productivity',  install: 'npx @linear/mcp-server',                     toolCount: 4  },
  { name: 'jira',                cat: 'productivity',  install: 'npx mcp-server-jira',                        toolCount: 6  },
  { name: 'git',                 cat: 'devops',        install: 'npx @modelcontextprotocol/server-git',       toolCount: 6  },
  { name: 'docker',              cat: 'devops',        install: 'npx mcp-server-docker',                      toolCount: 6  },
  { name: 'kubernetes',          cat: 'devops',        install: 'npx mcp-server-kubernetes',                  toolCount: 6  },
  { name: 'cloudflare',          cat: 'devops',        install: 'npx @cloudflare/mcp-server-cloudflare',      toolCount: 6  },
  { name: 'sentry',              cat: 'devops',        install: 'npx mcp-server-sentry',                      toolCount: 5  },
  { name: 'tavily',              cat: 'ai',            install: 'npx tavily-mcp',                             toolCount: 2  },
  { name: 'stripe',              cat: 'ai',            install: 'npx @stripe/agent-toolkit',                  toolCount: 4  },
  { name: 'aws-kb-retrieval',    cat: 'ai',            install: 'npx @modelcontextprotocol/server-aws-kb-retrieval-server', toolCount: 1 },
  { name: 'everything',          cat: 'ai',            install: 'npx @modelcontextprotocol/server-everything', toolCount: 5 },
  { name: 'slack',               cat: 'communication', install: 'npx mcp-server-slack',                       toolCount: 4  },
  { name: 'gmail',               cat: 'communication', install: 'npx mcp-server-gmail',                       toolCount: 5  },
  { name: 'telegram',            cat: 'communication', install: 'npx mcp-server-telegram',                    toolCount: 4  },
  { name: 'resend',              cat: 'communication', install: 'npx mcp-server-resend',                      toolCount: 1  },
]

export const agentItems: AgentItem[] = [
  { title: 'ReAct (Reason + Act)',               stack: ['Claude API', 'OpenAI', 'LangChain AgentExecutor']              },
  { title: 'Multi-Agent Orchestration',          stack: ['LangGraph', 'AutoGen', 'CrewAI']                               },
  { title: 'RAG Agent',                          stack: ['LangChain + pgvector', 'Weaviate', 'Pinecone']                 },
  { title: 'Memory Agent (Short + Long Term)',   stack: ['Claude + MCP memory server', 'LangChain Memory', 'Mem0']       },
  { title: 'Critic-Refinement Loop',             stack: ['Claude API with two system prompts']                            },
  { title: 'Tool-Use Pattern (Parallel Calls)',  stack: ['Claude API', 'OpenAI with parallel_tool_calls']                },
  { title: 'Supervisor / Router Pattern',        stack: ['LangGraph StateGraph', 'Claude with structured routing']        },
  { title: 'Event-Driven Agent',                 stack: ['n8n + Claude API', 'GitHub Actions + Claude', 'Temporal']      },
  { title: 'Self-Healing Agent',                 stack: ['Claude API', 'LangGraph error handlers', 'Temporal']           },
  { title: 'Plan-and-Execute',                   stack: ['Claude 3 Opus (planner)', 'Claude Haiku (executor)', 'LangGraph'] },
  { title: 'Human-in-the-Loop (HITL)',           stack: ['Claude API', 'Slack Approval Bot', 'LangGraph interrupt()']    },
  { title: 'Structured Extraction Agent',        stack: ['Claude API', 'Zod', 'TypeScript']                              },
]

export const skillItems: SkillItem[] = [
  { command: '/ultrareview',      title: 'Ultra Review',         builtin: true  },
  { command: '/plan',             title: 'Architecture Planner', builtin: true  },
  { command: '/fast',             title: 'Fast Mode',            builtin: true  },
  { command: '/deploy',           title: 'Deploy to Railway',    builtin: false },
  { command: '/bundle',           title: 'Analyze Bundle',       builtin: false },
  { command: '/migrate <name>',   title: 'DB Migration',         builtin: false },
  { command: '/review',           title: 'Code Review',          builtin: false },
  { command: '/optimize <file>',  title: 'Performance Optimizer',builtin: false },
  { command: '/i18n',             title: 'i18n Coverage Check',  builtin: false },
  { command: '/types',            title: 'Type Generation',      builtin: false },
]
