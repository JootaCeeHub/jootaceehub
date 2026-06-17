import {
  Zap,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import type { VisualEffectsConfig } from '@/lib/admin/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tab = 'effects' | 'library' | 'shaders' | 'animations' | 'references'

export interface LibraryEntry {
  name: string
  version?: string
  desc: string
  category: string
  installed: boolean
  installCmd: string
  docsUrl: string
  useCases: string[]
}

export interface AnimEntry {
  name: string
  category: string
  desc: string
  code: string
  previewClass: string
}

export interface RefEntry {
  icon: string
  title: string
  url: string
  desc: string
  tags: string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'effects',    label: 'Effect Controls',   icon: Zap       },
  { id: 'library',   label: 'Library Catalog',    icon: BookOpen  },
  { id: 'shaders',   label: 'Shader Presets',     icon: Layers    },
  { id: 'animations',label: 'Animation Library',  icon: Sparkles  },
  { id: 'references',label: 'Design References',  icon: ExternalLink },
]

export const EFFECT_LABELS: Record<keyof Omit<VisualEffectsConfig, 'activeShaderPreset' | 'shaderPresets' | 'bgGrid' | 'bgGradientOpacity'>, { name: string; desc: string }> = {
  meteors:      { name: 'Meteors',       desc: 'Diagonal shooting stars falling across the hero section' },
  borderBeam:   { name: 'Border Beam',   desc: 'Glowing light beam that traces card perimeters' },
  spotlight:    { name: 'Spotlight',     desc: 'Radial gradient that tracks mouse movement on cards' },
  aurora:       { name: 'Aurora',        desc: 'Slow color-shifting aurora behind hero content' },
  smoothScroll: { name: 'Smooth Scroll', desc: 'Lenis-powered inertia scrolling (duration in seconds)' },
  noiseOverlay: { name: 'Noise Overlay', desc: 'Subtle film grain texture over the entire page' },
  scanlines:    { name: 'Scanlines',     desc: 'Fine horizontal scanline pattern for CRT aesthetic' },
  parallax:     { name: 'Parallax',      desc: 'Depth-based scroll parallax on section backgrounds' },
  glitchText:   { name: 'Glitch Text',   desc: 'RGB-split flicker effect on selected headings' },
  customCursor: { name: 'Custom Cursor', desc: 'Magnetic cursor with trail on interactive elements' },
}

export interface EffectExtraParam {
  field: string
  label: string
  min: number
  max: number
  step: number
  default: number
  decimals?: number
}

export const EFFECT_EXTRA_LABELS: Partial<Record<keyof Omit<VisualEffectsConfig, 'activeShaderPreset' | 'shaderPresets' | 'bgGrid' | 'bgGradientOpacity'>, EffectExtraParam[]>> = {
  meteors:      [{ field: 'count',    label: 'Count',     min: 1,  max: 40,  step: 1,    default: 14 }],
  borderBeam:   [{ field: 'speed',    label: 'Speed (s)', min: 1,  max: 20,  step: 0.5,  default: 5,  decimals: 1 }],
  spotlight:    [{ field: 'radius',   label: 'Radius px', min: 100,max: 800, step: 10,   default: 400 }],
  smoothScroll: [{ field: 'duration', label: 'Duration s',min: 0.3,max: 3.0, step: 0.1,  default: 1.2, decimals: 1 }],
  noiseOverlay: [],
  scanlines:    [],
}

export const EFFECT_ORDER: (keyof Omit<VisualEffectsConfig, 'activeShaderPreset' | 'shaderPresets' | 'bgGrid' | 'bgGradientOpacity'>)[] = [
  'meteors', 'borderBeam', 'spotlight', 'aurora', 'smoothScroll',
  'noiseOverlay', 'scanlines', 'parallax', 'glitchText', 'customCursor',
]

export const LIBRARY_CATEGORIES = ['All', 'Scroll', 'Animation', 'UI', 'Shader', '3D']

