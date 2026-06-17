'use client'

import { Check, Copy } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { HermesSection } from './HermesSection'
import { PLATFORM_META } from './hermes-constants'

interface Props {
  isOpen: boolean
  onToggle: () => void
  copied: Record<string, boolean>
  onCopy: (key: string, text: string) => void
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={enabled} onClick={onToggle} className={`relative h-[18px] w-8 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? 'bg-cyan-400/30' : 'bg-white/10'}`}>
      <span className={`absolute top-[3px] h-3 w-3 rounded-full transition-transform ${enabled ? 'translate-x-[17px] bg-cyan-400' : 'translate-x-[3px] bg-white/30'}`} />
    </button>
  )
}

const fieldCls = 'w-full rounded-lg border border-white/8 bg-black/20 px-2.5 py-1.5 font-mono text-[10px] text-white/60 placeholder-white/20 outline-none focus:border-white/20 transition-colors'

export function HermesPlatformSection({ isOpen, onToggle, copied, onCopy }: Props) {
  const { state, dispatch } = useAdmin()
  const { hermes, platforms } = state.capabilities
  if (!hermes) return null

  return (
    <HermesSection id="platforms" title="Platform Gateway" isOpen={isOpen} onToggle={onToggle}>
      <div className="space-y-2">
        {platforms.map((platform) => {
          const meta = PLATFORM_META[platform.id]
          if (!meta) return null
          return (
            <div key={platform.id} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.015] p-3">
              <span className="shrink-0 text-base" style={{ color: meta.color }}>{meta.emoji}</span>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-white/65">{meta.label}</span>
                  <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-wider ${{ active: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400', inactive: 'border-white/8 bg-transparent text-white/20', error: 'border-red-400/20 bg-red-400/5 text-red-400' }[platform.status] ?? 'border-white/8 bg-transparent text-white/20'}`}>{platform.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Bot Token</div>
                    <input type="password" className={fieldCls} value={platform.token} placeholder={`${meta.label} token…`} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, token: e.target.value } })} />
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Bot Name</div>
                    <input type="text" className={fieldCls} value={platform.botName} placeholder={`@${meta.label.toLowerCase()}_bot`} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, botName: e.target.value } })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2" style={{ flex: 1 }}>
                    <code className="font-mono text-[10px] text-emerald-400/80">hermes gateway setup --platform {platform.id}</code>
                  </div>
                  <button
                    onClick={() => onCopy(`gw-${platform.id}`, `hermes gateway setup --platform ${platform.id}`)}
                    className={copied[`gw-${platform.id}`] ? 'shrink-0 flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400' : 'shrink-0 flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/60 hover:bg-white/8'}
                  >
                    {copied[`gw-${platform.id}`] ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                  </button>
                </div>
              </div>
              <Toggle enabled={platform.enabled} onToggle={() => dispatch({ type: 'CAPABILITIES_UPDATE_PLATFORM', payload: { id: platform.id, enabled: !platform.enabled } })} />
            </div>
          )
        })}
      </div>

      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Allowed Users (one per line)</div>
        <textarea className="h-28 w-full resize-none rounded-lg border border-white/8 bg-black/20 p-2.5 font-mono text-[9px] text-white/55 placeholder-white/20 outline-none focus:border-white/20 leading-relaxed" value={hermes.allowedUsers} onChange={(e) => dispatch({ type: 'CAPABILITIES_UPDATE_HERMES', payload: { allowedUsers: e.target.value } })} placeholder="@username&#10;user_id_123" rows={3} />
      </div>

      <div>
        <div className="mb-1 font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">Gateway start command</div>
        <div className="rounded-lg border border-white/6 bg-black/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <code className="font-mono text-[10px] text-emerald-400/80">hermes gateway start</code>
            <button
              onClick={() => onCopy('gw-start', 'hermes gateway start')}
              className={copied['gw-start'] ? 'shrink-0 flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/8 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400' : 'shrink-0 flex items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/30 transition-colors hover:text-white/60 hover:bg-white/8'}
            >
              {copied['gw-start'] ? <><Check className="h-2.5 w-2.5" />Done</> : <><Copy className="h-2.5 w-2.5" />Copy</>}
            </button>
          </div>
        </div>
      </div>
    </HermesSection>
  )
}
