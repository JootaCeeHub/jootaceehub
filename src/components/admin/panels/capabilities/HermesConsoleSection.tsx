'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send, Check, Copy, Bot, User, Terminal,
  ChevronDown, Sparkles, RotateCcw,
} from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { HermesSection } from './HermesSection'

interface ConsoleLine {
  id: string
  role: 'user' | 'hermes' | 'system' | 'error'
  content: string
  ts: string
  cmd?: string
}

const PROJECT_CONTEXT = `Proyecto: JOOTACEEHUB
Stack: Next.js 16.2 · React 19 · TypeScript · TailwindCSS v4
Ruta: /home/jootacee/Documentos/PROYECTOS/JOOTACEEHUB
Output: static export (output: 'export')
Contenido: src/content/ (Git canonical)
Admin: /admin panel con AdminState`

const PRESET_PROMPTS: { label: string; prompt: string; cmd: string; color: string }[] = [
  {
    label: 'Analizar contenido',
    prompt: 'Analiza el contenido del proyecto JOOTACEEHUB. Lee src/content/ y genera un informe con: gaps de contenido, proyectos sin publicar, artículos faltantes en ES, y recomendaciones de prioridad.',
    cmd: 'claude "Analiza src/content/ del proyecto JOOTACEEHUB. Identifica gaps, proyectos sin publicar, i18n faltante y prioridades de contenido. Genera informe completo."',
    color: '#a78bfa',
  },
  {
    label: 'Auditar TypeScript',
    prompt: 'Ejecuta un audit TypeScript completo del proyecto. Busca: any sin comentario, tipos inconsistentes, imports circulares, y patrones que violen las leyes del CLAUDE.md.',
    cmd: 'claude "Audit TypeScript en JOOTACEEHUB: busca any sin comentario, tipos inconsistentes, violaciones de CLAUDE.md. Genera lista priorizada de fixes."',
    color: '#38bdf8',
  },
  {
    label: 'SEO completo',
    prompt: 'Audita el SEO del proyecto JOOTACEEHUB. Revisa: metadata en app/[locale]/layout.tsx, títulos de página, OG tags, sitemap, y structured data. Genera reporte con fixes.',
    cmd: 'claude "Audit SEO completo de JOOTACEEHUB: metadata, OG tags, sitemap, structured data. Lista de mejoras prioritarias."',
    color: '#fbbf24',
  },
  {
    label: 'Generar changelog',
    prompt: 'Lee el git log reciente y genera un changelog profesional en formato Keep a Changelog. Incluye: Features, Fixes, Refactors, Performance. Usa el stack del proyecto como contexto.',
    cmd: 'git log --oneline -50 | claude "Genera changelog profesional en formato Keep a Changelog. Stack: Next.js 16, React 19, TypeScript."',
    color: '#34d399',
  },
  {
    label: 'Revisar a11y',
    prompt: 'Audita la accesibilidad del proyecto JOOTACEEHUB contra WCAG 2.1 AA. Revisa: componentes en src/components/, aria-labels, focus management, color contrast, keyboard navigation.',
    cmd: 'claude "Audit WCAG 2.1 AA en JOOTACEEHUB: aria, focus, contraste, keyboard nav en src/components/. Lista de fixes prioritarios."',
    color: '#fb923c',
  },
  {
    label: 'Optimizar bundle',
    prompt: 'Analiza el bundle del proyecto JOOTACEEHUB. Identifica: chunks más grandes, dependencias duplicadas, código dead, oportunidades de lazy loading. Genera plan de optimización.',
    cmd: 'ANALYZE=true npm run build && claude "Analiza el bundle de JOOTACEEHUB, identifica los chunks más pesados y genera un plan de lazy loading y tree-shaking."',
    color: '#e879f9',
  },
  {
    label: 'Verificar i18n',
    prompt: 'Verifica la cobertura i18n del proyecto JOOTACEEHUB. Busca: strings sin traducir en TSX, claves faltantes en es.json vs en.json, y componentes que no usan useTranslations.',
    cmd: 'claude "Verifica i18n en JOOTACEEHUB: strings sin traducir, claves faltantes en messages/es.json vs en.json. Genera lista con paths y fixes."',
    color: '#60a5fa',
  },
  {
    label: 'Generar tests',
    prompt: 'Genera tests Vitest para los hooks y utilidades sin cobertura en src/hooks/ y src/lib/. Usa el patrón establecido en src/test/setup.ts y los tests existentes como referencia.',
    cmd: 'claude "Genera tests Vitest + RTL para hooks en src/hooks/ y utilidades en src/lib/ sin cobertura. Patrón: ver src/test/setup.ts"',
    color: '#4ade80',
  },
]

