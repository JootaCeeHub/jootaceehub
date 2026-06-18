/**
 * Bridge module — systems data now lives in src/content/systems/index.json (Git canonical).
 * All consumers (public pages, admin panels) continue to import from here unchanged.
 */
import { SYSTEMS_JSON, SYSTEMS_META } from '@/lib/content/json-loaders'

export interface SystemPageEntry {
  key: string
  badge: string
  title: string
  subtitle: string
  description: string
  status: string
  href: string
}

export const SYSTEMS_DATA: SystemPageEntry[] = SYSTEMS_JSON.map((s) => ({
  key:         s.key,
  badge:       s.badge,
  title:       s.title,
  subtitle:    s.subtitle,
  description: s.description,
  status:      s.status,
  href:        s.href,
}))

export const ARCHITECTURE_NOTES: string[] = SYSTEMS_META.architectureNotes
export const SYSTEM_STATS: { value: string; label: string }[] = SYSTEMS_META.stats
