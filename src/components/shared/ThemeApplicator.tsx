'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import {
  PALETTE_VARS,
  SHADER_GRADS,
  CONTAINER_WIDTHS,
  SECTION_PADDINGS,
  RADIUS_VALUES,
  ANIM_DURATIONS,
  FONT_FAMILIES,
  FONT_SIZE_SCALES,
  SHADOW_INTENSITIES,
  GLOW_INTENSITIES,
  BUTTON_RADIUS,
  GLASS_BLUR,
  GLASS_OPACITY,
  GLASS_BORDER_OPACITY,
  type PaletteId,
} from '@/lib/design/tokens'

const ADMIN_KEY = 'jootacee-command-v2'

interface StoredDesign {
  darkModeDefault?: string
  palette?: string
  customPrimary?: string
  customSecondary?: string
  customAccent?: string
  customBackground?: string
  customSurface?: string
  customText?: string
  customBorder?: string
  customGlow?: string
  customGlowSecondary?: string
  customRing?: string
  customMuted?: string
  customMutedFg?: string
  gradientStart?: string
  gradientMid?: string
  gradientEnd?: string
  btnGradientFrom?: string
  btnGradientTo?: string
  btnText?: string
  domainAccents?: Record<string, string>
  tokens?: {
    borderRadius?: string
    typography?: string
    fontSizeScale?: string
    animationSpeed?: string
    containerWidth?: string
    sectionPadding?: string
    shadowIntensity?: string
    glowIntensity?: string
    buttonStyle?: string
    gradientStyle?: string
    cardStyle?: string
    inputStyle?: string
    glassBlur?: string
    glassOpacity?: string
    glassBorderOpacity?: string
  }
}

interface StoredVisualEffects {
  activeShaderPreset?: string
  bgGrid?: {
    enabled: boolean
    color: string
    opacity: number
    size: number
    mask: boolean
  }
  bgGradientOpacity?: number
}

function readAdminDesign(): { design: StoredDesign | null; ve: StoredVisualEffects | null } {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return { design: null, ve: null }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      design: (parsed?.design as StoredDesign) ?? null,
      ve:     (parsed?.visualEffects as StoredVisualEffects) ?? null,
    }
  } catch {
    return { design: null, ve: null }
  }
}

