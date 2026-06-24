import type { LLMProfile, ChatMessage, LLMConnectionStatus } from '@/lib/ai/types'

export interface LLMResponse {
  content:     string
  model:       string
  tokensIn?:   number
  tokensOut?:  number
  latencyMs?:  number
}

// ── Provider metadata ─────────────────────────────────────────────────────────

export const PROVIDER_LABELS: Record<string, string> = {
  openai:      'OpenAI',
  claude:      'Anthropic Claude',
  gemini:      'Google Gemini',
  deepseek:    'DeepSeek',
  moonshot:    'Moonshot AI (Kimi)',
  openrouter:  'OpenRouter',
  mistral:     'Mistral AI',
  groq:        'Groq',
  together:    'Together AI',
  perplexity:  'Perplexity',
  xai:         'xAI Grok',
  cohere:      'Cohere',
  ollama:      'Ollama (local)',
  llamacpp:    'llama.cpp (local)',
  hermes:      'Hermes Agent',
}

export const PROVIDER_ACCENT: Record<string, string> = {
  openai:      '#10a37f',
  claude:      '#cc785c',
  gemini:      '#4285f4',
  deepseek:    '#4d6fff',
  moonshot:    '#7c3aed',
  openrouter:  '#f97316',
  mistral:     '#ff7000',
  groq:        '#f5a623',
  together:    '#06b6d4',
  perplexity:  '#20b2aa',
  xai:         '#1da1f2',
  cohere:      '#39d353',
  ollama:      '#a78bfa',
  llamacpp:    '#6366f1',
  hermes:      '#06b6d4',
}

export const PROVIDER_BASE_URL: Record<string, string> = {
  openai:      'https://api.openai.com',
  claude:      'https://api.anthropic.com',
  gemini:      'https://generativelanguage.googleapis.com',
  deepseek:    'https://api.deepseek.com',
  moonshot:    'https://api.moonshot.cn',
  openrouter:  'https://openrouter.ai/api',
  mistral:     'https://api.mistral.ai',
  groq:        'https://api.groq.com/openai',
  together:    'https://api.together.xyz',
  perplexity:  'https://api.perplexity.ai',
  xai:         'https://api.x.ai',
  cohere:      'https://api.cohere.com',
  ollama:      'http://localhost:11434',
  llamacpp:    'http://localhost:8080',
  hermes:      'http://localhost:8000',
}

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
    'o1', 'o1-mini', 'o3', 'o3-mini',
  ],
  claude: [
    'claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001',
    'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  gemini: [
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash',
    'gemini-1.5-pro', 'gemini-1.5-flash',
  ],
  deepseek: [
    'deepseek-chat', 'deepseek-reasoner', 'deepseek-coder',
  ],
  moonshot: [
    'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k',
    'kimi-latest',
  ],
  openrouter: [
    'auto',
    'anthropic/claude-opus-4', 'anthropic/claude-sonnet-4-5',
    'openai/gpt-4o', 'openai/o3-mini',
    'deepseek/deepseek-r1', 'deepseek/deepseek-chat',
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'mistralai/mistral-large',
    'x-ai/grok-2',
    'cohere/command-r-plus',
  ],
  mistral: [
    'mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest',
    'codestral-latest', 'open-mistral-7b', 'open-mixtral-8x7b',
  ],
  groq: [
    'llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192',
    'mixtral-8x7b-32768', 'gemma2-9b-it', 'whisper-large-v3',
  ],
  together: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
    'mistralai/Mixtral-8x22B-Instruct-v0.1',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'deepseek-ai/DeepSeek-R1',
  ],
  perplexity: [
    'sonar-pro', 'sonar', 'sonar-reasoning-pro', 'sonar-reasoning',
    'sonar-deep-research',
  ],
  xai: [
    'grok-3', 'grok-3-mini', 'grok-2-1212', 'grok-beta', 'grok-vision-beta',
  ],
  cohere: [
    'command-r-plus', 'command-r', 'command-light', 'command',
    'command-r-plus-08-2024', 'command-r-08-2024',
  ],
  ollama: [
    'llama3.2', 'llama3.1', 'llama3', 'codellama', 'mistral',
    'phi3', 'qwen2.5', 'deepseek-r1', 'gemma2',
  ],
  llamacpp: ['local-model'],
  hermes: ['hermes-3', 'nous-hermes-2', 'local'],
}

