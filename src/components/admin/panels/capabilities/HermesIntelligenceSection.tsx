'use client'

import { Brain, MemoryStick, Activity, MessageSquare, Zap, Wrench, Network, Server } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { HermesSection } from './HermesSection'

interface Props {
  isOpen: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

const FEATURES = [
  { key: 'learningLoop'       as const, label: 'Learning Loop',          desc: 'Agent evaluates own performance, creates skills from complex tasks, improves them during use',                        icon: <Brain className="h-3.5 w-3.5" /> },
  { key: 'persistentMemory'   as const, label: 'Persistent Memory',       desc: 'Context and user knowledge persist across sessions',                                                                   icon: <MemoryStick className="h-3.5 w-3.5" /> },
  { key: 'sessionSearch'      as const, label: 'Session Search (FTS5)',   desc: 'Full-text search over past conversations with LLM summarization',                                                      icon: <Activity className="h-3.5 w-3.5" /> },
  { key: 'userModeling'       as const, label: 'User Modeling (Honcho)',  desc: 'Dialectic user modeling — builds a deepening model of who you are',                                                   icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { key: 'voiceTranscription' as const, label: 'Voice Transcription',     desc: 'Transcribe voice memos from messaging platforms',                                                                       icon: <Zap className="h-3.5 w-3.5" /> },
  { key: 'researchMode'       as const, label: 'Research Mode',           desc: 'Batch trajectory generation for training next-generation tool-calling models',                                        icon: <Wrench className="h-3.5 w-3.5" /> },
  { key: 'subagents'          as const, label: 'Subagents',               desc: 'Spawn isolated subagents for parallel workstreams',                                                                    icon: <Network className="h-3.5 w-3.5" /> },
  { key: 'mcpEnabled'         as const, label: 'MCP Integration',         desc: 'Connect MCP servers configured in MCP tab',                                                                           icon: <Server className="h-3.5 w-3.5" /> },
] as const

export function HermesIntelligenceSection({ isOpen, onToggle }: Props) {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes
  if (!hermes) return null

  return (
    <HermesSection id="intelligence" title="Inteligencia y Memoria" isOpen={isOpen} onToggle={onToggle}>
      <div className="grid grid-cols-2 gap-2">
        {FEATURES.map((feat) => (
          <div key={feat.key} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.015] p-3">
            <div className="mt-0.5 shrink-0 text-white/30">{feat.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] font-semibold text-white/60">{feat.label}</div>
              <div className="font-mono text-[8.5px] text-white/25 leading-relaxed">{feat.desc}</div>
            </div>
            <Toggle enabled={!!hermes[feat.key]} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { [feat.key]: !hermes[feat.key] } })} />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Personality</div>
        <input type="text" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors" value={hermes.personality} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { personality: e.target.value } })} placeholder="default" />
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25" style={{ marginTop: '4px' }}>
          Command: hermes personality {hermes.personality || 'default'}
        </div>
      </div>

      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Context Files (comma-separated)</div>
        <input type="text" className="w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors" value={hermes.contextFiles} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { contextFiles: e.target.value } })} placeholder="AGENTS.md,SOUL.md,MEMORY.md" />
      </div>
    </HermesSection>
  )
}
