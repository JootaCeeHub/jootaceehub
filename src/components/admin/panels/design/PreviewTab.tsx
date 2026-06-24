'use client'

import { Globe, Sliders } from 'lucide-react'
import { useAdmin } from '@/lib/admin/store'
import { getPaletteColors, Section, WebsitePreview, WebsiteColorTokens } from './primitives'

export function PreviewTab() {
  const { state } = useAdmin()
  const { design } = state
  const { tokens } = design
  const { primary, accent } = getPaletteColors(design)

  const radiusBase = { none:'0px', sm:'4px', md:'8px', lg:'12px', xl:'16px', '2xl':'24px', full:'9999px' }[tokens.borderRadius ?? 'lg'] ?? '12px'
  const radiusBtn  = { sharp:'0px', rounded:'8px', pill:'9999px' }[tokens.buttonStyle ?? 'pill'] ?? '9999px'
  const animDur    = { instant:'0ms', fast:'150ms', normal:'300ms', slow:'600ms' }[tokens.animationSpeed ?? 'normal'] ?? '300ms'
  const container  = { sm:'640px', md:'768px', lg:'1024px', xl:'1280px', full:'100%' }[tokens.containerWidth ?? 'xl'] ?? '1280px'
  const sectionPy  = { compact:'3rem', normal:'5rem', spacious:'8rem' }[tokens.sectionPadding ?? 'normal'] ?? '5rem'
  const fontSize   = { xs:'12px', sm:'14px', md:'16px', lg:'18px', xl:'20px' }[tokens.fontSizeScale ?? 'md'] ?? '16px'
  const shadow     = { none:'0', subtle:'0.6', normal:'1', dramatic:'1.8' }[tokens.shadowIntensity ?? 'normal'] ?? '1'
  const glowInt    = { off:'0', subtle:'0.5', normal:'1', vivid:'1.8' }[tokens.glowIntensity ?? 'normal'] ?? '1'

  const css = [
    ':root {',
    `  --primary: ${primary};`,
    `  --accent: ${accent};`,
    design.customBackground ? `  --background: ${design.customBackground};` : null,
    design.customText       ? `  --foreground: ${design.customText};` : null,
    design.customBorder     ? `  --border: ${design.customBorder};` : null,
    design.customSurface    ? `  --card: ${design.customSurface};` : null,
    `  --radius-base: ${radiusBase};`,
    `  --radius-button: ${radiusBtn};`,
    `  --anim-duration: ${animDur};`,
    `  --container-max: ${container};`,
    `  --section-py: ${sectionPy};`,
    `  --font-size-base: ${fontSize};`,
    `  --shadow-intensity: ${shadow};`,
    `  --glow-intensity: ${glowInt};`,
    design.customGlow          ? `  --glow: ${design.customGlow};` : null,
    design.customGlowSecondary ? `  --glow-secondary: ${design.customGlowSecondary};` : null,
    design.customRing          ? `  --ring: ${design.customRing};` : null,
    design.customMuted         ? `  --muted: ${design.customMuted};` : null,
    design.customMutedFg       ? `  --muted-foreground: ${design.customMutedFg};` : null,
    design.gradientStart       ? `  --gradient-start: ${design.gradientStart};` : null,
    design.gradientMid         ? `  --gradient-mid: ${design.gradientMid};` : null,
    design.gradientEnd         ? `  --gradient-end: ${design.gradientEnd};` : null,
    '}',
  ].filter(Boolean).join('\n')

  return (
    <div className="space-y-4">
      <WebsitePreview
        primary={primary}
        accent={accent}
        siteName={state.site.name}
        tagline={state.site.businessFocus}
        tokens={tokens}
      />

      <Section icon={<Globe className="h-3.5 w-3.5" />} title="Live CSS variable readout" subtitle="Computed values currently active on the website">
        <WebsiteColorTokens />
      </Section>

      <Section icon={<Sliders className="h-3.5 w-3.5" />} title="Export design tokens" subtitle="Copy as CSS custom properties">
        <div className="rounded-xl bg-black/40 p-3 font-mono text-[9px] text-white/50 overflow-auto max-h-48">
          <pre>{css}</pre>
        </div>
        <button type="button"
          onClick={() => navigator.clipboard.writeText(css)}
          className="w-full rounded-lg border border-white/8 py-2 font-mono text-[9px] text-white/40 hover:border-white/20 hover:text-white/65 transition-all">
          Copy CSS variables
        </button>
      </Section>
    </div>
  )
}
