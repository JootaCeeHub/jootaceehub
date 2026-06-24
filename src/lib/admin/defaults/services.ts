import type {
  AIConfig,
  IntegrationsConfig,
  CapabilitiesConfig,
  HermesConfig,
  PlatformConnection,
  SocialPlatform,
} from '../types'

// ─── AI Config ────────────────────────────────────────────────────────────────

import type { LLMProfile, AgentProfile, AgentSkillRef } from '@/lib/ai/types'
import { PROVIDER_COSTS } from '@/lib/ai/providers'

const emptyStats = (): LLMProfile['stats'] => ({
  lastUsed: null, lastError: null, totalRequests: 0,
  totalTokensIn: 0, totalTokensOut: 0, avgLatencyMs: 0, errorCount: 0,
})

const prof = (
  id: string,
  provider: LLMProfile['provider'],
  label: string,
  model: string,
  extra: Partial<LLMProfile> = {}
): LLMProfile => ({
  id, provider, label, model, apiKey: '',
  enabled: false, status: 'untested', priority: 50,
  temperature: 0.7,
  costPer1kInput:  PROVIDER_COSTS[provider]?.input,
  costPer1kOutput: PROVIDER_COSTS[provider]?.output,
  stats: emptyStats(),
  ...extra,
})

export const defaultAIConfig: AIConfig = {
  conversations: [],
  activeConversationId: null,
  activeProfileId: 'gemini-flash',
  agentProfiles: [],                      // populated after DEFAULT_AGENT_PROFILES is declared below
  activeAgentProfileId: 'frontend-architect',
  siteContextEnabled: true,
  profiles: [
    // ── Tier 1 — major cloud providers ──────────────────────────────────────
    prof('openai-gpt4o',      'openai',      'GPT-4o',              'gpt-4o',                    { priority: 10 }),
    prof('openai-o3',         'openai',      'o3-mini',             'o3-mini',                   { priority: 15 }),
    prof('claude-sonnet',     'claude',      'Claude Sonnet 4',     'claude-sonnet-4-6',          { priority: 20 }),
    prof('claude-opus',       'claude',      'Claude Opus 4',       'claude-opus-4-8',            { priority: 25 }),
    prof('gemini-flash',      'gemini',      'Gemini 2.0 Flash',    'gemini-2.0-flash',          { priority: 30, enabled: true }),
    prof('gemini-pro',        'gemini',      'Gemini 2.5 Pro',      'gemini-2.5-pro',            { priority: 35 }),
    // ── Tier 2 — specialized / fast providers ───────────────────────────────
    prof('deepseek-chat',     'deepseek',    'DeepSeek Chat',       'deepseek-chat',             { priority: 40 }),
    prof('deepseek-r1',       'deepseek',    'DeepSeek Reasoner',   'deepseek-reasoner',         { priority: 42 }),
    prof('groq-llama',        'groq',        'Groq Llama 3.3 70B',  'llama-3.3-70b-versatile',   { priority: 45 }),
    prof('mistral-large',     'mistral',     'Mistral Large',       'mistral-large-latest',      { priority: 50 }),
    prof('moonshot-32k',      'moonshot',    'Kimi 32K',            'moonshot-v1-32k',           { priority: 55 }),
    // ── Tier 3 — gateway & search providers ─────────────────────────────────
    prof('openrouter',        'openrouter',  'OpenRouter (auto)',    'auto',                      { priority: 60 }),
    prof('perplexity-sonar',  'perplexity',  'Perplexity Sonar Pro','sonar-pro',                 { priority: 62 }),
    prof('together-llama',    'together',    'Together Llama 3.3',  'meta-llama/Llama-3.3-70B-Instruct-Turbo', { priority: 65 }),
    prof('xai-grok3',         'xai',         'xAI Grok 3',          'grok-3',                    { priority: 70 }),
    prof('cohere-rplus',      'cohere',      'Cohere Command R+',   'command-r-plus',            { priority: 75 }),
    // ── Tier 4 — local / self-hosted ────────────────────────────────────────
    prof('ollama-local',      'ollama',      'Ollama (local)',       'llama3.2',                  { priority: 80, enabled: true }),
    prof('llamacpp-local',    'llamacpp',    'llama.cpp (local)',    'local-model',               { priority: 85, baseUrl: 'http://localhost:8080' }),
    prof('hermes-local',      'hermes',      'Hermes Agent (local)', 'hermes-3',                 { priority: 90, baseUrl: 'http://localhost:8000' }),
  ],
}

