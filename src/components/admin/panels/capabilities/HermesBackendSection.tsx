'use client'

import { Check, Copy } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { HermesSection } from './HermesSection'
import { BACKENDS } from './hermes-constants'

interface Props {
  isOpen: boolean
  onToggle: () => void
  copied: Record<string, boolean>
  onCopy: (key: string, text: string) => void
}

const fieldCls = 'w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors'

export function HermesBackendSection({ isOpen, onToggle, copied, onCopy }: Props) {
  const { state, dispatch } = useAdmin()
  const hermes = state.capabilities.hermes
  if (!hermes) return null

  return (
    <HermesSection id="backend" title="Backend y despliegue" isOpen={isOpen} onToggle={onToggle}>
      <div className="grid grid-cols-4 gap-2">
        {BACKENDS.map((b) => (
          <button
            key={b.id}
            onClick={() => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { backend: b.id } })}
            className={`rounded-lg border p-2.5 text-left transition-colors ${hermes.backend === b.id ? 'border-cyan-400/25 bg-cyan-400/8' : 'border-white/8 bg-white/[0.015] hover:border-white/15 hover:bg-white/5'}`}
          >
            <span className={`block font-mono text-[10px] font-semibold ${hermes.backend === b.id ? 'text-cyan-400' : 'text-white/55'}`}>{b.label}</span>
            <span className="block font-mono text-[8px] text-white/25">{b.desc}</span>
          </button>
        ))}
      </div>

      {hermes.backend === 'docker' && (
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Docker Image</div>
          <input type="text" className={fieldCls} value={hermes.dockerImage} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { dockerImage: e.target.value } })} placeholder="nousresearch/hermes-agent:latest" />
        </div>
      )}
      {hermes.backend === 'ssh' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">SSH Host</div>
            <input type="text" className={fieldCls} value={hermes.sshHost} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { sshHost: e.target.value } })} placeholder="192.168.1.100" />
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">SSH User</div>
            <input type="text" className={fieldCls} value={hermes.sshUser} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { sshUser: e.target.value } })} placeholder="ubuntu" />
          </div>
          <div>
            <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">SSH Port</div>
            <input type="text" className={fieldCls} value={hermes.sshPort} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { sshPort: e.target.value } })} placeholder="22" />
          </div>
        </div>
      )}
      {hermes.backend === 'singularity' && (
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Singularity Image</div>
          <input type="text" className={fieldCls} value={hermes.singularityImage} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { singularityImage: e.target.value } })} placeholder="hermes-agent.sif" />
        </div>
      )}
      {hermes.backend === 'modal' && (
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Modal App Name</div>
          <input type="text" className={fieldCls} value={hermes.modalAppName} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { modalAppName: e.target.value } })} placeholder="hermes-agent" />
        </div>
      )}
      {hermes.backend === 'daytona' && (
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Daytona Workspace</div>
          <input type="text" className={fieldCls} value={hermes.daytonaWorkspace} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { daytonaWorkspace: e.target.value } })} placeholder="hermes-workspace" />
        </div>
      )}
      {hermes.backend === 'vercel' && (
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Vercel Function URL</div>
          <input type="text" className={fieldCls} value={hermes.vercelFunctionUrl} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { vercelFunctionUrl: e.target.value } })} placeholder="https://your-app.vercel.app/api/hermes" />
        </div>
      )}

      <div>
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
          Quick install · {BACKENDS.find((b) => b.id === hermes.backend)?.label}
        </div>
        <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <code className="font-mono text-[10px] text-emerald-400/80">{BACKENDS.find((b) => b.id === hermes.backend)?.cmd}</code>
            <button
              onClick={() => onCopy('install', BACKENDS.find((b) => b.id === hermes.backend)?.cmd ?? '')}
              className={copied['install'] ? 'shrink-0 flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400' : 'shrink-0 flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/60 hover:bg-white/8'}
            >
              {copied['install'] ? <><Check className="h-2.5 w-2.5" />Done</> : <><Copy className="h-2.5 w-2.5" />Copy</>}
            </button>
          </div>
        </div>
      </div>
    </HermesSection>
  )
}
