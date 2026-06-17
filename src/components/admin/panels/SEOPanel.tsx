'use client'

import { CheckCircle2, XCircle, Globe, Share2, Image as ImageIcon } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { cn } from '@/lib/utils'

const ROBOTS_PRESETS = [
  { label: 'Index + Follow',  value: 'index, follow'       },
  { label: 'No Index',        value: 'noindex, follow'     },
  { label: 'No Crawl',        value: 'noindex, nofollow'   },
]

function Card({
  dot, title, children,
}: { dot: string; title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-2.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{title}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', mono = true, placeholder, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void; type?: string
  mono?: boolean; placeholder?: string; hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={!onChange}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 font-mono text-[11px] text-white/80 placeholder-white/15 transition-colors focus:border-sky-400/40 focus:outline-none focus:bg-white/6',
          !mono && 'font-sans'
        )}
      />
      {hint && <div className="mt-1 font-mono text-[8.5px] text-white/20">{hint}</div>}
    </div>
  )
}

export default function SEOPanel() {
  const { state, dispatch } = useAdmin()
  const { seo, site } = state

  const titlePreview = seo.titleTemplate.replace('%s', seo.defaultTitle || site.name)
  const descPreview  = seo.defaultDescription || site.description
  const urlPreview   = seo.canonicalBase.replace(/\/$/, '') + '/'

  const checks = [
    { label: 'Default title set',       ok: !!seo.defaultTitle },
    { label: 'Meta description set',    ok: !!seo.defaultDescription },
    { label: 'Canonical base URL set',  ok: !!seo.canonicalBase },
    { label: 'OG image path set',       ok: !!seo.ogImage },
    { label: 'Twitter handle set',      ok: !!seo.twitterHandle },
    { label: 'Robots directive set',    ok: !!seo.robots },
    { label: 'Title length OK (< 60)',  ok: titlePreview.length > 0 && titlePreview.length <= 60 },
    { label: 'Desc length OK (< 160)',  ok: descPreview.length > 0 && descPreview.length <= 160 },
  ]
  const passing = checks.filter((c) => c.ok).length

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.24em] text-sky-400/60">Site Core · SEO</div>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">SEO & Metadata</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/25">{passing}/{checks.length} checks passing · {seo.canonicalBase}</p>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-wider',
              c.ok
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-400'
                : 'border-red-400/20 bg-red-400/8 text-red-400'
            )}
          >
            {c.ok
              ? <CheckCircle2 className="h-2.5 w-2.5" />
              : <XCircle className="h-2.5 w-2.5" />
            }
            {c.label}
          </span>
        ))}
      </div>

      {/* Google SERP preview */}
      <div className="rounded-xl border border-white/8 bg-black/25 p-4">
        <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Google SERP Preview</div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
          <div className="font-mono text-[10px] text-emerald-400/80">
            <span className="mr-1 inline-block h-3.5 w-3.5 rounded-sm bg-white/10 align-middle" />
            {urlPreview}
          </div>
          <div className="text-[15px] font-medium text-sky-400/90 leading-snug">
            {titlePreview || 'Page Title Here'}
          </div>
          <div className="font-mono text-[11px] text-white/45 leading-relaxed">
            {descPreview.slice(0, 160) || 'Meta description will appear here.'}
            {descPreview.length > 160 && <span className="text-red-400/60">… (too long)</span>}
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <span className="font-mono text-[8.5px] text-white/25">
            Title: {titlePreview.length}/60 chars
          </span>
          <span className="font-mono text-[8.5px] text-white/25">
            Desc: {descPreview.length}/160 chars
          </span>
        </div>
      </div>

      {/* Titles */}
      <Card dot="#60a5fa" title="Title Configuration">
        <Field
          label="Default Title"
          value={seo.defaultTitle}
          onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { defaultTitle: v } })}
          placeholder="JootaCee | AI Systems Architect"
          hint="Main site title — used on homepage and as fallback"
        />
        <Field
          label="Title Template"
          value={seo.titleTemplate}
          onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { titleTemplate: v } })}
          placeholder="%s | JootaCee"
          hint="Use %s as placeholder for page-specific titles"
        />
        <Field
          label="Canonical Base URL"
          value={seo.canonicalBase}
          onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { canonicalBase: v } })}
          type="url"
          placeholder="https://jootacee.com"
          hint="Canonical URL prefix — must match your production domain exactly"
        />
      </Card>

      {/* Description + Robots */}
      <Card dot="#818cf8" title="Description & Indexing">
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-[0.18em] text-white/30">Default Meta Description</label>
          <textarea
            value={seo.defaultDescription}
            onChange={(e) => dispatch({ type: 'UPDATE_SEO', payload: { defaultDescription: e.target.value } })}
            rows={3}
            placeholder="Brief description for search engines. 120–160 chars ideal."
            className="w-full resize-none rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-[11px] text-white/80 placeholder-white/15 transition-colors focus:border-sky-400/40 focus:outline-none focus:bg-white/6 leading-relaxed"
          />
          <div className="mt-1 font-mono text-[8.5px] text-white/20">{seo.defaultDescription.length}/160 chars</div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/30">Robots directive</div>
          <div className="grid grid-cols-3 gap-2">
            {ROBOTS_PRESETS.map((r) => (
              <button
                key={r.value}
                onClick={() => dispatch({ type: 'UPDATE_SEO', payload: { robots: r.value } })}
                className={cn(
                  'rounded-lg border py-1.5 text-center font-mono text-[9px] uppercase tracking-wider transition-colors',
                  seo.robots === r.value
                    ? 'border-sky-400/30 bg-sky-400/8 text-sky-400'
                    : 'border-white/8 text-white/30 hover:border-white/15 hover:text-white/55'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="mt-1 font-mono text-[8.5px] text-white/20">Current: <code className="text-white/40">{seo.robots || 'not set'}</code></div>
        </div>
      </Card>

      {/* Social / OG */}
      <Card dot="#f472b6" title="Social & Open Graph">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="OG Image Path"
            value={seo.ogImage}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { ogImage: v } })}
            placeholder="/og-image.jpg"
            hint="1200×630px recommended"
          />
          <Field
            label="Twitter Handle"
            value={seo.twitterHandle}
            onChange={(v) => dispatch({ type: 'UPDATE_SEO', payload: { twitterHandle: v } })}
            placeholder="@handle"
            hint="Used for twitter:site meta tag"
          />
        </div>

        {/* OG card previews */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/8 bg-black/30 overflow-hidden">
            <div className="flex h-24 items-center justify-center bg-white/3 border-b border-white/5">
              {seo.ogImage
                ? <span className="font-mono text-[9px] text-white/40">{seo.ogImage}</span>
                : <span className="font-mono text-[9px] text-white/20"><ImageIcon aria-hidden="true" className="inline h-4 w-4 mr-1 opacity-50" />No OG image</span>
              }
            </div>
            <div className="p-3 space-y-1">
              <div className="font-mono text-[8px] uppercase tracking-widest text-white/20"><Globe className="inline h-2.5 w-2.5 mr-1" />Facebook / LinkedIn</div>
              <div className="font-mono text-[10.5px] font-semibold text-white/70 leading-snug">{seo.defaultTitle || site.name}</div>
              <div className="font-mono text-[9px] text-white/35 leading-relaxed">{seo.defaultDescription.slice(0, 80) || 'Description preview'}</div>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-black/30 overflow-hidden">
            <div className="flex h-24 items-center justify-center bg-white/3 border-b border-white/5">
              {seo.ogImage
                ? <span className="font-mono text-[9px] text-white/40">{seo.ogImage}</span>
                : <span className="font-mono text-[9px] text-white/20"><ImageIcon aria-hidden="true" className="inline h-4 w-4 mr-1 opacity-50" />No OG image</span>
              }
            </div>
            <div className="p-3 space-y-1">
              <div className="font-mono text-[8px] uppercase tracking-widest text-white/20"><Share2 className="inline h-2.5 w-2.5 mr-1" />Twitter / X</div>
              <div className="font-mono text-[10.5px] font-semibold text-white/70 leading-snug">{seo.defaultTitle || site.name}</div>
              <div className="font-mono text-[9px] text-white/35 leading-relaxed">{seo.twitterHandle || 'No @handle set'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SEO health checklist */}
      <Card dot="#34d399" title="SEO Health Check">
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', c.ok ? 'bg-emerald-400' : 'bg-red-400')} />
              <span className="flex-1 font-mono text-[10px] text-white/50">{c.label}</span>
              <span className={cn('font-mono text-[10px] font-semibold', c.ok ? 'text-emerald-400' : 'text-red-400')}>{c.ok ? 'Pass' : 'Fail'}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 font-mono text-[10px] text-white/40">
          Score: <span className={passing === checks.length ? 'text-emerald-400' : passing >= 6 ? 'text-amber-400' : 'text-red-400'}>
            {passing}/{checks.length}
          </span> — {passing === checks.length ? 'Fully optimized.' : 'Fix failing checks above.'}
        </div>
      </Card>
    </div>
  )
}