export const LIBRARIES: LibraryEntry[] = [
  {
    name: 'Lenis',
    version: '1.3.x',
    desc: 'Ultra-smooth native scroll hijacking with momentum, spring physics, and RAF sync.',
    category: 'Scroll',
    installed: true,
    installCmd: 'npm install lenis',
    docsUrl: 'https://lenis.darkroom.engineering',
    useCases: ['Hero scroll momentum', 'Parallax sync', 'Scroll-driven animations'],
  },
  {
    name: 'GSAP',
    version: '3.x',
    desc: 'Industry-standard animation platform: timelines, ScrollTrigger, morphSVG, TextPlugin.',
    category: 'Animation',
    installed: true,
    installCmd: 'npm install gsap',
    docsUrl: 'https://gsap.com/docs',
    useCases: ['Hero entry animations', 'Scroll-triggered reveals', 'Complex timelines'],
  },
  {
    name: 'Framer Motion',
    version: '12.x',
    desc: 'React-native declarative animations with layout animations and shared element transitions.',
    category: 'Animation',
    installed: true,
    installCmd: 'npm install framer-motion',
    docsUrl: 'https://motion.dev/docs',
    useCases: ['Page transitions', 'Hover interactions', 'Drag gestures'],
  },
  {
    name: 'React Three Fiber',
    version: '9.x',
    desc: 'Declarative Three.js renderer for React with hooks, suspense, and portals.',
    category: '3D',
    installed: true,
    installCmd: 'npm install @react-three/fiber three',
    docsUrl: 'https://r3f.docs.pmnd.rs',
    useCases: ['Neural network hero', '3D system graphs', 'Lab showcases'],
  },
  {
    name: 'Anime.js',
    version: '4.x',
    desc: 'Lightweight JavaScript animation engine with a fluent API for CSS, SVG, and DOM.',
    category: 'Animation',
    installed: false,
    installCmd: 'npm install animejs',
    docsUrl: 'https://animejs.com/documentation',
    useCases: ['SVG path animations', 'Counter animations', 'Staggered list reveals'],
  },
  {
    name: 'simple-parallax-js',
    version: '6.x',
    desc: 'Zero-dependency parallax on any image or element via IntersectionObserver.',
    category: 'Scroll',
    installed: false,
    installCmd: 'npm install simple-parallax-js',
    docsUrl: 'https://simpleparallax.com',
    useCases: ['Background parallax', 'Card depth layers', 'Section imagery'],
  },
  {
    name: 'Floating UI',
    version: '1.x',
    desc: 'Precise floating element positioning (tooltips, popovers, dropdowns) with middleware.',
    category: 'UI',
    installed: false,
    installCmd: 'npm install @floating-ui/react',
    docsUrl: 'https://floating-ui.com/docs',
    useCases: ['Tooltip system', 'Command palette', 'Context menus'],
  },
  {
    name: 'AtroposJS',
    version: '2.x',
    desc: 'Touch-friendly 3D tilt parallax effect with configurable depth layers.',
    category: 'UI',
    installed: false,
    installCmd: 'npm install atropos',
    docsUrl: 'https://atroposjs.com',
    useCases: ['Project cards 3D tilt', 'Lab showcases', 'Feature cards'],
  },
  {
    name: 'Swiper.js',
    version: '11.x',
    desc: 'The most modern mobile touch slider with hardware-accelerated transitions.',
    category: 'UI',
    installed: false,
    installCmd: 'npm install swiper',
    docsUrl: 'https://swiperjs.com/react',
    useCases: ['Project carousel', 'Lab gallery', 'Testimonials slider'],
  },
  {
    name: 'React Scroll Parallax',
    version: '3.x',
    desc: 'React hooks and components for creating parallax scroll effects.',
    category: 'Scroll',
    installed: false,
    installCmd: 'npm install react-scroll-parallax',
    docsUrl: 'https://react-scroll-parallax.damnthat.tv',
    useCases: ['Layer-based depth', 'Image scale on scroll', 'Text offset parallax'],
  },
  {
    name: 'Shader Gradient',
    version: '1.x',
    desc: 'Animated 3D mesh gradient shaders with real-time parameter control.',
    category: 'Shader',
    installed: false,
    installCmd: 'npm install shadergradient',
    docsUrl: 'https://docs.shadergradient.co',
    useCases: ['Hero animated background', 'Section dividers', 'Card backgrounds'],
  },
  {
    name: 'OGL',
    version: '1.x',
    desc: 'Minimal WebGL library (15KB) for custom shaders and interactive canvas effects.',
    category: 'Shader',
    installed: false,
    installCmd: 'npm install ogl',
    docsUrl: 'https://oframe.github.io/ogl/examples',
    useCases: ['Custom GLSL shaders', 'Fluid simulations', 'Noise displacement'],
  },
  {
    name: 'tailwind-animated',
    version: '1.x',
    desc: 'Pre-built Tailwind CSS animation utilities from Animate.css.',
    category: 'Animation',
    installed: false,
    installCmd: 'npm install tailwindcss-animated',
    docsUrl: 'https://github.com/new-data-services/tailwindcss-animated',
    useCases: ['Quick in/out transitions', 'Attention seekers', 'Card entrances'],
  },
  {
    name: 'Toastify',
    version: '3.x',
    desc: 'Minimal, highly customizable notification toasts with queue management.',
    category: 'UI',
    installed: false,
    installCmd: 'npm install react-toastify',
    docsUrl: 'https://fkhadra.github.io/react-toastify',
    useCases: ['Admin save feedback', 'Form submissions', 'Copy confirmations'],
  },
]

