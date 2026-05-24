'use client'

import { useState, useCallback } from 'react'
import { useAdmin } from '@/lib/admin/store'
import { useTranslations } from '@/lib/i18n/context'
import { motion } from 'framer-motion'
import { Globe, Smartphone, BarChart3, Lock, FileJson, Copy, Check } from 'lucide-react'

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}

export default function ConfigPanel() {
  const t = useTranslations('admin')
  const { state, dispatch } = useAdmin()
  const { site, seo } = state

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('config.title')}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t('config.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Site Config */}
        <Section title="Site" icon={Globe}>
          <InputRow label="Site Name">
            <TextInput value={site.name} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { name: v } })} placeholder="JootaCee" />
          </InputRow>
          <InputRow label="Site URL">
            <TextInput value={site.url} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { url: v } })} placeholder="https://example.com" />
          </InputRow>
          <InputRow label="Description">
            <textarea
              value={site.description}
              onChange={(e) => dispatch({ type: 'UPDATE_SITE', payload: { description: e.target.value } })}
              placeholder="Brief site description..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </InputRow>
          <InputRow label="Business Focus">
            <TextInput value={site.businessFocus} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { businessFocus: v } })} placeholder="AI Systems Architecture" />
          </InputRow>
        </Section>

        {/* SEO Config */}
        <Section title="SEO" icon={FileJson}>
          <InputRow label="Title Template">
            <TextInput value={seo.titleTemplate} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { titleTemplate: v } })} placeholder="%s | Site Name" />
          </InputRow>
          <InputRow label="Default Title">
            <TextInput value={seo.defaultTitle} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { defaultTitle: v } })} placeholder="Site Title" />
          </InputRow>
          <InputRow label="Default Description">
            <textarea
              value={seo.defaultDescription}
              onChange={(e) => dispatch({ type: 'UPDATE_SEO', payload: { defaultDescription: e.target.value } })}
              placeholder="Meta description..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </InputRow>
          <InputRow label="OG Image Path">
            <TextInput value={seo.ogImage} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { ogImage: v } })} placeholder="/og-image.jpg" />
          </InputRow>
          <InputRow label="Twitter Handle">
            <TextInput value={seo.twitterHandle} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { twitterHandle: v } })} placeholder="@handle" />
          </InputRow>
          <InputRow label="Robots">
            <TextInput value={seo.robots} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { robots: v } })} placeholder="index, follow" />
          </InputRow>
          <InputRow label="Canonical Base">
            <TextInput value={seo.canonicalBase} onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { canonicalBase: v } })} placeholder="https://example.com" />
          </InputRow>
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp" icon={Smartphone}>
          <InputRow label="Phone Number">
            <TextInput value={site.whatsappNumber} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { whatsappNumber: v } })} placeholder="+1234567890" />
          </InputRow>
          <InputRow label="Default Message">
            <textarea
              value={site.whatsappMessage}
              onChange={(e) => dispatch({ type: 'UPDATE_SITE', payload: { whatsappMessage: e.target.value } })}
              placeholder="Hello..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
            />
          </InputRow>
        </Section>

        {/* Tracking & Features */}
        <Section title="Features" icon={BarChart3}>
          <Toggle checked={site.enableAnalytics} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { enableAnalytics: v } })} label="Enable Analytics" />
          <Toggle checked={site.enableTelemetry} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { enableTelemetry: v } })} label="Enable Telemetry" />
          <Toggle checked={site.maintenanceMode} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { maintenanceMode: v } })} label="Maintenance Mode" />
          <InputRow label="Tracking ID">
            <TextInput value={site.trackingId} onChange={(v) => dispatch({ type: 'UPDATE_SITE', payload: { trackingId: v } })} placeholder="G-XXXXXXXXXX" />
          </InputRow>
        </Section>

        {/* Security */}
        <Section title="Security" icon={Lock}>
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-2">
            <p>Static export mode is active. No server-side API routes are available.</p>
            <p>All configuration is stored in localStorage and can be exported/imported as JSON.</p>
            <p>Service Worker provides offline support and asset caching.</p>
          </div>
        </Section>
      </div>

      {/* Live JSON Preview */}
      <JsonPreviewSection state={state} />
    </div>
  )
}

function JsonPreviewSection({ state }: { state: ReturnType<typeof useAdmin>['state'] }) {
  const [copied, setCopied] = useState(false)

  const json = JSON.stringify(state, null, 2)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [json])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Live State Preview</h2>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-[11px] leading-relaxed text-muted-foreground font-mono">
        {json}
      </pre>
    </motion.div>
  )
}
