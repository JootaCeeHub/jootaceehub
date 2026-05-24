export interface BrandData {
  name: string
  domain: string
  signature: string
  role: string
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

export interface NavItem {
  name: string
  href: string
}

export interface FoundationIdentity {
  brand: BrandData
  navItems: NavItem[]
  heroSignals: string[]
  status: 'operational'
  revision: string
  generatedAt: string
}