function applyToRoot(design: StoredDesign, ve: StoredVisualEffects | null, setTheme: (t: string) => void) {
  const root = document.documentElement

  // ── Theme mode ────────────────────────────────────────────────────────────────
  if (design.darkModeDefault && design.darkModeDefault !== 'system') {
    setTheme(design.darkModeDefault)
  }

  // ── Color palette ─────────────────────────────────────────────────────────────
  const palette = design.palette ?? ''
  if (palette in PALETTE_VARS) {
    for (const [prop, val] of Object.entries(PALETTE_VARS[palette as PaletteId])) {
      root.style.setProperty(prop, val)
    }
  } else if (palette === 'custom') {
    if (design.customPrimary)    { root.style.setProperty('--primary', design.customPrimary); root.style.setProperty('--glow', design.customPrimary) }
    if (design.customSecondary)    root.style.setProperty('--secondary', design.customSecondary)
    if (design.customAccent)     { root.style.setProperty('--accent', design.customAccent); root.style.setProperty('--glow-secondary', design.customAccent) }
    if (design.customBackground) root.style.setProperty('--background', design.customBackground)
    if (design.customSurface)    root.style.setProperty('--card', design.customSurface)
    if (design.customText)       root.style.setProperty('--foreground', design.customText)
    if (design.customBorder)     root.style.setProperty('--border', design.customBorder)
  }
  // Advanced color overrides always apply (non-destructive on top of palette)
  if (palette !== 'custom') {
    if (design.customBackground) root.style.setProperty('--background', design.customBackground)
    if (design.customSurface)    root.style.setProperty('--card', design.customSurface)
    if (design.customText)       root.style.setProperty('--foreground', design.customText)
    if (design.customBorder)     root.style.setProperty('--border', design.customBorder)
    if (design.customSecondary)  root.style.setProperty('--secondary', design.customSecondary)
  }

  // ── Glow & highlight overrides (apply on top of everything) ──────────────────
  if (design.customGlow)          { root.style.setProperty('--glow', design.customGlow) }
  if (design.customGlowSecondary) { root.style.setProperty('--glow-secondary', design.customGlowSecondary) }
  if (design.customRing)          { root.style.setProperty('--ring', design.customRing) }

  // ── Muted tone overrides ──────────────────────────────────────────────────────
  if (design.customMuted)   { root.style.setProperty('--muted', design.customMuted) }
  if (design.customMutedFg) { root.style.setProperty('--muted-foreground', design.customMutedFg) }

  // ── Gradient text color stops ─────────────────────────────────────────────────
  if (design.gradientStart) { root.style.setProperty('--gradient-start', design.gradientStart) }
  if (design.gradientMid)   { root.style.setProperty('--gradient-mid', design.gradientMid) }
  if (design.gradientEnd)   { root.style.setProperty('--gradient-end', design.gradientEnd) }

  // ── Button color system ───────────────────────────────────────────────────────
  if (design.btnGradientFrom) {
    root.style.setProperty('--btn-gradient-from', design.btnGradientFrom)
    root.style.setProperty('--btn-bg', `linear-gradient(to right, var(--btn-gradient-from), var(--btn-gradient-to, ${design.btnGradientTo || design.btnGradientFrom}))`)
  }
  if (design.btnGradientTo) {
    root.style.setProperty('--btn-gradient-to', design.btnGradientTo)
    root.style.setProperty('--btn-bg', `linear-gradient(to right, var(--btn-gradient-from, ${design.btnGradientFrom || design.btnGradientTo}), var(--btn-gradient-to))`)
  }
  if (design.btnText) { root.style.setProperty('--btn-text', design.btnText) }

  // ── Domain accent colors ──────────────────────────────────────────────────────
  const da = design.domainAccents
  if (da) {
    if (da.projects)     root.style.setProperty('--accent-projects', da.projects)
    if (da.research)     root.style.setProperty('--accent-research', da.research)
    if (da.resources)    root.style.setProperty('--accent-resources', da.resources)
    if (da.intelligence) root.style.setProperty('--accent-intelligence', da.intelligence)
    if (da.github)       root.style.setProperty('--accent-github', da.github)
    if (da.about)        root.style.setProperty('--accent-about', da.about)
  }

  // ── Background shader gradient blobs ──────────────────────────────────────────
  const presetId = ve?.activeShaderPreset ?? 'cosmic-blue'
  const rawGrads = SHADER_GRADS[presetId] ?? SHADER_GRADS['cosmic-blue']
  const gradOpacity = ve?.bgGradientOpacity ?? 1
  if (gradOpacity === 1) {
    root.style.setProperty('--body-grad-1', rawGrads[0])
    root.style.setProperty('--body-grad-2', rawGrads[1])
    root.style.setProperty('--body-grad-3', rawGrads[2])
    root.style.setProperty('--body-grad-4', rawGrads[3])
  } else {
    // Scale opacity of each gradient blob by the multiplier
    const scale = (cssColor: string) => {
      // e.g. 'rgb(59 130 246/22%)' → multiply the % by gradOpacity
      return cssColor.replace(/(\d+(?:\.\d+)?)%\)/, (_, pct) =>
        `${(parseFloat(pct) * gradOpacity).toFixed(1)}%)`)
    }
    root.style.setProperty('--body-grad-1', scale(rawGrads[0]))
    root.style.setProperty('--body-grad-2', scale(rawGrads[1]))
    root.style.setProperty('--body-grad-3', scale(rawGrads[2]))
    root.style.setProperty('--body-grad-4', scale(rawGrads[3]))
  }

  // ── Background grid ───────────────────────────────────────────────────────────
  const grid = ve?.bgGrid
  if (grid !== undefined) {
    root.style.setProperty('--grid-opacity', grid.enabled ? String(grid.opacity) : '0')
    root.style.setProperty('--grid-line-color', grid.color)
    root.style.setProperty('--grid-size', `${grid.size}px`)
    root.style.setProperty('--grid-mask', grid.mask
      ? 'radial-gradient(circle at 50% 35%, #000 22%, transparent 85%)'
      : 'none')
  }

  // ── Design tokens → CSS vars ──────────────────────────────────────────────────
  const t = design.tokens ?? {}
  if (t.containerWidth)   root.style.setProperty('--container-max',   CONTAINER_WIDTHS[t.containerWidth]       ?? '1280px')
  if (t.sectionPadding)   root.style.setProperty('--section-py',      SECTION_PADDINGS[t.sectionPadding]       ?? '5rem')
  if (t.borderRadius)     root.style.setProperty('--radius-base',      RADIUS_VALUES[t.borderRadius]            ?? '12px')
  if (t.animationSpeed)   root.style.setProperty('--anim-duration',    ANIM_DURATIONS[t.animationSpeed]         ?? '300ms')
  if (t.typography)       root.style.setProperty('--font-sans',        FONT_FAMILIES[t.typography]              ?? FONT_FAMILIES.modern)
  if (t.fontSizeScale)    root.style.setProperty('--font-size-base',   FONT_SIZE_SCALES[t.fontSizeScale]        ?? '16px')
  if (t.shadowIntensity)  root.style.setProperty('--shadow-intensity', SHADOW_INTENSITIES[t.shadowIntensity]    ?? '1')
  if (t.glowIntensity)       root.style.setProperty('--glow-intensity',        GLOW_INTENSITIES[t.glowIntensity]         ?? '1')
  if (t.buttonStyle)         root.style.setProperty('--radius-button',         BUTTON_RADIUS[t.buttonStyle]              ?? '9999px')
  if (t.glassBlur)           root.style.setProperty('--glass-blur',            GLASS_BLUR[t.glassBlur]                   ?? '20px')
  if (t.glassOpacity)        root.style.setProperty('--glass-opacity',         GLASS_OPACITY[t.glassOpacity]             ?? '1')
  if (t.glassBorderOpacity)  root.style.setProperty('--glass-border-opacity',  GLASS_BORDER_OPACITY[t.glassBorderOpacity] ?? '1')
}

export function ThemeApplicator() {
  const { setTheme } = useTheme()
  const setThemeRef = useRef(setTheme)
  setThemeRef.current = setTheme // eslint-disable-line react-hooks/refs

  useEffect(() => {
    function apply() {
      const { design, ve } = readAdminDesign()
      if (design) applyToRoot(design, ve, setThemeRef.current)
    }

    apply()

    const onStorage   = (e: StorageEvent) => { if (e.key === ADMIN_KEY) apply() }
    const onAdminSave = () => apply()
    window.addEventListener('storage', onStorage)
    window.addEventListener('admin-state-saved', onAdminSave)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin-state-saved', onAdminSave)
    }
  }, [])

  return null
}
