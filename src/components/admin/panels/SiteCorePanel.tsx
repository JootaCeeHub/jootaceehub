'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAdmin } from '@/lib/admin/store'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  mono = false,
  placeholder,
  readOnly = false,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  mono?: boolean
  placeholder?: string
  readOnly?: boolean
}) {
  const inputClass = cn(
    readOnly
      ? 'w-full rounded-lg border border-white/6 bg-white/2 px-3 py-2 text-[12px] text-white/35 placeholder-white/15 cursor-default focus:outline-none'
      : 'w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[12px] text-white/80 placeholder-white/15 transition-colors focus:outline-none focus:border-cyan-400/40 focus:bg-white/6',
    mono ? 'font-mono' : ''
  )
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputClass}
      />
    </div>
  )
}

function Textarea({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[12px] text-white/80 placeholder-white/15 transition-colors focus:border-cyan-400/40 focus:outline-none focus:bg-white/6 resize-none leading-relaxed"
      />
    </div>
  )
}

function Toggle({
  label,
  desc,
  value,
  onChange,
  accent = '#22d3ee',
}: {
  label: string
  desc: string
  value: boolean
  onChange: (v: boolean) => void
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <div className="text-[11px] font-medium text-white/70">{label}</div>
        <div className="text-[10px] text-white/30">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative h-5 w-9 shrink-0 rounded-full border transition-colors"
        style={value ? { borderColor: `${accent}50`, background: `${accent}25` } : undefined}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full transition-all"
          style={value ? { left: '18px', background: accent } : { left: '2px', background: 'rgba(255,255,255,0.2)' }}
        />
      </button>
    </div>
  )
}

function Section({
  title,
  accent = '#94a3b8',
  children,
  action,
}: {
  title: string
  accent?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

export default function SiteCorePanel() {
  const { state, dispatch } = useAdmin()

  const deployedDate = new Date(state.runtime.deployedAt)
  const deployedStr = `${deployedDate.getUTCFullYear()}-${String(deployedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(deployedDate.getUTCDate()).padStart(2, '0')}`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-slate-400/60">Site Core Manager</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">Identity & Configuration</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">
          {state.site.name} · {state.runtime.environment} · {state.runtime.version}
        </p>
      </div>

      {/* Deploy Info */}
      <Section title="Deploy Info" accent="#22d3ee">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Version', value: state.runtime.version },
            { label: 'Environment', value: state.runtime.environment },
            { label: 'Deployed', value: deployedStr },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-white/6 bg-white/[0.025] px-3 py-2">
              <div className="text-[9px] uppercase tracking-widest text-white/25">{m.label}</div>
              <div className="mt-0.5 font-mono text-[12px] font-semibold text-cyan-400 tabular-nums truncate">{m.value}</div>
            </div>
          ))}
        </div>
        <Field
          label="Site Version"
          value={state.runtime.version}
          onChange={(v) => dispatch({ type: 'UPDATE_RUNTIME', payload: { version: v } })}
          mono
          placeholder="v2.1.0"
        />
      </Section>

      {/* Site Identity */}
      <Section title="Site Identity" accent="#94a3b8">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Site Name"
            value={state.site.name}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { name: v } })}
            placeholder="JootaCee"
          />
          <Field
            label="Site URL"
            value={state.site.url}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { url: v } })}
            type="url"
            mono
            placeholder="https://jootacee.com"
          />
        </div>
        <Textarea
          label="Description"
          value={state.site.description}
          onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { description: v } })}
        />
        <Field
          label="Business Focus"
          value={state.site.businessFocus}
          onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { businessFocus: v } })}
          placeholder="AI Systems Architecture & Automation Infrastructure"
        />
        <Field
          label="Analytics Tracking ID"
          value={state.site.trackingId}
          onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { trackingId: v } })}
          mono
          placeholder="G-XXXXXXXXXX"
        />
        <div className="divide-y divide-white/6 pt-1">
          <Toggle
            label="Analytics"
            desc="Enable usage tracking via Tracking ID"
            value={state.site.enableAnalytics}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { enableAnalytics: v } })}
          />
          <Toggle
            label="Telemetry"
            desc="Enable operational performance telemetry"
            value={state.site.enableTelemetry}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { enableTelemetry: v } })}
          />
          <Toggle
            label="Maintenance Mode"
            desc="Show maintenance page to all visitors"
            value={state.site.maintenanceMode}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { maintenanceMode: v } })}
            accent="#f87171"
          />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO Configuration" accent="#818cf8">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Default Title"
            value={state.seo.defaultTitle}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { defaultTitle: v } })}
            placeholder="JootaCee | AI Systems Architect"
          />
          <Field
            label="Title Template"
            value={state.seo.titleTemplate}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { titleTemplate: v } })}
            mono
            placeholder="%s | JootaCee"
          />
        </div>
        <Textarea
          label="Default Description"
          value={state.seo.defaultDescription}
          onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { defaultDescription: v } })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Canonical Base URL"
            value={state.seo.canonicalBase}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { canonicalBase: v } })}
            type="url"
            mono
          />
          <Field
            label="Twitter Handle"
            value={state.seo.twitterHandle}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { twitterHandle: v } })}
            mono
            placeholder="@handle"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="OG Image Path"
            value={state.seo.ogImage}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { ogImage: v } })}
            mono
            placeholder="/og-image.jpg"
          />
          <Field
            label="Robots"
            value={state.seo.robots}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { robots: v } })}
            mono
            placeholder="index, follow"
          />
        </div>
      </Section>

      {/* Content API */}
      <ContentApiSection />

      {/* Configuration Preview */}
      <Section title="Configuration Preview" accent="#22d3ee">
        <div className="rounded-lg border border-white/8 bg-black/40 p-3 max-h-52 overflow-y-auto">
          <pre className="font-mono text-[10px] text-white/35 whitespace-pre-wrap break-all leading-relaxed">
            {JSON.stringify({ site: state.site, seo: state.seo, runtime: { version: state.runtime.version, environment: state.runtime.environment, deployedAt: state.runtime.deployedAt } }, null, 2)}
          </pre>
        </div>
      </Section>
    </div>
  )
}

