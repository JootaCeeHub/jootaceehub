'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Plus,
  Send,
  Bot,
  User,
  Trash2,
  Settings2,
  Database,
  Sparkles,
  FileText,
  Search,
  Layout,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { callLLM, PROVIDER_ACCENT, PROVIDER_LABELS } from '@/lib/ai/providers'
import type { ChatConversation, ChatMessage, LLMProfile } from '@/lib/admin/types'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  { icon: Layout,   label: 'Generar plantilla',    prompt: 'Generate a landing page template for my portfolio based on the site context provided.' },
  { icon: Search,   label: 'Auditar conversión',   prompt: 'Audit my website for conversion optimization opportunities. What can be improved?' },
  { icon: FileText, label: 'Mejorar copy del hero', prompt: 'Rewrite and improve the hero section copy to be more compelling and conversion-focused.' },
  { icon: Sparkles, label: 'Sugerir nuevos bloques', prompt: 'Suggest 5 new website sections or blocks I should add to my portfolio website.' },
]

function buildSystemPrompt(state: import('@/lib/admin/types').AdminState): string {
  return `You are an AI assistant embedded in the JootaCee Command Center — a personal portfolio CMS for an AI systems architect.

## Site Context
Name: ${state.site.name}
URL: ${state.site.url}
Description: ${state.site.description}
Focus: ${state.site.businessFocus}

## Active Projects (${state.labsRegistry.length})
${state.labsRegistry.filter(l => l.visible).map(l => `- ${l.name} (${l.status}): ${l.tagline}`).join('\n')}

## Research Articles (${state.researchRegistry.filter(r => r.published).length} published)
${state.researchRegistry.filter(r => r.published).map(r => `- ${r.title} [${r.category}]`).join('\n')}

## Systems
${state.systemsRegistry.filter(s => s.visible).map(s => `- ${s.name}: ${s.description}`).join('\n')}

Help the user develop their website content, improve copy, generate templates, and provide strategic advice. Be concise and actionable. Format code blocks with triple backticks when relevant.`
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function AIAssistantPanel() {
  const { state, dispatch } = useAdmin()
  const { aiConfig } = state

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeConversation = aiConfig.conversations.find(
    (c) => c.id === aiConfig.activeConversationId
  ) ?? null

  const activeProfile = aiConfig.profiles.find((p) => p.id === aiConfig.activeProfileId) ?? aiConfig.profiles[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length, isLoading])

  const createConversation = useCallback((): ChatConversation => {
    const now = new Date().toISOString()
    return {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      profileId: activeProfile?.id ?? '',
      createdAt: now,
      updatedAt: now,
    }
  }, [activeProfile])

  const handleNewConversation = useCallback(() => {
    const conv = createConversation()
    dispatch({ type: 'AI_NEW_CONVERSATION', payload: conv })
    setError(null)
  }, [createConversation, dispatch])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    if (!activeProfile) {
      setError('No LLM profile configured. Add an API key in Settings.')
      return
    }

    setError(null)
    setInput('')

    // Ensure there's a conversation
    let convId = activeConversation?.id
    if (!convId) {
      const conv = createConversation()
      dispatch({ type: 'AI_NEW_CONVERSATION', payload: conv })
      convId = conv.id
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    }

    dispatch({ type: 'AI_ADD_MESSAGE', payload: { conversationId: convId, message: userMsg } })

    // Auto-title after first message
    const currentConv = aiConfig.conversations.find((c) => c.id === convId)
    if (!currentConv || currentConv.messages.length === 0) {
      const title = text.slice(0, 48) + (text.length > 48 ? '…' : '')
      dispatch({ type: 'AI_UPDATE_TITLE', payload: { conversationId: convId, title } })
    }

    setIsLoading(true)
    try {
      const profile: LLMProfile = {
        ...activeProfile,
        apiKey: editingKeys[activeProfile.id] !== undefined ? editingKeys[activeProfile.id] : activeProfile.apiKey,
      }

      const history = [...(currentConv?.messages ?? []), userMsg]
      const systemPrompt = aiConfig.siteContextEnabled ? buildSystemPrompt(state) : undefined
      const response = await callLLM(profile, history, systemPrompt)

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        model: response.model,
      }

      dispatch({ type: 'AI_ADD_MESSAGE', payload: { conversationId: convId, message: assistantMsg } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }, [activeConversation, activeProfile, aiConfig, createConversation, dispatch, editingKeys, isLoading, state])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const saveProfileKey = (profileId: string) => {
    const key = editingKeys[profileId]
    if (key !== undefined) {
      const profile = aiConfig.profiles.find((p) => p.id === profileId)
      if (profile) {
        dispatch({ type: 'AI_SET_PROFILE', payload: { ...profile, apiKey: key } })
      }
      setEditingKeys((prev) => { const n = { ...prev }; delete n[profileId]; return n })
    }
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-0 overflow-hidden rounded-xl border border-white/8">
      {/* Conversation sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/8 bg-white/[0.015]">
        <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">Conversations</span>
          <button onClick={handleNewConversation} className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-cyan-400/10 hover:text-cyan-400 hover:border-cyan-400/20" title="New conversation">
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {aiConfig.conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Bot className="h-5 w-5 text-white/20" />
              <span className="font-mono text-[10px] text-white/25">No conversations yet</span>
            </div>
          ) : (
            aiConfig.conversations.map((conv) => (
              <div key={conv.id} className="group relative flex items-start">
                <button
                  className={cn(
                    'group w-full rounded-lg px-2.5 py-2 text-left transition-colors',
                    conv.id === aiConfig.activeConversationId
                      ? 'bg-white/8 text-white/80'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/65'
                  )}
                  onClick={() => dispatch({ type: 'AI_SET_ACTIVE', payload: conv.id })}
                >
                  <div className="truncate font-mono text-[10px] leading-snug">{conv.title}</div>
                  <div className="mt-0.5 font-mono text-[9px] text-white/25">{conv.createdAt.slice(0, 10)}</div>
                </button>
                <button
                  className="ml-auto hidden h-4 w-4 shrink-0 items-center justify-center rounded text-white/25 hover:text-red-400 group-hover:flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: 'AI_DELETE_CONVERSATION', payload: conv.id })
                  }}
                  title="Delete conversation"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0 bg-[#060610]">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2">
          <span className="flex-1 truncate font-mono text-[11px] text-white/50">
            {activeConversation?.title ?? 'Asistente IA — Tu copiloto del Panel Maestro'}
          </span>

          {/* Provider selector */}
          <div className="flex items-center gap-2">
            {aiConfig.profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'AI_SET_ACTIVE_PROFILE', payload: p.id })}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[10px] text-white/60 cursor-pointer hover:bg-white/[0.06] hover:text-white/80 transition-colors"
                style={p.id === aiConfig.activeProfileId ? { borderColor: `${PROVIDER_ACCENT[p.provider]}30`, color: PROVIDER_ACCENT[p.provider] } : undefined}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: PROVIDER_ACCENT[p.provider] }}
                />
                {p.label}
              </button>
            ))}
          </div>

          {/* Context toggle */}
          <button
            onClick={() => dispatch({ type: 'AI_TOGGLE_CONTEXT', payload: !aiConfig.siteContextEnabled })}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors cursor-pointer',
              aiConfig.siteContextEnabled
                ? 'border-cyan-400/20 bg-cyan-400/8 text-cyan-400'
                : 'border-white/8 bg-white/3 text-white/30 hover:border-white/15'
            )}
          >
            <Database className="h-3 w-3" />
            Contexto del sitio
          </button>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[10px] text-white/60 cursor-pointer hover:bg-white/[0.06] hover:text-white/80 transition-colors"
            style={showSettings ? { borderColor: '#a78bfa40', color: '#a78bfa' } : undefined}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.025]">
                <Sparkles className="h-6 w-6 text-white/25" />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">Empieza con una acción rápida</div>
              <div className="font-mono text-[10px] text-white/20 max-w-xs">o escribe tu propia pregunta sobre tu sitio web</div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80 hover:border-white/20"
                    >
                      <Icon className="h-3 w-3" />
                      {action.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            activeConversation.messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold',
                  msg.role === 'user' ? 'bg-cyan-400/15 text-cyan-400' : 'bg-violet-400/15 text-violet-400'
                )}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-xl px-3.5 py-2.5',
                  msg.role === 'user'
                    ? 'rounded-tr-sm bg-cyan-400/8 border border-cyan-400/15'
                    : 'rounded-tl-sm bg-white/[0.04] border border-white/8'
                )}>
                  <div className="font-mono text-[11px] leading-relaxed text-white/75 whitespace-pre-wrap">{msg.content}</div>
                  <div className="mt-1 font-mono text-[9px] text-white/25">
                    {msg.timestamp.slice(11, 16)}
                    {msg.model && ` · ${msg.model}`}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold bg-violet-400/15 text-violet-400">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-xl rounded-tl-sm border border-white/8 bg-white/[0.04] px-3.5 py-2.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 font-mono text-[11px] text-red-400">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/8 p-3">
          {aiConfig.siteContextEnabled && (
            <div className="mb-2 flex items-center gap-1.5">
              <Database className="h-3 w-3 text-cyan-400/40" />
              <span className="font-mono text-[9px] text-white/25">Contexto del sitio adjunto</span>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje. Enter para enviar, Shift+Enter para nueva línea."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-mono text-[11px] text-white/80 placeholder-white/20 outline-none transition-colors focus:border-white/20 focus:bg-white/[0.05]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                !input.trim() || isLoading
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-cyan-400/15 text-cyan-400 hover:bg-cyan-400/25 border border-cyan-400/20'
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings drawer */}
      {showSettings && (
        <aside className="flex w-64 shrink-0 flex-col border-l border-white/8 bg-white/[0.015] overflow-y-auto">
          <div className="border-b border-white/8 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">API Keys &amp; Profiles</div>
          </div>
          <div className="p-3 space-y-2">
            {aiConfig.profiles.map((profile) => (
              <div
                key={profile.id}
                className={cn(
                  'mb-2 rounded-xl border p-3 cursor-pointer transition-colors',
                  profile.id === aiConfig.activeProfileId
                    ? 'border-cyan-400/25 bg-cyan-400/5'
                    : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'
                )}
                onClick={() => dispatch({ type: 'AI_SET_ACTIVE_PROFILE', payload: profile.id })}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: PROVIDER_ACCENT[profile.provider] }}
                  />
                  <div className="font-mono text-[10px] font-semibold text-white/70">{profile.label}</div>
                </div>
                <div className="font-mono text-[9px] text-white/35">{PROVIDER_LABELS[profile.provider]} · {profile.model}</div>
                {profile.provider !== 'ollama' && (
                  <input
                    type="password"
                    placeholder="API Key…"
                    className="mt-2 w-full rounded-lg border border-white/8 bg-black/30 px-2 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20"
                    value={editingKeys[profile.id] ?? profile.apiKey}
                    onChange={(e) => setEditingKeys((prev) => ({ ...prev, [profile.id]: e.target.value }))}
                    onBlur={() => saveProfileKey(profile.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {profile.provider === 'ollama' && (
                  <input
                    type="text"
                    placeholder="http://localhost:11434"
                    className="mt-2 w-full rounded-lg border border-white/8 bg-black/30 px-2 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20"
                    defaultValue={profile.baseUrl ?? ''}
                    onBlur={(e) => dispatch({ type: 'AI_SET_PROFILE', payload: { ...profile, baseUrl: e.target.value } })}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            ))}
            <div className="pt-1 font-mono text-[9px] text-white/20 leading-relaxed">
              API keys are stored locally in your browser. Never committed to version control.
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
