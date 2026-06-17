'use client'

import { useState } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
type RepoCategory = 'All' | 'TypeScript' | 'Python' | 'Go/Rust' | 'AI/LLM' | 'MCP' | 'Starters' | 'Learning'

interface Repo {
  org: string
  name: string
  description: string
  learn: string
  lang: string
  stars: string
  url: string
  category: Exclude<RepoCategory, 'All'>
}

const repos: Repo[] = [
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
    learn: 'How Rust\'s type system enforces request-response middleware composition via Tower\'s Service trait — no runtime overhead, all compile-time checked.',
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
    org: 'dspy-ai', name: 'dspy', description: 'Framework for algorithmically optimizing LM prompts and weights. Program, don\'t prompt.',
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

const filterTabs: RepoCategory[] = ['All', 'TypeScript', 'Python', 'Go/Rust', 'AI/LLM', 'MCP', 'Starters', 'Learning']

export default function ResourcesReposPage() {
  const [activeFilter, setActiveFilter] = useState<RepoCategory>('All')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const visibleRepos = activeFilter === 'All'
    ? repos
    : repos.filter(r => r.category === activeFilter)

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / Repos
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">Open Source Repos.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Essential GitHub repositories every TypeScript, Python, and AI developer should know.
          Each entry includes what you will actually learn from the source code.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={activeFilter === tab ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary cursor-pointer" : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 hover:border-white/20 hover:text-white/60 transition-all cursor-pointer"}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visibleRepos.map((repo, i) => {
          const key = `${repo.org}/${repo.name}`
          const isExpanded = expanded[key]
          return (
            <ScrollReveal key={key} delay={i * 0.04}>
              <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15" >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-white/30">{repo.org} /</p>
                    <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-white/20 transition-colors group-hover:text-primary/60"
                    aria-label={`Open ${repo.org}/${repo.name} on GitHub`}
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
                <p className="mb-3 text-xs text-muted-foreground leading-relaxed">{repo.description}</p>
                {isExpanded && (
                  <div className="mb-3 rounded-lg border border-primary/15 bg-primary/[0.05] p-3" >
                    <span className="block mb-1 font-mono text-[9px] uppercase tracking-widest text-primary/60" >What you learn:</span>
                    <p className="text-xs text-white/55 leading-relaxed" >{repo.learn}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40" >{repo.lang}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-white/30" >
                    <Star size={10} />
                    {repo.stars}
                  </span>
                  <button
                    onClick={() => toggleExpand(key)}
                    className="ml-auto rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/35 transition-colors hover:border-primary/30 hover:text-primary cursor-pointer" aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Less' : 'What to learn'}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </DomainLayout>
  )
}