// ─── Content API section (extracted to avoid extra hook in main component) ────

function ContentApiSection() {
  const { state, dispatch } = useAdmin()
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [pingMs, setPingMs] = useState<number | null>(null)

  const envUrl = process.env.NEXT_PUBLIC_CONTENT_API_URL ?? ''
  const effectiveUrl = state.site.contentApiUrl || envUrl

  const testConnection = async () => {
    if (!effectiveUrl) return
    setPingStatus('checking')
    const t0 = Date.now()
    try {
      const res = await fetch(`${effectiveUrl.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        setPingMs(Date.now() - t0)
        setPingStatus('ok')
      } else {
        setPingStatus('error')
      }
    } catch {
      setPingStatus('error')
    }
  }

  const statusColor = pingStatus === 'ok' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/8'
    : pingStatus === 'error' ? 'text-red-400 border-red-400/20 bg-red-400/8'
    : pingStatus === 'checking' ? 'text-amber-400 border-amber-400/20 bg-amber-400/8 animate-pulse'
    : 'text-white/30 border-white/10 bg-white/4'

  return (
    <Section title="Content API (VPS Phase 3)" accent="#06b6d4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
          <span className="truncate">Env: {envUrl || '(not set)'}</span>
        </div>
        <Field
          label="Override API URL"
          value={state.site.contentApiUrl}
          onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { contentApiUrl: v } })}
          type="url"
          mono
          placeholder="https://api.jootacee.com"
        />
        <div className="divide-y divide-white/6 pt-1">
          <Toggle
            label="Enable Content API"
            desc="Use VPS API for content reads (Phase 3)"
            value={state.site.contentApiEnabled}
            onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { contentApiEnabled: v } })}
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]', statusColor)}>
            <span className="h-1 w-1 rounded-full bg-current" />
            {pingStatus === 'ok' ? `Connected · ${pingMs}ms` : pingStatus === 'checking' ? 'Checking…' : pingStatus === 'error' ? 'Unreachable' : 'Not tested'}
          </span>
          <button
            type="button"
            disabled={!effectiveUrl || pingStatus === 'checking'}
            onClick={testConnection}
            className="rounded-lg border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 font-mono text-[9px] text-cyan-400 hover:bg-cyan-400/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Test connection
          </button>
        </div>
      </div>
    </Section>
  )
}
