// Visual Engine + Design System types
// Zero dependencies on AdminPanel — safe to import independently

// ─── Color Palette ────────────────────────────────────────────────────────────

export type ColorPalette = 'ocean' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate' | 'custom'

// ─── Design Tokens ────────────────────────────────────────────────────────────

export interface DesignTokens {
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  spacingScale: 'compact' | 'normal' | 'relaxed' | 'spacious'
  shadowIntensity: 'none' | 'subtle' | 'normal' | 'dramatic'
  glowIntensity: 'off' | 'subtle' | 'normal' | 'vivid'
  gradientStyle: 'none' | 'subtle' | 'vibrant' | 'mesh'
  buttonStyle: 'sharp' | 'rounded' | 'pill'
  typography: 'system' | 'modern' | 'classic' | 'mono'
  fontSizeScale: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animationSpeed: 'instant' | 'fast' | 'normal' | 'slow'
  containerWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  cardStyle: 'flat' | 'elevated' | 'outlined' | 'ghost'
  inputStyle: 'flat' | 'outlined' | 'filled' | 'underlined'
  sectionPadding: 'compact' | 'normal' | 'spacious'
  glassBlur: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  glassOpacity: 'ghost' | 'light' | 'normal' | 'heavy' | 'solid'
  glassBorderOpacity: 'none' | 'subtle' | 'normal' | 'strong'
}

export interface DomainAccents {
  projects: string
  research: string
  resources: string
  intelligence: string
  github: string
  about: string
}

export interface DesignConfig {
  darkModeDefault: 'dark' | 'light' | 'system'
  palette: ColorPalette
  customPrimary: string
  customSecondary: string
  customAccent: string
  customBackground: string
  customSurface: string
  customText: string
  customBorder: string
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
  domainAccents?: DomainAccents
  tokens: DesignTokens
}

// ─── Personality ──────────────────────────────────────────────────────────────

export type DesignPersonality =
  | 'minimalist'
  | 'corporate'
  | 'creative'
  | 'futuristic'
  | 'playful'
  | 'elegant'
  | 'brutalist'

export interface WebEffect {
  id: string
  name: string
  enabled: boolean
  intensity: number
}

export interface PersonalityConfig {
  active: DesignPersonality
  effects: WebEffect[]
  designGuide: string
}

// ─── Visual Effects (Design Lab) ──────────────────────────────────────────────

export interface VisualEffectToggle {
  enabled: boolean
  intensity: number
}

export interface ShaderPreset {
  id: string
  name: string
  colors: string[]
  speed: number
  angle: number
}

export interface BgGridConfig {
  enabled: boolean
  color: string
  opacity: number
  size: number
  mask: boolean
}

export interface VisualEffectsConfig {
  meteors:        VisualEffectToggle & { count: number }
  borderBeam:     VisualEffectToggle & { speed: number }
  spotlight:      VisualEffectToggle & { radius: number }
  aurora:         VisualEffectToggle
  smoothScroll:   VisualEffectToggle & { duration: number }
  noiseOverlay:   VisualEffectToggle
  scanlines:      VisualEffectToggle
  parallax:       VisualEffectToggle
  glitchText:     VisualEffectToggle
  customCursor:   VisualEffectToggle
  activeShaderPreset: string
  shaderPresets:  ShaderPreset[]
  bgGrid:         BgGridConfig
  bgGradientOpacity: number
}

// ─── Hero Scene ───────────────────────────────────────────────────────────────

export interface HeroSceneConfig {
  enabled: boolean
  tierOverride: 'auto' | 'low' | 'balanced' | 'high'
  particleCount: number
  lineCount: number
  sphereRadius: number
  backgroundOpacity: number
  parallaxStrength: number
  rotationSpeed: number
  colorA: string
  colorB: string
  postFxBloom: boolean
  postFxVignette: boolean
  animated: boolean
}

// ─── Per-Page Effects ─────────────────────────────────────────────────────────

export interface PageEffectSlot {
  scene3d: boolean
  particles: boolean
  parallax: boolean
  grain: boolean
}

export type PageEffectsMap = Record<string, PageEffectSlot>
