'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowDown } from 'lucide-react'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { LabArchitecture } from './LabArchitecture'
import { LabRoadmap } from './LabRoadmap'
import { useLocale } from '@/lib/i18n/context'
import type { LabRegistryEntry } from '@/lib/labs/registry'
import { STATUS_COLORS, STACK_CATEGORY_COLORS } from '@/lib/labs/registry'

interface Props {
  config: LabRegistryEntry
  children: ReactNode
}

export function LabProductPage({ config, children }: Props) {
  const locale = useLocale()
  const status = STATUS_COLORS[config.status]

  return (
    <div className="relative min-h-screen bg-[#060610]" style={{ '--lab-accent': config.accent } as React.CSSProperties}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-40 -left-20 h-[700px] w-[700px] rounded-full blur-[160px]"
          style={{ background: `radial-gradient(circle, ${config.accent}10, transparent 70%)` }}
        />
        <div className="absolute right-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-white/[0.01] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <Navigation />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-28 lg:px-6">
        {/* Back nav */}
        <div className="mb-10 flex items-center gap-2">
          <Link prefetch={false} href={`/${locale}/projects`} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/25 transition-colors hover:text-white/60">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects</span>
          </Link>
          <span className="font-mono text-white/15">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: config.accent }}>
            {config.name}
          </span>
        </div>

        {/* Hero content: 2-col */}
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] items-center">
          {/* Left: identity */}
          <div className="space-y-7">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px]"
                style={{ borderColor: `${config.accent}30`, background: `${config.accent}08` }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: config.accent, boxShadow: `0 0 8px ${config.accent}80` }}
                />
                <span style={{ color: config.accent }} className="uppercase tracking-[0.14em]">
                  {config.status.toUpperCase()}
                </span>
              </span>
              <span className="inline-block rounded border border-white/8 bg-white/3 px-2 py-0.5 font-mono text-[10px] text-white/35">v{config.version}</span>
              <span className="inline-block rounded border border-white/6 bg-white/2 px-2 py-0.5 font-mono text-[10px] text-white/25">{config.uptime} uptime</span>
              <span className="hidden sm:inline-block rounded border border-white/6 bg-white/2 px-2 py-0.5 font-mono text-[10px] text-white/20">{config.region}</span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white/90 lg:text-4xl">{config.name}</h1>
            <p className="text-[15px] leading-relaxed text-white/50 font-light">{config.tagline}</p>
            <p className="text-[13px] leading-[1.8] text-white/35">{config.description}</p>

            {/* Stack chips */}
            <div className="flex flex-wrap gap-2">
              {config.stack.slice(0, 5).map((item) => (
                <span
                  key={item.name}
                  className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STACK_CATEGORY_COLORS[item.category] ?? ''}`}
                >
                  {item.name}
                </span>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-all hover:opacity-80"
                style={{ borderColor: `${config.accent}30`, color: config.accent }}
              >
                Interactive Demo
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40 transition-all hover:bg-white/6 hover:text-white/70"
              >
                Architecture
                <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right: project stats panel */}
          <div className="hidden lg:block">
            <div
              className="relative overflow-hidden rounded-2xl border bg-[#06060f] p-0"
              style={{ borderColor: `${config.accent}15` }}
            >
              <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3 font-mono text-[10px]">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: config.accent }}
                />
                <span className="flex-1 uppercase tracking-[0.18em] text-white/35">Project Stats</span>
                <span className="uppercase tracking-[0.14em] font-semibold" style={{ color: status.text }}>
                  {config.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-0">
                {config.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-1 border-b border-r border-white/5 p-5 last:border-b-0 even:border-r-0 [&:nth-child(3)]:border-b-0">
                    <div className="text-2xl font-semibold tabular-nums leading-none" style={{ color: config.accent }}>
                      {m.value}
                      {m.unit && <span className="ml-0.5 text-sm font-normal">{m.unit}</span>}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Accent border bottom */}
              <div
                className="h-px w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${config.accent}40, transparent)` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ───────────────────────────────────── */}
      <section id="demo" className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1 w-1 rounded-full" style={{ background: config.accent }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: config.accent }}>
              Interactive Demo
            </span>
          </div>
          <div className="h-px bg-white/5" />
        </div>

        <div className="overflow-hidden rounded-2xl border bg-[#06060f]" style={{ borderColor: `${config.accent}15` }}>
          {/* Frame header bar */}
          <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderBottomColor: `${config.accent}10` }}>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/8" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/8" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/8" />
            </div>
            <span className="flex-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/20">
              {config.name} · v{config.version}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: config.accent }}
              />
              {config.status}
            </span>
          </div>

          {/* Demo content */}
          <div className="p-5">{children}</div>

          {/* Accent bottom line */}
          <div
            className="h-px w-full opacity-40"
            style={{ background: `linear-gradient(90deg, transparent, ${config.accent}20, transparent)` }}
          />
        </div>
      </section>

      {/* ── ARCHITECTURE ───────────────────────────────────────── */}
      <section id="architecture" className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1 w-1 rounded-full" style={{ background: config.accent }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: config.accent }}>
              System Architecture
            </span>
          </div>
          <div className="h-px bg-white/5" />
        </div>

        <LabArchitecture
          nodes={config.architecture.nodes}
          edges={config.architecture.edges}
          accent={config.accent}
        />
      </section>

      {/* ── STACK + ROADMAP ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl grid gap-8 px-4 pb-20 lg:grid-cols-2 lg:px-6">
        {/* Tech Stack */}
        <div className="space-y-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">Tech Stack</div>
          <div className="grid grid-cols-2 gap-2">
            {config.stack.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-white/3 ${STACK_CATEGORY_COLORS[item.category] ?? ''}`}
              >
                <span className="font-mono text-[11px] font-medium">{item.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-60">{item.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">Development Roadmap</div>
          <LabRoadmap phases={config.roadmap} accent={config.accent} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