export const PROVIDER_COSTS: Record<string, { input: number; output: number }> = {
  openai:      { input: 2.50,  output: 10.00 },  // gpt-4o
  claude:      { input: 3.00,  output: 15.00 },  // claude-sonnet-4
  gemini:      { input: 0.075, output: 0.30  },  // gemini-2.0-flash
  deepseek:    { input: 0.14,  output: 0.28  },  // deepseek-chat
  moonshot:    { input: 0.12,  output: 0.12  },  // moonshot-v1-8k
  openrouter:  { input: 0,     output: 0     },  // varies per model
  mistral:     { input: 2.00,  output: 6.00  },  // mistral-large
  groq:        { input: 0.59,  output: 0.79  },  // llama-3.3-70b
  together:    { input: 0.88,  output: 0.88  },  // llama-3.3-70b
  perplexity:  { input: 1.00,  output: 1.00  },  // sonar-pro
  xai:         { input: 2.00,  output: 10.00 },  // grok-3
  cohere:      { input: 2.50,  output: 10.00 },  // command-r-plus
  ollama:      { input: 0,     output: 0     },
  llamacpp:    { input: 0,     output: 0     },
  hermes:      { input: 0,     output: 0     },
}

// Providers that need no API key (local servers)
export const LOCAL_PROVIDERS = new Set<string>(['ollama', 'llamacpp', 'hermes'])

// Providers using OpenAI-compatible /v1/chat/completions
const OPENAI_COMPAT = new Set<string>([
  'openai', 'deepseek', 'moonshot', 'openrouter', 'mistral',
  'groq', 'together', 'perplexity', 'xai', 'llamacpp', 'hermes',
])

// ── Internal helpers ──────────────────────────────────────────────────────────

type ProviderMessage = { role: string; content: string }

function toMsgs(messages: ChatMessage[], systemPrompt?: string): ProviderMessage[] {
  const base = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }))
  return systemPrompt ? [{ role: 'system', content: systemPrompt }, ...base] : base
}

// ── OpenAI-compatible (handles 10+ providers) ────────────────────────────────

async function callOpenAICompat(
  profile: LLMProfile,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<LLMResponse> {
  const baseUrl = (profile.baseUrl ?? PROVIDER_BASE_URL[profile.provider] ?? 'https://api.openai.com').replace(/\/$/, '')
  const msgs = toMsgs(messages, systemPrompt)

  const body: Record<string, unknown> = {
    model: profile.model,
    messages: msgs,
  }
  if (profile.temperature != null) body.temperature = profile.temperature
  if (profile.maxTokens)           body.max_tokens = profile.maxTokens

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (profile.apiKey) headers['Authorization'] = `Bearer ${profile.apiKey}`

  // OpenRouter extras
  if (profile.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://jootacee.com'
    headers['X-Title']      = 'JOOTACEEHUB Admin'
  }

  const t0  = Date.now()
  const res = await fetch(`${baseUrl}/v1/chat/completions`, { method: 'POST', headers, body: JSON.stringify(body) })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `${PROVIDER_LABELS[profile.provider]} error ${res.status}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
    model: string
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }

  return {
    content:    data.choices?.[0]?.message?.content ?? '',
    model:      data.model ?? profile.model,
    tokensIn:   data.usage?.prompt_tokens,
    tokensOut:  data.usage?.completion_tokens,
    latencyMs:  Date.now() - t0,
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────────

async function callGemini(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))

  const body: Record<string, unknown> = { contents }
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] }
  if (profile.temperature != null) body.generationConfig = { temperature: profile.temperature, ...(profile.maxTokens ? { maxOutputTokens: profile.maxTokens } : {}) }

  const t0  = Date.now()
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${profile.model}:generateContent?key=${profile.apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Gemini error ${res.status}`)
  }

  const data = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }
  }

  return {
    content:   data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    model:     profile.model,
    tokensIn:  data.usageMetadata?.promptTokenCount,
    tokensOut: data.usageMetadata?.candidatesTokenCount,
    latencyMs: Date.now() - t0,
  }
}

// ── Anthropic Claude ─────────────────────────────────────────────────────────

async function callClaude(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const filtered = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
  const body: Record<string, unknown> = { model: profile.model, max_tokens: profile.maxTokens ?? 4096, messages: filtered }
  if (systemPrompt)              body.system      = systemPrompt
  if (profile.temperature != null) body.temperature = profile.temperature

  const t0  = Date.now()
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':                           'application/json',
      'x-api-key':                              profile.apiKey,
      'anthropic-version':                      '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Claude error ${res.status}`)
  }

  const data = await res.json() as {
    content: Array<{ text: string }>
    model: string
    usage?: { input_tokens?: number; output_tokens?: number }
  }
  return {
    content:   data.content?.[0]?.text ?? '',
    model:     data.model,
    tokensIn:  data.usage?.input_tokens,
    tokensOut: data.usage?.output_tokens,
    latencyMs: Date.now() - t0,
  }
}

