import type { BrandData, NavItem } from '@/lib/foundation/types'

export const brand: BrandData = {
  name: 'JootaCee',
  domain: 'jootacee.com',
  signature: 'JOOTACEE / OPS',
  role: 'AI Systems Architect & Automation Engineer',
  headline: 'Building AI systems, automation infrastructures and modular digital ecosystems.',
  subheadline:
    'Designing intelligent operational architectures for the next generation of digital systems.',
  ctaPrimary: 'Explore Systems',
  ctaSecondary: 'Open Labs',
}

export const heroSignals = [
  'Multi-agent orchestration',
  'Industrial automation intelligence',
  'Graph memory + runtime observability',
]

export const navItems: NavItem[] = [
  { name: 'Systems', href: '#systems' },
  { name: 'Labs', href: '#labs' },
  { name: 'Infrastructure', href: '#infrastructure' },
  { name: 'GitHub', href: '#github' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
]
