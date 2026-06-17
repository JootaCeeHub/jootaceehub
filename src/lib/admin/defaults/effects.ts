import type { HeroSceneConfig, PageEffectsMap, VisualEffectsConfig } from '../types'

// ─── Visual Effects ───────────────────────────────────────────────────────────

export const defaultVisualEffects: VisualEffectsConfig = {
  meteors:      { enabled: true,  intensity: 0.5, count: 14 },
  borderBeam:   { enabled: true,  intensity: 0.7, speed: 5 },
  spotlight:    { enabled: true,  intensity: 0.6, radius: 400 },
  aurora:       { enabled: false, intensity: 0.4 },
  smoothScroll: { enabled: true,  intensity: 1.0, duration: 1.2 },
  noiseOverlay: { enabled: true,  intensity: 0.028 },
  scanlines:    { enabled: true,  intensity: 0.03 },
  parallax:     { enabled: false, intensity: 0.5 },
  glitchText:   { enabled: false, intensity: 0.3 },
  customCursor: { enabled: true,  intensity: 1.0 },
  activeShaderPreset: 'cosmic-blue',
  bgGrid: { enabled: true, color: '#557ca2', opacity: 0.12, size: 64, mask: true },
  bgGradientOpacity: 1.0,
  shaderPresets: [
    { id: 'cosmic-blue',  name: 'Cosmic Blue',  colors: ['#05060a', '#0d1a2e', '#0a1628', '#05060a'], speed: 14, angle: -45 },
    { id: 'aurora-night', name: 'Aurora Night', colors: ['#030a0e', '#071220', '#041514', '#030a0e'], speed: 18, angle: -60 },
    { id: 'nebula',       name: 'Nebula',       colors: ['#06030e', '#110820', '#060318', '#06030e'], speed: 20, angle: -30 },
    { id: 'cyber-ocean',  name: 'Cyber Ocean',  colors: ['#030c12', '#051820', '#040e18', '#030c12'], speed: 16, angle: -45 },
    { id: 'solar-flare',  name: 'Solar Flare',  colors: ['#0e0800', '#201400', '#150a00', '#0e0800'], speed: 12, angle: -50 },
    { id: 'deep-rose',    name: 'Deep Rose',    colors: ['#0e030a', '#200818', '#150510', '#0e030a'], speed: 16, angle: -40 },
    { id: 'void',         name: 'Void',         colors: ['#050507', '#0a0a0e', '#07070b', '#050507'], speed: 22, angle: -45 },
    { id: 'forest-data',  name: 'Forest Data',  colors: ['#030a03', '#061506', '#041004', '#030a03'], speed: 18, angle: -55 },
  ],
}

// ─── Hero Scene Config ────────────────────────────────────────────────────────

export const defaultHeroSceneConfig: HeroSceneConfig = {
  enabled: true,
  tierOverride: 'auto',
  particleCount: 1500,
  lineCount: 38,
  sphereRadius: 1.9,
  backgroundOpacity: 0.27,
  parallaxStrength: 0.24,
  rotationSpeed: 0.04,
  colorA: '#49b7ff',
  colorB: '#6ef7ff',
  postFxBloom: true,
  postFxVignette: true,
  animated: true,
}

// ─── Page Effects Map ─────────────────────────────────────────────────────────

export const defaultPageEffectsMap: PageEffectsMap = {
  home:           { scene3d: true,  particles: true,  parallax: true,  grain: true  },
  systems:        { scene3d: true,  particles: true,  parallax: true,  grain: true  },
  labs:           { scene3d: true,  particles: true,  parallax: true,  grain: true  },
  infrastructure: { scene3d: false, particles: true,  parallax: false, grain: true  },
  github:         { scene3d: false, particles: true,  parallax: false, grain: false },
  about:          { scene3d: false, particles: false, parallax: true,  grain: false },
  contact:        { scene3d: false, particles: false, parallax: false, grain: false },
  playground:     { scene3d: true,  particles: true,  parallax: false, grain: true  },
  research:       { scene3d: false, particles: false, parallax: false, grain: false },
}
