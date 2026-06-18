'use client'

import { useState } from 'react'
import { Rocket, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { reportError } from '@/lib/error'

type DeployState = 'idle' | 'triggering' | 'done' | 'error'

export function DeployTab() {
  const { state, dispatch } = useAdmin()
  const hookUrl      = state.integrations.deployHookUrl ?? ''
  const lastDeploy   = state.integrations.lastDeployTriggeredAt
  const [url, setUrl]     = useState(hookUrl)
  const [edited, setEdited] = useState(false)
  const [deployState, setDeployState] = useState<DeployState>('idle')
  const [errorMsg, setErrorMsg]       = useState('')

  function saveUrl() {
    dispatch({ type: 'SET_DEPLOY_HOOK_URL', payload: url.trim() })
    setEdited(false)
  }

  async function triggerDeploy() {
    if (!hookUrl) return
    setDeployState('triggering')
    setErrorMsg('')
    try {
      const res = await fetch(hookUrl, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      dispatch({ type: 'DEPLOY_TRIGGERED', payload: new Date().toISOString() })
      setDeployState('done')
      setTimeout(() => setDeployState('idle'), 4000)
    } catch (err) {
      reportError(err, { context: 'DeployTab/triggerDeploy' })
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setDeployState('error')
    }
  }

  const isConfigured = hookUrl.length > 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 mb-0.5">Rebuild Trigger</div>
        <p className="font-mono text-[8px] text-white/22">
          Configure a deploy hook to trigger production builds after publishing content changes.
          Supports Vercel, Netlify, and Cloudflare Pages.
        </p>
      </div>

      {/* Hook URL config */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4 space-y-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">Deploy Hook URL</div>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setEdited(true) }}
            placeholder="https://api.vercel.com/v1/integrations/deploy/..."
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[9px] text-white/75 placeholder:text-white/20 outline-none focus:border-white/25"
          />
          {edited && (
            <button
              onClick={saveUrl}
              className="rounded-lg border border-emerald-400/25 bg-emerald-400/8 px-3 py-1.5 font-mono text-[8px] text-emerald-400/80 hover:bg-emerald-400/15 transition-colors"
            >
              Save
            </button>
          )}
        </div>
        <p className="font-mono text-[7.5px] text-white/22">
          Stored in AdminState (localStorage). See ADR-007 for security model.{' '}
          <a href="https://vercel.com/docs/deployments/deploy-hooks" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-sky-400/50 hover:text-sky-400/80 transition-colors">
            Vercel docs <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </p>
      </div>

      {/* Trigger button */}
      <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4 space-y-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">Trigger Rebuild</div>

        {!isConfigured && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2">
            <AlertTriangle className="h-3 w-3 text-amber-400/60 shrink-0" />
            <span className="font-mono text-[8px] text-amber-400/60">Configure a deploy hook URL above to enable rebuilds.</span>
          </div>
        )}

        {deployState === 'error' && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-400/15 bg-rose-400/5 px-3 py-2">
            <AlertTriangle className="h-3 w-3 text-rose-400/60 shrink-0" />
            <span className="font-mono text-[8px] text-rose-400/60">Deploy failed: {errorMsg}</span>
          </div>
        )}

        {deployState === 'done' && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-400/60 shrink-0" />
            <span className="font-mono text-[8px] text-emerald-400/60">Deploy triggered successfully. Build queued.</span>
          </div>
        )}

        <button
          onClick={triggerDeploy}
          disabled={!isConfigured || deployState === 'triggering'}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-2.5 font-mono text-[9px] text-white/60 transition-all hover:border-sky-400/30 hover:bg-sky-400/8 hover:text-sky-400/80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Rocket className="h-3.5 w-3.5" />
          {deployState === 'triggering' ? 'Triggering…' : 'Trigger Production Rebuild'}
        </button>

        {lastDeploy && (
          <div className="flex items-center gap-1.5 font-mono text-[8px] text-white/25">
            <Clock className="h-2.5 w-2.5" />
            Last triggered: <span className="text-white/35">{new Date(lastDeploy).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Providers guide */}
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 space-y-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">Supported Providers</div>
        {[
          { name: 'Vercel',           where: 'Project → Settings → Git → Deploy Hooks' },
          { name: 'Netlify',          where: 'Site → Site configuration → Build hooks' },
          { name: 'Cloudflare Pages', where: 'Pages → Settings → Builds → Deploy hooks' },
        ].map(p => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-white/45 w-36">{p.name}</span>
            <span className="font-mono text-[8px] text-white/22">{p.where}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