// ─── Agent Profiles ───────────────────────────────────────────────────────────

const PROJECT_PATH = '/home/jootacee/Documentos/PROYECTOS/JOOTACEEHUB'

function skill(name: string, label: string, source: AgentSkillRef['source'] = 'global'): AgentSkillRef {
  return { id: name, name, label, source, enabled: true }
}

function agentProf(
  id: string,
  name: string,
  emoji: string,
  color: string,
  category: AgentProfile['category'],
  description: string,
  skills: AgentSkillRef[],
  systemPrompt: string,
  tags: string[] = [],
  llmProfileId = 'claude-sonnet'
): AgentProfile {
  const skillNames = skills.filter(s => s.enabled).map(s => s.name).join(' ')
  return {
    id, name, emoji, color, category, description, skills,
    llmProfileId,
    systemPrompt,
    contextFiles: [`${PROJECT_PATH}/CLAUDE.md`, `${PROJECT_PATH}/src/lib/admin/types.ts`],
    cliCommand: `claude ${skillNames ? `# Skills: ${skillNames}` : ''}`,
    enabled: true,
    isBuiltin: true,
    useCount: 0,
    lastUsed: null,
    tags,
  }
}

export const DEFAULT_AGENT_PROFILES: AgentProfile[] = [
  agentProf(
    'frontend-architect',
    'Frontend Architect',
    '🏗️', '#06b6d4', 'engineering',
    'Experto en Next.js 16, React 19, TypeScript strict y TailwindCSS v4. Builds static-export-compatible components con CVA e i18n.',
    [
      skill('nextjs-best-practices',    'Next.js Best Practices'),
      skill('nextjs-app-router-patterns','App Router Patterns'),
      skill('react-best-practices',     'React Best Practices'),
      skill('typescript-expert',        'TypeScript Expert'),
      skill('tailwind-design-system',   'Tailwind Design System'),
      skill('frontend-developer',       'Frontend Developer'),
    ],
    `Eres el Frontend Architect de JOOTACEEHUB.
Stack: Next.js 16.2 · React 19 · TypeScript strict · TailwindCSS v4 · Framer Motion · GSAP · R3F.
REGLAS ABSOLUTAS:
- output: 'export' → NUNCA API routes, SSR functions, ni dynamic routes sin generateStaticParams
- CSS: inline + CVA, NUNCA archivos .styles.ts
- Cero errores TypeScript en todo momento
- Cada nuevo hook necesita al menos un test
- I18n: toda string visible via useTranslations()
Cuando crees un componente, usa siempre: cn() para merge condicional, cva() para variantes, panel/btn/field de @/styles/ui para tokens compartidos.`,
    ['react', 'nextjs', 'typescript', 'tailwind', 'components', 'static-export']
  ),

  agentProf(
    'code-reviewer',
    'Code Reviewer',
    '🔍', '#a78bfa', 'engineering',
    'Revisión de código de élite: correctitud, seguridad, performance, TypeScript, y arquitectura.',
    [
      skill('code-reviewer',          'Code Reviewer'),
      skill('code-review-excellence', 'Code Review Excellence'),
      skill('typescript-expert',      'TypeScript Expert'),
      skill('security-auditor',       'Security Auditor'),
    ],
    `Eres el Code Reviewer de JOOTACEEHUB. Eres exhaustivo y constructivo.
Checklist obligatorio para cada review:
1. ¿TypeScript strict? ¿Algún any sin comentario explicativo?
2. ¿Violaciones de static export? (API routes, SSR, cookies(), headers())
3. ¿Patrones .styles.ts? (anti-patrón — migrar a inline+CVA)
4. ¿Math.random() o new Date() en render? (hydration mismatch)
5. ¿Supabase imports? (CONGELADO per ADR-008)
6. ¿Strings hardcodeadas sin i18n?
7. ¿Error handling con reportError() y no console.error()?
8. ¿Tests para nuevos hooks y utilities?
Reporta: [CRÍTICO] [ADVERTENCIA] [SUGERENCIA] con línea específica.`,
    ['review', 'typescript', 'security', 'quality']
  ),

  agentProf(
    'seo-specialist',
    'SEO Specialist',
    '📈', '#34d399', 'seo',
    'Auditor SEO técnico + AEO: Core Web Vitals, schema.org, metadata, sitemap, hreflang.',
    [
      skill('seo-audit',                    'SEO Audit'),
      skill('seo-technical',                'Technical SEO'),
      skill('seo-aeo-content-quality-auditor','AEO Content Auditor'),
      skill('seo-keyword-strategist',        'Keyword Strategist'),
      skill('seo-schema',                    'Schema.org Generator'),
      skill('seo-sitemap',                   'Sitemap Optimizer'),
    ],
    `Eres el SEO Specialist de JOOTACEEHUB (jootacee.com).
Stack: Next.js static export con output: 'export'. Metadata via export const metadata en page.tsx.
Objetivos actuales: Lighthouse SEO = 100 (ya alcanzado), mantener + mejorar GSC rankings.
Contexto: Portfolio personal de desarrollador full-stack, dark sci-fi aesthetic.
Prioridades:
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Schema.org: Person, Portfolio, Article, BreadcrumbList, WebSite
- hreflang: /en/ y /es/ con alternate links
- Canonical URLs en todas las páginas
- Sitemap.xml con todas las 107 rutas estáticas`,
    ['seo', 'aeo', 'performance', 'schema', 'metadata']
  ),

  agentProf(
    'content-creator',
    'Content Creator',
    '✍️', '#f59e0b', 'content',
    'Creador de contenido técnico: artículos, research, case studies. Bilingüe EN/ES.',
    [
      skill('content-creator',              'Content Creator'),
      skill('seo-aeo-content-quality-auditor','AEO Auditor'),
      skill('i18n-localization',             'i18n Localization'),
      skill('content-strategy',             'Content Strategy'),
      skill('seo-aeo-blog-writer',          'Blog Writer'),
    ],
    `Eres el Content Creator de JOOTACEEHUB. Escribes contenido técnico de alta calidad.
Formato de contenido: MDX en src/content/articles/ o src/content/research/
Frontmatter requerido:
  title, description, publishedAt (ISO), tags[], locale (en|es), status (draft|published)
Voz y tono: técnico pero accesible, primera persona, dark futuristic aesthetic.
SIEMPRE:
1. Escribir versión en inglés Y español (dos archivos separados con locale: en/es)
2. Incluir structured data friendly content (H2/H3 bien anidados)
3. Keywords semánticas naturales, no keyword stuffing
4. Longitud óptima: 800-2000 palabras para artículos, 300-600 para research notes`,
    ['content', 'mdx', 'i18n', 'blog', 'writing'],
    'gemini-flash'
  ),

  agentProf(
    'performance-engineer',
    'Performance Engineer',
    '⚡', '#fbbf24', 'analysis',
    'Diagnóstico y optimización de performance: bundle, React, Web Vitals, lazy loading.',
    [
      skill('performance-engineer',        'Performance Engineer'),
      skill('react-component-performance', 'React Component Performance'),
      skill('react-best-practices',        'React Best Practices'),
    ],
    `Eres el Performance Engineer de JOOTACEEHUB.
Baseline actual: Lighthouse Performance = 44 (objetivo: ≥ 55).
Bottlenecks conocidos: Three.js/R3F (shader compilation), Framer Motion, GSAP.
Estrategias disponibles:
- React.lazy() + Suspense para secciones 3D (ya implementado, continuar)
- Code splitting por ruta
- Tree shaking de GSAP plugins (solo importar lo que se usa)
- next/font con display: 'swap' (ya implementado)
- Preconnect hints para Google Fonts (ya implementado)
Herramientas: npm run analyze (ANALYZE=true build), Lighthouse CI en GitHub Actions.
Nunca sacrificar funcionalidad por performance — primero medir, luego optimizar.`,
    ['performance', 'bundle', 'lighthouse', 'react', 'vitals']
  ),

  agentProf(
    'a11y-auditor',
    'Accessibility Auditor',
    '♿', '#60a5fa', 'design',
    'Auditoría WCAG 2.1 AA: contraste, ARIA, keyboard nav, screen readers.',
    [
      skill('accessibility-compliance-accessibility-audit', 'A11y Audit'),
    ],
    `Eres el Accessibility Auditor de JOOTACEEHUB.
Objetivo: Lighthouse Accessibility ≥ 96 (baseline actual: 96 — mantener y mejorar).
Stack: React 19, Next.js, TailwindCSS. Dark theme por defecto con light theme alternativo.
Checklist WCAG 2.1 AA obligatorio:
- Contraste de color ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande)
- Todos los inputs con label asociado (htmlFor + id)
- Landmarks ARIA: main, nav, header, footer
- Focus visible en todos los elementos interactivos (:focus-visible)
- Alt text en imágenes (no decorativas)
- Heading order: h1 → h2 → h3 (sin saltos)
- No solo color para comunicar información
- prefers-reduced-motion: respetado en animations
Usa axe-core via @axe-core/react para testing automatizado.`,
    ['accessibility', 'wcag', 'aria', 'contrast', 'keyboard']
  ),

  agentProf(
    'devops-engineer',
    'DevOps Engineer',
    '🚀', '#f97316', 'devops',
    'CI/CD, GitHub Actions, Cloudflare Pages deploy, git workflows y pre-commit hooks.',
    [
      skill('deployment-engineer',       'Deployment Engineer'),
      skill('git-pr-workflows-pr-enhance','PR Enhancement'),
      skill('git-advanced-workflows',    'Git Advanced'),
      skill('git-pr-workflows-git-workflow','Git Workflow'),
    ],
    `Eres el DevOps Engineer de JOOTACEEHUB.
CI/CD: GitHub Actions (3 jobs: quality → build → lighthouse).
Deploy target: Cloudflare Pages (static export, output: 'export').
Pre-commit hooks: Husky + lint-staged → eslint + tsc --noEmit + vitest run.
Gates que NUNCA deben fallar en CI:
1. npm run typecheck (0 errores TypeScript)
2. npm run lint (0 violaciones ESLint)
3. npm run test (475 tests passing)
4. npm run build (107 páginas estáticas en dist/)
Proceso de PR: branch → commit conventionals → PR con descripción → CI verde → merge.
Rama principal: main. No force push a main nunca.`,
    ['deploy', 'ci', 'cd', 'github-actions', 'cloudflare', 'git']
  ),

  agentProf(
    'security-auditor',
    'Security Auditor',
    '🔒', '#ef4444', 'security',
    'Auditoría de seguridad: CSP, XSS, OWASP Top 10, dependency audit, secrets detection.',
    [
      skill('security-auditor',          'Security Auditor'),
      skill('security-audit',            'Security Audit'),
      skill('frontend-security-coder',   'Frontend Security'),
      skill('security-scanning-security-sast', 'SAST Scanner'),
    ],
    `Eres el Security Auditor de JOOTACEEHUB.
Contexto: Static export (no server → superficie de ataque reducida). Admin panel client-side.
Findings actuales documentados:
- Admin localStorage apiKey plaintext [Medium] → documentado, Phase 2 mitigation
- unsafe-inline + unsafe-eval en CSP [Low] → requerido por Next.js static + Three.js
Security headers via public/_headers (Netlify/Cloudflare Pages format).
CSP canonical: src/lib/config/csp.ts
Checklist obligatorio:
1. XSS: ¿user input renderizado sin sanitize?
2. Injection: ¿URL params usados sin validación?
3. Secrets: ¿API keys en código fuente o .env públicos?
4. Dependencies: npm audit --audit-level=high
5. CSP: ¿nuevas fuentes externas necesitan whitelist?`,
    ['security', 'csp', 'xss', 'owasp', 'audit']
  ),

  agentProf(
    'test-engineer',
    'Test Engineer',
    '🧪', '#10b981', 'engineering',
    'Vitest + React Testing Library: unit tests, integration, mocks y cobertura.',
    [
      skill('testing-patterns', 'Testing Patterns'),
      skill('testing-qa',       'Testing QA'),
    ],
    `Eres el Test Engineer de JOOTACEEHUB.
Framework: Vitest + React Testing Library + jsdom. Setup: src/test/setup.ts.
Baseline actual: 475 tests, 41 archivos — NUNCA reducir esta cifra.
Mocks configurados: next/navigation, next-themes, IntersectionObserver (function, no arrow).
Patrones obligatorios:
- Test behavior, NOT implementation (qué hace el user, no qué DOM hay)
- No mock de la base de datos (no aplica — solo localStorage)
- Co-location: Component.test.tsx junto a Component.tsx
- Naming: describe('ComponentName') → it('does X when Y')
- Cada nuevo hook: mínimo 1 test cubriendo el happy path
- Cada utility: 1 test por edge case
- NO test el DOM structure, test las interacciones
Setup mock de IntersectionObserver: usar function(), no arrow function.`,
    ['testing', 'vitest', 'rtl', 'unit', 'coverage']
  ),

  agentProf(
    'ai-architect',
    'AI Architect',
    '🧠', '#8b5cf6', 'ai',
    'Diseño de sistemas AI: agentes, MCP servers, orchestration, LLM routing y fallback chains.',
    [
      skill('ai-agents-architect', 'AI Agents Architect'),
      skill('agent-orchestrator',  'Agent Orchestrator'),
      skill('architect-review',    'Architect Review'),
    ],
    `Eres el AI Architect de JOOTACEEHUB.
Ecosistema actual:
- LLM Gateway: 15 proveedores (OpenAI, Claude, Gemini, DeepSeek, Moonshot, OpenRouter, Mistral, Groq, Together, Perplexity, xAI, Cohere, Ollama, llama.cpp, Hermes)
- MCP Servers: 83+ en el registry, 5 activos por defecto
- Skills: 38 comandos (14 built-in Claude Code + 24 custom)
- Agent Profiles: 10 perfiles curados + custom
- Hermes Agent: backend configurable (local, docker, SSH, modal, vercel)
Principios de diseño:
1. Static export first → no API routes, client-side LLM calls
2. Fallback chains → si provider falla, usar siguiente en cadena
3. Cost awareness → mostrar costos estimados por provider
4. Tool gateway → CAPABILITIES_* para habilitar/deshabilitar tools
Contexto: src/lib/ai/ (tipos + providers), src/lib/admin/defaults/services.ts (defaults)`,
    ['ai', 'agents', 'mcp', 'orchestration', 'llm']
  ),
]

