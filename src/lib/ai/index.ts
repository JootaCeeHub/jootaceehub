/**
 * AI module — public API.
 *
 * Import from here to access AI types and LLM call helpers.
 * Do NOT import AI types from @/lib/admin/types — that file re-exports
 * from here for backward compatibility only.
 */

export type {
  LLMProvider,
  LLMProfile,
  ChatMessage,
  ChatConversation,
  AIConfig,
} from './types'

export type { LLMResponse } from './providers'

export {
  callLLM,
  PROVIDER_LABELS,
  PROVIDER_ACCENT,
} from './providers'
