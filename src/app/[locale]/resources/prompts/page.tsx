'use client'

import { useState } from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Copy, Check } from 'lucide-react'
import { DomainLayout } from '@/components/layout/DomainLayout'
import { DomainBreadcrumb } from '@/components/layout/DomainBreadcrumb'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
type FilterCategory = 'All' | 'System' | 'Task' | 'Meta' | 'DevOps' | 'Data' | 'Business'

interface Prompt {
  title: string
  category: string
  filterKey: FilterCategory
  text: string
  models: string[]
}

const systemPrompts: Prompt[] = [
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

const taskPrompts: Prompt[] = [
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

const metaPrompts: Prompt[] = [
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

const devopsPrompts: Prompt[] = [
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

const dataPrompts: Prompt[] = [
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

const businessPrompts: Prompt[] = [
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

const allPrompts = [...systemPrompts, ...taskPrompts, ...metaPrompts, ...devopsPrompts, ...dataPrompts, ...businessPrompts]

const promptChains = [
  {
    name: 'Blog Post Pipeline',
    description: 'Multi-step chain to produce a fully-optimized blog post from a single topic idea.',
    steps: [
      { num: '1', label: 'Research', prompt: 'Find the 5 most authoritative sources on [TOPIC]. Summarize key findings, statistics, and expert opinions.' },
      { num: '2', label: 'Outline', prompt: 'Using the research above, create a detailed H2/H3 outline for a 1500-word blog post targeting [AUDIENCE]. Include a hook and CTA.' },
      { num: '3', label: 'Draft', prompt: 'Write the full blog post following the outline above. Use active voice, short paragraphs, and conversational but authoritative tone.' },
      { num: '4', label: 'SEO', prompt: 'Optimize the draft for SEO. Suggest: primary keyword, 5 secondary keywords, meta title (60 chars), meta description (155 chars), and internal linking opportunities.' },
      { num: '5', label: 'Social', prompt: 'Create 3 social media posts from the blog post: one LinkedIn (professional, 150 words), one X/Twitter (hook + 3 key points + CTA), one Instagram caption with hashtags.' },
    ],
  },
  {
    name: 'Code Review Pipeline',
    description: 'Systematic multi-agent code review across correctness, security, performance, and refactoring.',
    steps: [
      { num: '1', label: 'Analyze', prompt: 'Read this code and summarize: what it does, its inputs/outputs, and any notable patterns or anti-patterns you observe.' },
      { num: '2', label: 'Security Check', prompt: 'Review for OWASP Top 10 vulnerabilities. Report each finding with CWE ID, severity, and exact line numbers.' },
      { num: '3', label: 'Performance Check', prompt: 'Identify O(n²)+ algorithms, N+1 queries, unnecessary re-renders, and missing caching opportunities. Rate current estimated complexity.' },
      { num: '4', label: 'Refactor', prompt: 'Apply all findings from the previous steps. Produce a complete refactored version with inline comments explaining every change.' },
    ],
  },
]

const principles = [
  {
    num: '01',
    title: 'Be specific about format',
    desc: '"Respond in JSON with keys: title, severity, code_snippet" beats "give me structured output"',
  },
  {
    num: '02',
    title: 'Give the model a role',
    desc: '"You are a senior TypeScript engineer" activates relevant training. More specific = better.',
  },
  {
    num: '03',
    title: 'Use examples (few-shot)',
    desc: '2-3 examples outperform long instructions for format-sensitive tasks. Show, don\'t tell.',
  },
  {
    num: '04',
    title: 'Set constraints explicitly',
    desc: '"Do not use any/unknown", "max 3 bullet points", "no preamble" prevent drift.',
  },
  {
    num: '05',
    title: 'Chain of thought for reasoning',
    desc: 'Add "Think step by step before answering" to any task requiring multi-step logic.',
  },
  {
    num: '06',
    title: 'Iterate on real outputs',
    desc: 'The best prompt is the one that produces the output you want. Test on real data, not hypotheticals.',
  },
]

const filterTabs: FilterCategory[] = ['All', 'System', 'Task', 'Meta', 'DevOps', 'Data', 'Business']

function CopyButton({ text }: { text: string }) {
  const [copied, copy] = useCopyToClipboard()
  return (
    <button onClick={() => copy(text)} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/40 transition-all hover:border-primary/40 hover:text-primary cursor-pointer" aria-label="Copy prompt">
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function PromptCard({ prompt, delay }: { prompt: Prompt; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div className="group rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/15" >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{prompt.title}</p>
            <p className="mt-0.5 font-mono text-[10px] text-white/30 uppercase tracking-wider" >{prompt.category}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyButton text={prompt.text} />
          </div>
        </div>
        <pre className="mb-3 rounded-lg border border-white/6 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/50 line-clamp-3" >{prompt.text}</pre>
        <div className="flex flex-wrap gap-1.5">
          {prompt.models.map(m => (
            <span key={m} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40" >{m}</span>
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}

export default function ResourcesPromptsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All')

  const visiblePrompts = activeFilter === 'All'
    ? allPrompts
    : allPrompts.filter(p => p.filterKey === activeFilter)

  return (
    <DomainLayout>
      <div className="mb-12">
        <DomainBreadcrumb />
        <span className={`mt-6 block mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-primary`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Resources / Prompts
        </span>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">AI Prompts.</span>
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          System prompts, task prompts, meta-prompts, DevOps, data analysis, and business prompts.
          Plus multi-step chaining patterns. Click copy — paste anywhere.
        </p>
      </div>

      {/* Prompt Engineering Principles */}
      <div className="mb-10">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60">Prompt Engineering Principles</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map(p => (
            <div key={p.num} className="rounded-xl border border-white/8 bg-white/[0.025] p-4">
              <p className="mb-2 font-mono text-[9px] text-primary/40">{p.num}</p>
              <p className="mb-1 text-sm font-semibold text-white/75">{p.title}</p>
              <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
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

      <div className="flex flex-col gap-3">
        {visiblePrompts.map((p, i) => (
          <PromptCard key={p.title} prompt={p} delay={i * 0.04} />
        ))}
      </div>

      {/* Prompt Chaining Examples */}
      <p className="mb-4 mt-10 font-mono text-[9px] uppercase tracking-[0.24em] text-primary/60" >Prompt Chaining Examples</p>
      <div className="flex flex-col gap-6">
        {promptChains.map((chain, ci) => (
          <ScrollReveal key={chain.name} delay={ci * 0.06}>
            <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.03] p-6" >
              <p className="mb-1 text-base font-bold text-white/90">{chain.name}</p>
              <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{chain.description}</p>
              <div className="flex flex-col gap-4">
                {chain.steps.map((step, si) => (
                  <div key={step.num} className="">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/20 font-mono text-[9px] font-bold text-violet-400" >{step.num}</span>
                      <span className="font-mono text-xs font-semibold text-violet-300/80">{step.label}</span>
                      {si < chain.steps.length - 1 && (
                        <span className="ml-1 font-mono text-xs text-white/20">→</span>
                      )}
                    </div>
                    <pre className="rounded-lg border border-white/6 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/45 overflow-x-auto whitespace-pre-wrap" >{step.prompt}</pre>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </DomainLayout>
  )
}
