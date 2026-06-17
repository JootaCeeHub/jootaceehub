import type {
  AIConfig,
  IntegrationsConfig,
  CapabilitiesConfig,
  HermesConfig,
  PlatformConnection,
  SocialPlatform,
} from '../types'

// ─── AI Config ────────────────────────────────────────────────────────────────

export const defaultAIConfig: AIConfig = {
  conversations: [],
  activeConversationId: null,
  profiles: [
    { id: 'gemini-flash',  provider: 'gemini',  label: 'Gemini 2.0 Flash', model: 'gemini-2.0-flash',   apiKey: '' },
    { id: 'claude-sonnet', provider: 'claude',  label: 'Claude Sonnet 4',  model: 'claude-sonnet-4-5',  apiKey: '' },
    { id: 'gpt-4o',        provider: 'openai',  label: 'GPT-4o',           model: 'gpt-4o',             apiKey: '' },
  ],
  activeProfileId: 'gemini-flash',
  siteContextEnabled: true,
}

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
      description: 'Generates and edits website copy, section text, and CTAs.',
      source: 'built-in',
      type: 'skill',
      enabled: true,
    },
    {
      id: 'seo-audit',
      name: 'SEO Auditor',
      description: 'Analyzes pages for SEO gaps, meta quality, and keyword density.',
      source: 'built-in',
      type: 'skill',
      enabled: true,
    },
    {
      id: 'code-review',
      name: 'Code Reviewer',
      description: 'Reviews component code, spots issues, suggests improvements.',
      source: 'built-in',
      type: 'agent',
      enabled: false,
    },
  ],
  hermes: defaultHermes,
  platforms: defaultPlatforms,
}
