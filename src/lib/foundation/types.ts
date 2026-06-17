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

// ─── Extended Profile ─────────────────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable'

export interface SocialLink {
  platform: string
  label: string
  href: string
  icon: string
}

export interface ExpertiseArea {
  title: string
  description: string
  tags: string[]
}

export interface ServiceOffering {
  title: string
  description: string
  deliverables: string[]
  engagement: 'project' | 'retainer' | 'advisory'
}

export interface ProfileData {
  name: string
  displayName: string
  role: string
  tagline: string
  bio: string
  bioExtended: string
  location: string
  timezone: string
  availability: AvailabilityStatus
  availabilityNote: string
  email: string
  social: SocialLink[]
  expertise: ExpertiseArea[]
  services: ServiceOffering[]
  philosophy: string[]
  openSourceUrl: string
}