// Populate agentProfiles now that DEFAULT_AGENT_PROFILES is defined
defaultAIConfig.agentProfiles = DEFAULT_AGENT_PROFILES

// ─── Integrations ─────────────────────────────────────────────────────────────

const p = (id: SocialPlatform['id'], visible = false): SocialPlatform => ({
  id, connected: false, handle: '', profileUrl: '', apiKey: '', displayName: '', bio: '', avatarUrl: '', stats: [], visible, lastSync: null,
})

const DEFAULT_SOCIAL_PLATFORMS: SocialPlatform[] = [
  // Social
  p('linkedin',     true),
  p('twitter',      true),
  p('instagram'),
  p('tiktok'),
  p('bluesky'),
  p('mastodon'),
  p('reddit'),
  p('facebook'),
  p('threads'),
  // Video / Streaming
  p('youtube'),
  p('twitch'),
  p('vimeo'),
  // Developer
  p('devto'),
  p('hashnode'),
  p('stackoverflow'),
  p('gitlab'),
  p('huggingface'),
  p('npm_org'),
  // Design
  p('behance'),
  p('dribbble'),
  p('figma'),
  // Content
  p('medium'),
  p('substack'),
  p('beehiiv'),
  // Audio
  p('spotify'),
  p('soundcloud'),
  // Community
  p('telegram'),
  p('discord'),
  p('notion'),
  // Monetization
  p('producthunt'),
  p('gumroad'),
  p('kofi'),
  p('patreon'),
]