function formatTs(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch { return ts }
}

interface Props { isOpen: boolean; onToggle: () => void }

export function HermesConsoleSection({ isOpen, onToggle }: Props) {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes

  const [lines,       setLines]       = useState<ConsoleLine[]>([
    { id: '0', role: 'system', content: `Hermes Console inicializada.\n${PROJECT_CONTEXT}`, ts: new Date().toISOString() },
  ])
  const [input,       setInput]       = useState('')
  const [sending,     setSending]     = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [copiedId,    setCopiedId]    = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const connected = hermes?.status === 'connected'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  function copyLine(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  async function send(promptOverride?: string) {
    const text = (promptOverride ?? input).trim()
    if (!text || sending) return
    setInput('')
    setSending(true)

    const userLine: ConsoleLine = { id: crypto.randomUUID(), role: 'user', content: text, ts: new Date().toISOString() }
    setLines(prev => [...prev, userLine])

    if (connected && hermes?.endpoint) {
      try {
        const endpoint = hermes.endpoint.replace(/\/$/, '')
        const res = await fetch(`${endpoint}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(hermes.apiKey ? { Authorization: `Bearer ${hermes.apiKey}` } : {}),
          },
          body: JSON.stringify({
            model: hermes.model,
            messages: [
              { role: 'system', content: `You are Hermes, an AI agent with full access to the JOOTACEEHUB project.\n${PROJECT_CONTEXT}\n\nContext files: ${hermes.contextFiles}` },
              { role: 'user', content: text },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            stream: false,
          }),
          signal: AbortSignal.timeout(30000),
        })
        if (res.ok) {
          const data = await res.json() as { choices: { message: { content: string } }[] }
          const reply = data.choices?.[0]?.message?.content ?? '(no response)'
          setLines(prev => [...prev, { id: crypto.randomUUID(), role: 'hermes', content: reply, ts: new Date().toISOString() }])
          dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { lastConnected: new Date().toISOString() } })
        } else {
          setLines(prev => [...prev, { id: crypto.randomUUID(), role: 'error', content: `HTTP ${res.status}: ${res.statusText}`, ts: new Date().toISOString() }])
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Request failed'
        setLines(prev => [...prev, { id: crypto.randomUUID(), role: 'error', content: msg, ts: new Date().toISOString() }])
      }
    } else {
      // Not connected — show equivalent Claude Code command
      const preset = PRESET_PROMPTS.find(p => p.prompt === text)
      const cmd = preset?.cmd ?? `claude "${text.replace(/"/g, '\\"')}"`
      setLines(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Hermes desconectado. Usa este comando en tu terminal:',
        cmd,
        ts: new Date().toISOString(),
      }])
    }

    setSending(false)
  }

  function applyPreset(p: typeof PRESET_PROMPTS[0]) {
    setShowPresets(false)
    send(p.prompt)
  }

  const roleStyle: Record<ConsoleLine['role'], { border: string; bg: string; label: string; icon: React.ReactNode; text: string }> = {
    user:   { border: 'border-white/10',         bg: 'bg-white/[0.03]',       label: 'tú',     icon: <User className="h-3 w-3" />,     text: 'text-white/60' },
    hermes: { border: 'border-cyan-400/15',       bg: 'bg-cyan-400/[0.04]',    label: 'hermes', icon: <Bot className="h-3 w-3" />,      text: 'text-cyan-300/80' },
    system: { border: 'border-violet-400/12',     bg: 'bg-violet-400/[0.03]',  label: 'system', icon: <Terminal className="h-3 w-3" />, text: 'text-violet-300/70' },
    error:  { border: 'border-red-400/20',        bg: 'bg-red-400/[0.04]',     label: 'error',  icon: <Terminal className="h-3 w-3" />, text: 'text-red-300/80' },
  }

  return (
    <HermesSection id="console" title="Consola de Hermes" isOpen={isOpen} onToggle={onToggle}>

      {/* Connection indicator */}
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${connected ? 'border-cyan-400/15 bg-cyan-400/5' : 'border-white/8 bg-white/[0.02]'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
        <span className="font-mono text-[9px] text-white/50">
          {connected ? `Conectado · ${hermes?.model?.split('/').pop()}` : 'Desconectado — los comandos se generan como CLI'}
        </span>
        {!connected && (
          <span className="ml-auto font-mono text-[8px] text-amber-400/60">usa terminal →</span>
        )}
      </div>

      {/* Message log */}
      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto space-y-2 rounded-xl border border-white/6 bg-black/25 p-3 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {lines.map(line => {
          const s = roleStyle[line.role]
          return (
            <div key={line.id} className={`group rounded-lg border p-2.5 ${s.border} ${s.bg}`}>
              <div className="flex items-start gap-2">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-white/8 mt-0.5" style={{ background: line.role === 'hermes' ? '#0e7490' : line.role === 'user' ? '#374151' : '#1e1b4b' }}>
                  <div className={s.text}>{s.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[7.5px] uppercase tracking-[0.14em] ${s.text}`}>{s.label}</span>
                    <span className="font-mono text-[7px] text-white/20" suppressHydrationWarning>{formatTs(line.ts)}</span>
                  </div>
                  <div className={`font-mono text-[9.5px] leading-relaxed whitespace-pre-wrap break-words ${s.text}`}>
                    {line.content}
                  </div>
                  {line.cmd && (
                    <div className="mt-2 rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1.5">
                      <div className="flex items-start gap-2">
                        <code className="flex-1 font-mono text-[8.5px] text-emerald-400/80 break-all leading-relaxed">{line.cmd}</code>
                        <button
                          onClick={() => copyLine(line.id, line.cmd!)}
                          className="shrink-0 flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-1.5 py-0.5 font-mono text-[7px] text-emerald-400 transition-colors hover:bg-emerald-400/15"
                        >
                          {copiedId === line.id ? <><Check className="h-2 w-2" />✓</> : <><Copy className="h-2 w-2" />Copy</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {!line.cmd && (
                  <button
                    onClick={() => copyLine(line.id, line.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex h-5 w-5 items-center justify-center rounded-md border border-white/8 text-white/20 hover:text-white/55"
                  >
                    {copiedId === line.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {sending && (
          <div className="flex items-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] px-3 py-2">
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="font-mono text-[8.5px] text-cyan-400/60">{connected ? 'Hermes procesando…' : 'Generando comando…'}</span>
          </div>
        )}
      </div>

      {/* Preset prompts */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(v => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 font-mono text-[9.5px] text-white/45 transition-colors hover:bg-white/[0.04] hover:text-white/65"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet-400/60" />
            <span>Acciones rápidas del proyecto</span>
          </div>
          <ChevronDown className={`h-3 w-3 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
        </button>
        {showPresets && (
          <div className="mt-1 grid grid-cols-2 gap-1.5 rounded-xl border border-white/8 bg-black/30 p-2">
            {PRESET_PROMPTS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                disabled={sending}
                className="group flex items-start gap-2 rounded-lg border border-white/6 bg-white/[0.02] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-40"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] font-medium text-white/60 group-hover:text-white/80 transition-colors">{p.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <textarea
          rows={2}
          placeholder={connected ? 'Escribe un mensaje para Hermes…' : 'Escribe una tarea — se generará el comando CLI…'}
          className="flex-1 resize-none rounded-xl border border-white/8 bg-black/20 px-3 py-2 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors leading-relaxed"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send() }}
        />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${input.trim() && !sending ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20' : 'border-white/8 bg-white/3 text-white/20'}`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setLines([{ id: '0', role: 'system', content: `Consola limpiada.\n${PROJECT_CONTEXT}`, ts: new Date().toISOString() }])}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/20 transition-colors hover:bg-red-400/10 hover:text-red-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="font-mono text-[7.5px] text-white/18">⌘+Enter para enviar · {connected ? 'Conectado a Hermes API' : 'Modo CLI — genera comandos'}</div>

    </HermesSection>
  )
}
