/**
 * AI bounded context types.
 *
 * Canonical owner. src/lib/admin/types.ts re-exports for backward compatibility.
 *
 * See: src/lib/ai/providers.ts — LLM call dispatchers
 *      src/lib/admin/slices/ai.ts — AdminState mutations
 *      src/components/admin/panels/AIAssistantPanel.tsx — conversation UI
 *      src/components/admin/panels/integrations/LLMConnectionsTab.tsx — connections UI
 */

// ── LLM Provider ──────────────────────────────────────────────────────────────

export type LLMProvider =
  | 'openai'       // OpenAI (GPT-4o, o1, o3…)
  | 'claude'       // Anthropic Claude
  | 'gemini'       // Google Gemini
  | 'deepseek'     // DeepSeek (OpenAI-compatible)
  | 'moonshot'     // Moonshot AI / Kimi (OpenAI-compatible)
  | 'openrouter'   // OpenRouter — multi-model gateway (OpenAI-compatible)
  | 'mistral'      // Mistral AI (OpenAI-compatible)
  | 'groq'         // Groq — ultra-fast inference (OpenAI-compatible)
  | 'together'     // Together AI (OpenAI-compatible)
  | 'perplexity'   // Perplexity Sonar (OpenAI-compatible)
  | 'xai'          // xAI Grok (OpenAI-compatible)
  | 'cohere'       // Cohere Command (Cohere API)
  | 'ollama'       // Ollama — local models
  | 'llamacpp'     // llama.cpp server (OpenAI-compatible)
  | 'hermes'       // Hermes Agent local/remote

export type LLMConnectionStatus = 'connected' | 'error' | 'untested' | 'testing'

export interface LLMProfileStats {
  lastUsed:         string | null
  lastError:        string | null
  totalRequests:    number
  totalTokensIn:    number
  totalTokensOut:   number
  avgLatencyMs:     number
  errorCount:       number
}

export interface LLMProfile {
  id:             string
  provider:       LLMProvider
  label:          string
  model:          string
  apiKey:         string
  baseUrl?:       string
  // Generation params
  temperature?:   number        // 0–2, default 0.7
  maxTokens?:     number        // default provider max
  // Connection
  enabled:        boolean
  status:         LLMConnectionStatus
  priority:       number        // lower = tried first in fallback chain
  fallbackToId?:  string        // profile id to try on failure
  // Cost tracking (per 1K tokens, USD)
  costPer1kInput?:  number
  costPer1kOutput?: number
  // Stats (updated client-side on each call)
  stats:          LLMProfileStats
}

// ── Conversation ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:        string
  role:      'user' | 'assistant' | 'system'
  content:   string
  timestamp: string
  model?:    string
}

export interface ChatConversation {
  id:        string
  title:     string
  messages:  ChatMessage[]
  profileId: string
  createdAt: string
  updatedAt: string
}

// ── Agent Profile ─────────────────────────────────────────────────────────────

export type AgentCategory =
  | 'engineering'   // Frontend, backend, architecture
  | 'content'       // Writing, translation, docs
  | 'seo'           // SEO, AEO, content quality
  | 'devops'        // Deploy, CI/CD, git
  | 'security'      // Audits, pen-test, compliance
  | 'design'        // UI/UX, accessibility, design systems
  | 'analysis'      // Analytics, performance, debugging
  | 'ai'            // Agent orchestration, AI architecture
  | 'custom'        // User-created

export interface AgentSkillRef {
  id:       string          // unique within profile
  name:     string          // skill directory name (e.g. 'nextjs-best-practices')
  label:    string          // human label
  source:   'global' | 'project' | 'builtin'  // where the skill lives
  enabled:  boolean
}

export interface AgentProfile {
  id:            string
  name:          string
  description:   string
  emoji:         string         // single emoji icon
  color:         string         // hex accent color
  category:      AgentCategory
  // LLM wiring
  llmProfileId:  string         // which LLMProfile.id to use
  temperature?:  number         // overrides LLMProfile.temperature
  // Skills from ~/.claude/skills/ or project skills
  skills:        AgentSkillRef[]
  // Context injected into every conversation
  systemPrompt:  string
  contextFiles:  string[]       // file paths to inject
  // Invocation
  cliCommand:    string         // generated claude CLI hint
  // State
  enabled:       boolean
  isBuiltin:     boolean        // shipped with the app (not user-created)
  useCount:      number
  lastUsed:      string | null
  tags:          string[]
}

// ── AIConfig (persisted in AdminState) ────────────────────────────────────────

export interface AIConfig {
  conversations:         ChatConversation[]
  activeConversationId:  string | null
  profiles:              LLMProfile[]
  activeProfileId:       string | null
  agentProfiles:         AgentProfile[]
  activeAgentProfileId:  string | null
  siteContextEnabled:    boolean
}
