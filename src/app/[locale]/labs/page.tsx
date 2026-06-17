import type { Metadata } from 'next'
import { ALL_LABS } from '@/lib/labs/registry'
import { defaultMeta } from '@/lib/config/brand'
import LabsHubClient from './LabsHubClient'

const liveCount = ALL_LABS.filter((l) => l.status === 'live').length
const labNames = ALL_LABS.map((l) => l.name).join(', ')

export const metadata: Metadata = {
  title: 'Labs — Operational Product Modules | JootaCee',
  description: `${liveCount} live operational modules: ${labNames}. Each a standalone AI or automation system with live runtime, architecture documentation, and active development roadmap.`,
  openGraph: {
    title: 'Lab Ecosystem | JootaCee',
    description: 'Operational AI product modules — AURA Core, Trading Intelligence, STL Generator, CRM Intelligence, and ERP Runtime.',
    url: `${defaultMeta.canonicalBase}/en/labs`,
    siteName: 'JootaCee',
    type: 'website',
    images: [{ url: defaultMeta.ogImage, width: 1200, height: 630, alt: 'JootaCee Labs' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: defaultMeta.twitterHandle,
    title: 'Lab Ecosystem | JootaCee',
    description: 'Operational AI product modules with live runtime and architecture documentation.',
  },
}

export default function LabsPage() {
  return <LabsHubClient />
}