export const ANIMATIONS: AnimEntry[] = [
  {
    name: 'Fade Up',
    category: 'GSAP',
    desc: 'Elements enter from below with opacity transition. Core reveal pattern.',
    code: `gsap.from(el, { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' })`,
    previewClass: 'animate-fade-in-up',
  },
  {
    name: 'Stagger Reveal',
    category: 'GSAP',
    desc: 'Sequential child element reveals with configurable delay between each.',
    code: `gsap.from('.item', { y: 30, opacity: 0, stagger: 0.08, ease: 'power2.out' })`,
    previewClass: 'animate-fade-in-up',
  },
  {
    name: 'ScrollTrigger Pin',
    category: 'GSAP',
    desc: 'Pin an element while scrolling through a defined range, then release.',
    code: `ScrollTrigger.create({ trigger: el, pin: true, start: 'top top', end: '+=400' })`,
    previewClass: 'animate-beacon',
  },
  {
    name: 'Spring Entry',
    category: 'Framer Motion',
    desc: 'Organic spring-physics element entry. Great for cards and modals.',
    code: `<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }} />`,
    previewClass: 'animate-orb',
  },
  {
    name: 'Layout Animation',
    category: 'Framer Motion',
    desc: 'Automatic smooth transitions when DOM layout changes (reorder, resize).',
    code: `<motion.div layout layoutId="card" />`,
    previewClass: 'animate-reveal',
  },
  {
    name: 'Path Draw',
    category: 'CSS',
    desc: 'SVG stroke-dashoffset animation to draw paths on scroll or trigger.',
    code: `.path { stroke-dasharray: 1000; animation: draw 2s ease forwards; }`,
    previewClass: 'animate-beacon',
  },
  {
    name: 'Aurora Drift',
    category: 'CSS',
    desc: 'Slow rotating conic gradient simulating northern lights.',
    code: `@keyframes aurora { 0%,100%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(40deg)} }`,
    previewClass: 'animate-aurora',
  },
  {
    name: 'Cursor Blink',
    category: 'CSS',
    desc: 'Terminal-style block cursor blinking animation.',
    code: `@keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }`,
    previewClass: 'animate-cursor',
  },
  {
    name: 'Glow Ring',
    category: 'CSS',
    desc: 'Expanding pulsating ring emanating from a point element.',
    code: `@keyframes glow-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }`,
    previewClass: 'animate-glow-ring',
  },
  {
    name: 'Stagger Anime',
    category: 'Anime.js',
    desc: 'Sequential animation across multiple targets with easing and delay.',
    code: `anime({ targets: '.el', translateY: [-30, 0], opacity: [0, 1], delay: anime.stagger(80) })`,
    previewClass: 'animate-fade-in-up',
  },
]

export const REFERENCES: RefEntry[] = [
  {
    icon: '▸',
    title: 'Motion.dev',
    url: 'https://motion.dev',
    desc: 'Official Framer Motion documentation with interactive examples for every feature.',
    tags: ['Framer Motion', 'React', 'Animations'],
  },
  {
    icon: '◈',
    title: 'Aceternity UI',
    url: 'https://ui.aceternity.com',
    desc: 'Copy-paste components: 3D cards, spotlight, animated beams, aurora backgrounds.',
    tags: ['Components', 'Tailwind', 'Inspiration'],
  },
  {
    icon: '⬡',
    title: 'OGL Examples',
    url: 'https://oframe.github.io/ogl/examples',
    desc: 'Minimal WebGL shader demos: fluid, noise, displacement, ripple effects.',
    tags: ['WebGL', 'Shaders', 'Canvas'],
  },
  {
    icon: '◐',
    title: 'ShaderGradient Studio',
    url: 'https://www.shadergradient.co',
    desc: 'Real-time animated 3D gradient mesh with exportable React component.',
    tags: ['Shaders', '3D', 'Gradient'],
  },
  {
    icon: '⊞',
    title: 'React Scroll Parallax',
    url: 'https://react-scroll-parallax.damnthat.tv',
    desc: 'Docs and interactive playground for scroll-based parallax in React.',
    tags: ['Parallax', 'Scroll', 'React'],
  },
  {
    icon: '◻',
    title: 'htmlrev.com',
    url: 'https://htmlrev.com',
    desc: 'Curated collection of free HTML templates with futuristic and dark themes.',
    tags: ['Templates', 'HTML', 'Inspiration'],
  },
  {
    icon: '◆',
    title: 'websitevice.com',
    url: 'https://websitevice.com',
    desc: 'Gallery of award-winning websites for design direction and interaction patterns.',
    tags: ['Inspiration', 'Design', 'UX'],
  },
  {
    icon: '⟡',
    title: 'Lenis Demos',
    url: 'https://lenis.darkroom.engineering',
    desc: 'Official Lenis smooth scroll demos with GSAP ScrollTrigger integration.',
    tags: ['Lenis', 'Scroll', 'GSAP'],
  },
]