export const defaultIntegrations: IntegrationsConfig = {
  github: {
    connected: false,
    accessToken: '',
    username: '',
    avatarUrl: '',
    repos: [],
    selectedRepos: [],
    lastSync: null,
  },
  dataSources: [],
  socialPlatforms: DEFAULT_SOCIAL_PLATFORMS,
}

// ─── Hermes & Platforms ───────────────────────────────────────────────────────

const SHOWCASE_SYSTEM_PROMPT = `You are the **Showcase Generator** — a specialized agent embedded in JootaCee's command center.

MISSION: Analyze a private codebase and produce five professional public-facing documents that position the project compellingly, WITHOUT revealing any proprietary implementation details, source code, or business-sensitive information.

━━━ ABSOLUTE CONSTRAINTS ━━━
NEVER output: actual source code, function/class/variable names, internal API endpoint paths, database table/column names, environment variable names, specific package versions, internal folder structures beyond high-level layers, pricing or access-control logic, security implementation details, or performance numbers that reveal algorithmic efficiency secrets.

━━━ OUTPUT FORMAT ━━━
Return ONLY a valid JSON object with exactly these five string keys (no markdown fences, no extra text):
{ "readme": "...", "showcase": "...", "architecture": "...", "features": "...", "stack": "..." }

━━━ DOCUMENT SPECIFICATIONS ━━━

**readme** — PUBLIC README (README-PUBLIC.md)
- Title with tech stack badge row (shields.io format)
- One compelling paragraph: what problem it solves, for whom
- ## Features — 5-7 bullets (what it does, NOT how)
- ## Architecture — Mermaid flowchart diagram (conceptual layers, max 6 nodes)
- ## Status — Live / Beta / R&D badge + brief note
- ## Access — "This is a premium product. Contact hello@jootacee.com for licensing and demo access."
- Under 400 words. Professional. No fluff.

**showcase** — MARKETING SHOWCASE (SHOWCASE.md)
- # Hero tagline — under 12 words, ends with impact
- ## The Problem — 2 sentences, paint the pain clearly
- ## The Solution — 2 paragraphs, outcomes-focused, no tech details
- ## Core Capabilities — 6-8 items: **[Emoji] Feature Name** — one-line description each
- ## Built For — 3 target personas or use cases
- ## Technology Foundation — grouped: AI/ML Layer | Data Layer | Application Layer | Infrastructure
- ## Access — waitlist or contact CTA
- Tone: confident technical credibility. ~500 words.

**architecture** — ARCHITECTURE OVERVIEW (ARCHITECTURE.md)
- ## System Overview — 1 paragraph conceptual description
- ## Architecture Diagram — Mermaid flowchart (max 8 nodes, component names are conceptual: "AI Engine", "API Gateway", "Data Store", etc.)
- ## Core Components — table: Component | Role | Key Characteristic
- ## Integration Layer — what categories of external services it connects to (no specific vendors unless public-domain knowledge)
- ## Security Model — high-level: authentication approach, data handling, isolation
- ## Scalability — how it scales conceptually
- ~300 words + diagram.

**features** — FEATURE HIGHLIGHTS (FEATURES.md)
- ## Feature Matrix — markdown table: Feature | Category | Status | Business Value
- For each major feature: ### Feature Name → Description (2 sentences) + User Benefit (1 sentence) + Status
- Extract 6-10 features from the codebase analysis
- Focus on user-facing value and outcomes, not technical mechanics
- ~400 words.

**stack** — TECH STACK CARD (STACK.md)
- ## Technology Stack
- Sections: **Frontend** | **Backend** | **AI/ML** | **Data** | **Infrastructure** | **DevOps**
- Each entry: Technology Name — why chosen (architecture rationale, 1 sentence)
- ## Engineering Philosophy — 2-3 sentences on architectural decisions that shaped the stack
- NO versions, NO internal package names, NO configs
- ~250 words.

━━━ TONE GUIDE ━━━
Professional-technical. A senior engineer who understands business value, writing for a technical audience that evaluates software. Precise. Confident. No buzzwords like "revolutionary" or "game-changing". Facts and clarity over hype.`

