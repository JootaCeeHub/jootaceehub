import type { LLMProfile, ChatMessage } from '@/lib/ai/types'

export interface LLMResponse {
  content: string
  model: string
}

type ProviderMessage = { role: string; content: string }

function toProviderMessages(messages: ChatMessage[]): ProviderMessage[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))
}

async function callGemini(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const body: Record<string, unknown> = { contents }
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${profile.model}:generateContent?key=${profile.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Gemini error ${res.status}`)
  }

  const data = await res.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return { content: text, model: profile.model }
}

async function callClaude(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const providerMessages = toProviderMessages(messages)

  const body: Record<string, unknown> = {
    model: profile.model,
    max_tokens: 4096,
    messages: providerMessages,
  }
  if (systemPrompt) body.system = systemPrompt

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': profile.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Claude error ${res.status}`)
  }

  const data = await res.json() as { content: Array<{ text: string }>; model: string }
  return { content: data.content?.[0]?.text ?? '', model: data.model }
}

async function callOpenAI(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const providerMessages: ProviderMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...toProviderMessages(messages)]
    : toProviderMessages(messages)

  const baseUrl = profile.baseUrl ?? 'https://api.openai.com'

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${profile.apiKey}`,
    },
    body: JSON.stringify({ model: profile.model, messages: providerMessages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${res.status}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }>; model: string }
  return { content: data.choices?.[0]?.message?.content ?? '', model: data.model }
}

async function callOllama(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const providerMessages: ProviderMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...toProviderMessages(messages)]
    : toProviderMessages(messages)

  const baseUrl = profile.baseUrl ?? 'http://localhost:11434'

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: profile.model, messages: providerMessages, stream: false }),
  })

  if (!res.ok) throw new Error(`Ollama error ${res.status}`)

  const data = await res.json() as { message: { content: string } }
  return { content: data.message?.content ?? '', model: profile.model }
}

async function callHermes(profile: LLMProfile, messages: ChatMessage[], systemPrompt?: string): Promise<LLMResponse> {
  const providerMessages: ProviderMessage[] = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...toProviderMessages(messages)]
    : toProviderMessages(messages)

  const baseUrl = (profile.baseUrl ?? 'http://localhost:8000').replace(/\/$/, '')

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (profile.apiKey) headers['Authorization'] = `Bearer ${profile.apiKey}`

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: profile.model, messages: providerMessages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Hermes error ${res.status}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }>; model: string }
  return { content: data.choices?.[0]?.message?.content ?? '', model: data.model ?? profile.model }
}

export async function callLLM(
  profile: LLMProfile,
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<LLMResponse> {
  if (!profile.apiKey && profile.provider !== 'ollama' && profile.provider !== 'hermes') {
    throw new Error(`No API key configured for ${profile.label}. Add it in AI Assistant → Settings.`)
  }

  switch (profile.provider) {
    case 'gemini':  return callGemini(profile, messages, systemPrompt)
    case 'claude':  return callClaude(profile, messages, systemPrompt)
    case 'openai':  return callOpenAI(profile, messages, systemPrompt)
    case 'ollama':  return callOllama(profile, messages, systemPrompt)
    case 'hermes':  return callHermes(profile, messages, systemPrompt)
    default: throw new Error(`Unknown provider: ${profile.provider}`)
  }
}

export const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  claude: 'Anthropic Claude',
  openai: 'OpenAI',
  ollama: 'Ollama (Local)',
  hermes: 'Hermes Agent',
}

export const PROVIDER_ACCENT: Record<string, string> = {
  gemini: '#4285f4',
  claude: '#cc785c',
  openai: '#10a37f',
  ollama: '#a78bfa',
  hermes: '#06b6d4',
}
