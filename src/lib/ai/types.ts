/**
 * AI bounded context types.
 *
 * These types belong to the AI module, not to the Admin store.
 * src/lib/admin/types.ts re-exports them for backward compatibility,
 * but this file is the canonical owner.
 *
 * See: src/lib/ai/providers.ts — LLM call dispatchers
 *      src/lib/admin/slices/ai.ts — AdminState mutations
 *      src/components/admin/panels/AIAssistantPanel.tsx — conversation UI
 */

// ── LLM Provider ──────────────────────────────────────────────────────────────

export type LLMProvider = 'gemini' | 'claude' | 'openai' | 'ollama' | 'hermes'

export interface LLMProfile {
  id:       string
  provider: LLMProvider
  label:    string
  model:    string
  apiKey:   string
  baseUrl?: string
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

// ── AIConfig (persisted in AdminState) ────────────────────────────────────────

export interface AIConfig {
  conversations:         ChatConversation[]
  activeConversationId:  string | null
  profiles:              LLMProfile[]
  activeProfileId:       string | null
  siteContextEnabled:    boolean
}