// ── Ollama ────────────────────────────────────────────────────────────────────

async function callOllama(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const msgs = toMsgs(messages, systemPrompt)
  const baseUrl = (profile.baseUrl ?? 'http://localhost:11434').replace(/\/$/, '')

  const t0  = Date.now()
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: profile.model, messages: msgs, stream: false }),
  })

  if (!res.ok) throw new Error(`Ollama error ${res.status}`)
  const data = await res.json() as {
    message: { content: string }
    eval_count?: number
    prompt_eval_count?: number
  }
  return {
    content:   data.message?.content ?? '',
    model:     profile.model,
    tokensIn:  data.prompt_eval_count,
    tokensOut: data.eval_count,
    latencyMs: Date.now() - t0,
  }
}

// ── Cohere ────────────────────────────────────────────────────────────────────

async function callCohere(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const history = messages
    .filter(m => m.role !== 'system')
    .slice(0, -1)
    .map(m => ({ role: m.role === 'assistant' ? 'CHATBOT' : 'USER', message: m.content }))

  const lastMsg = messages.filter(m => m.role !== 'system').at(-1)?.content ?? ''
  const body: Record<string, unknown> = { model: profile.model, message: lastMsg, chat_history: history }
  if (systemPrompt)                body.preamble    = systemPrompt
  if (profile.temperature != null) body.temperature  = profile.temperature
  if (profile.maxTokens)           body.max_tokens   = profile.maxTokens

  const t0  = Date.now()
  const res = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${profile.apiKey}` },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(err.message ?? `Cohere error ${res.status}`)
  }

  const data = await res.json() as {
    text: string
    meta?: { tokens?: { input_tokens?: number; output_tokens?: number } }
  }
  return {
    content:   data.text ?? '',
    model:     profile.model,
    tokensIn:  data.meta?.tokens?.input_tokens,
    tokensOut: data.meta?.tokens?.output_tokens,
    latencyMs: Date.now() - t0,
  }
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export async function callLLM(
  profile: LLMProfile,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<LLMResponse> {
  if (!profile.apiKey && !LOCAL_PROVIDERS.has(profile.provider)) {
    throw new Error(`No API key configured for ${profile.label}. Add it in Integrations → LLM.`)
  }

  if (profile.provider === 'gemini')  return callGemini(profile, messages, systemPrompt)
  if (profile.provider === 'claude')  return callClaude(profile, messages, systemPrompt)
  if (profile.provider === 'ollama')  return callOllama(profile, messages, systemPrompt)
  if (profile.provider === 'cohere')  return callCohere(profile, messages, systemPrompt)
  if (OPENAI_COMPAT.has(profile.provider)) return callOpenAICompat(profile, messages, systemPrompt)

  throw new Error(`Unknown provider: ${profile.provider}`)
}

// ── Connection test ───────────────────────────────────────────────────────────

export async function testConnection(profile: LLMProfile): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const t0 = Date.now()
  try {
    const probe: ChatMessage = {
      id: 'probe', role: 'user', content: 'Say "ok" in one word.', timestamp: new Date().toISOString(),
    }
    await callLLM({ ...profile, maxTokens: 20, temperature: 0 }, [probe])
    return { ok: true, latencyMs: Date.now() - t0 }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - t0, error: err instanceof Error ? err.message : String(err) }
  }
}

// ── Fallback chain ────────────────────────────────────────────────────────────

export async function callWithFallback(
  profiles: LLMProfile[],
  primaryId: string,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<LLMResponse & { usedProfileId: string }> {
  const visited = new Set<string>()
  let id: string | undefined = primaryId

  while (id && !visited.has(id)) {
    visited.add(id)
    const profile = profiles.find(p => p.id === id && p.enabled)
    if (!profile) break

    try {
      const res = await callLLM(profile, messages, systemPrompt)
      return { ...res, usedProfileId: profile.id }
    } catch {
      id = profile.fallbackToId
    }
  }

  throw new Error('All LLM providers in the fallback chain failed.')
}

// ── Status badge helper ───────────────────────────────────────────────────────

export function statusColor(status: LLMConnectionStatus): string {
  return {
    connected: '#34d399',
    error:     '#f87171',
    testing:   '#fbbf24',
    untested:  '#6b7280',
  }[status]
}