export const defaultHermes: HermesConfig = {
  enabled: false,
  backend: 'local',
  endpoint: 'http://localhost:8000',
  status: 'disconnected',
  provider: 'openrouter',
  model: 'nousresearch/hermes-3-llama-3.1-70b',
  portalEnabled: false,
  portalToken: '',
  learningLoop: true,
  persistentMemory: true,
  scheduler: false,
  subagents: true,
  mcpEnabled: true,
  lastConnected: null,
  apiKey: '',
  sshHost: '',
  sshUser: 'ubuntu',
  sshPort: '22',
  dockerImage: 'nousresearch/hermes-agent:latest',
  singularityImage: '',
  modalAppName: 'hermes-agent',
  daytonaWorkspace: 'hermes-workspace',
  vercelFunctionUrl: '',
  voiceTranscription: false,
  sessionSearch: true,
  userModeling: true,
  researchMode: false,
  commandApproval: true,
  containerIsolation: false,
  allowedUsers: '',
  personality: 'default',
  contextFiles: 'AGENTS.md,SOUL.md,MEMORY.md',
  scheduledTasks: [],
  version: '',
  toolGateway: false,
}

export const defaultPlatforms: PlatformConnection[] = [
  { id: 'telegram', enabled: false, token: '', botName: '', status: 'inactive' },
  { id: 'discord',  enabled: false, token: '', botName: '', status: 'inactive' },
  { id: 'slack',    enabled: false, token: '', botName: '', status: 'inactive' },
  { id: 'whatsapp', enabled: false, token: '', botName: '', status: 'inactive' },
  { id: 'signal',   enabled: false, token: '', botName: '', status: 'inactive' },
]

// ─── Capabilities ─────────────────────────────────────────────────────────────

export const defaultCapabilities: CapabilitiesConfig = {
  mcpServers: [
    {
      id: 'mcp-local',
      name: 'Local MCP Gateway',
      url: 'http://localhost:3100',
      transport: 'http',
      description: 'Local development MCP server with file system and tool access.',
      enabled: false,
    },
    {
      id: 'mcp-hermes',
      name: 'Hermes Agent Server',
      url: 'http://localhost:8000',
      transport: 'http',
      description: 'Hermes AI agent with tool gateway — web search, image gen, TTS, browser automation.',
      enabled: false,
    },
    {
      id: 'mcp-filesystem-local',
      name: 'Filesystem (local)',
      url: 'stdio://npx @modelcontextprotocol/server-filesystem',
      transport: 'stdio',
      description: 'Read/write access to project files. Required for content editing workflows.',
      enabled: false,
    },
    {
      id: 'mcp-github-remote',
      name: 'GitHub',
      url: 'stdio://npx @modelcontextprotocol/server-github',
      transport: 'stdio',
      description: 'Manage repos, issues, PRs, and releases from Hermes.',
      enabled: false,
    },
    {
      id: 'mcp-memory-store',
      name: 'Memory Store',
      url: 'stdio://npx @modelcontextprotocol/server-memory',
      transport: 'stdio',
      description: 'Persistent key-value memory for Hermes agent sessions.',
      enabled: false,
    },
  ],
  skills: [
    {
      id: 'showcase-generator',
      name: 'Showcase Generator',
      description: 'Analyzes private repos and generates 5 public-facing documents (README, Showcase, Architecture, Features, Stack) without exposing proprietary code or business logic.',
      source: 'built-in',
      type: 'agent',
      enabled: true,
      systemPrompt: SHOWCASE_SYSTEM_PROMPT,
    },
    {
      id: 'web-content',
      name: 'Web Content Writer',
      description: 'Generates and edits website copy, section text, and CTAs aligned with brand voice.',
      source: 'built-in',
      type: 'skill',
      enabled: true,
    },
    {
      id: 'seo-audit',
      name: 'SEO Auditor',
      description: 'Analyzes pages for SEO gaps, meta quality, keyword density, and Core Web Vitals impact.',
      source: 'built-in',
      type: 'skill',
      enabled: true,
    },
    {
      id: 'code-review',
      name: 'Code Reviewer',
      description: 'Reviews TypeScript/React component code — spots bugs, type holes, and performance issues.',
      source: 'built-in',
      type: 'agent',
      enabled: true,
    },
    {
      id: 'a11y-audit',
      name: 'Accessibility Auditor',
      description: 'Checks components and pages against WCAG 2.1 AA — color contrast, ARIA, focus order, keyboard nav.',
      source: 'built-in',
      type: 'skill',
      enabled: true,
    },
    {
      id: 'i18n-checker',
      name: 'i18n Coverage Checker',
      description: 'Scans TSX files for untranslated strings and validates key parity between en.json and es.json.',
      source: 'built-in',
      type: 'tool',
      enabled: true,
    },
    {
      id: 'design-auditor',
      name: 'Design Token Auditor',
      description: 'Ensures all components use tokens from ui.ts and design/tokens.ts — flags inline hex colors and magic numbers.',
      source: 'built-in',
      type: 'skill',
      enabled: false,
    },
    {
      id: 'content-qa',
      name: 'Content QA Scanner',
      description: 'Scans content/ JSON and MDX for placeholder text, broken links, and missing required fields.',
      source: 'built-in',
      type: 'tool',
      enabled: true,
    },
    {
      id: 'bundle-analyzer',
      name: 'Bundle Analyzer',
      description: 'Runs ANALYZE=true build and generates a ranked list of the largest chunks with tree-shaking suggestions.',
      source: 'built-in',
      type: 'tool',
      enabled: false,
    },
    {
      id: 'test-generator',
      name: 'Test Generator',
      description: 'Generates Vitest + React Testing Library tests for hooks and components from source code.',
      source: 'built-in',
      type: 'agent',
      enabled: false,
    },
    {
      id: 'content-translator',
      name: 'Content Translator',
      description: 'Translates English content JSON/MDX to Spanish, preserving Markdown formatting and i18n key structure.',
      source: 'built-in',
      type: 'skill',
      enabled: false,
    },
    {
      id: 'perf-optimizer',
      name: 'Performance Optimizer',
      description: 'Identifies LCP, CLS, and INP bottlenecks and generates lazy-loading and code-splitting recommendations.',
      source: 'built-in',
      type: 'agent',
      enabled: false,
    },
    {
      id: 'social-copywriter',
      name: 'Social Media Copywriter',
      description: 'Generates platform-native copy (Twitter/X, LinkedIn, Instagram) from project content.',
      source: 'built-in',
      type: 'skill',
      enabled: false,
    },
    {
      id: 'git-summarizer',
      name: 'Git Activity Summarizer',
      description: 'Reads recent git log and produces a human-readable changelog and release notes.',
      source: 'built-in',
      type: 'tool',
      enabled: true,
    },
    {
      id: 'type-generator',
      name: 'Type Generator',
      description: 'Generates TypeScript interfaces from JSON data, API responses, and Zod schemas.',
      source: 'built-in',
      type: 'tool',
      enabled: false,
    },
  ],
  hermes: defaultHermes,
  platforms: defaultPlatforms,
}
