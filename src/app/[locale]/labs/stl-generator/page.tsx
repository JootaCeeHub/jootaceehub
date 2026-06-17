import type { Metadata } from 'next'
import { LAB_REGISTRY } from '@/lib/labs/registry'
import { defaultMeta } from '@/lib/config/brand'
import StlGeneratorClient from './StlGeneratorClient'

const lab = LAB_REGISTRY['stl-generator']!

export const metadata: Metadata = {
  title: `${lab.name} | JootaCee Labs`,
  description: lab.description,
  keywords: lab.stack.map((s) => s.name).join(', '),
  openGraph: {
    title: `${lab.name} | JootaCee Labs`,
    description: lab.description,
    url: `${defaultMeta.canonicalBase}/en/labs/${lab.slug}`,
    siteName: 'JootaCee',
    type: 'website',
    images: [{ url: defaultMeta.ogImage, width: 1200, height: 630, alt: lab.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: defaultMeta.twitterHandle,
    title: `${lab.name} | JootaCee`,
    description: lab.tagline,
  },
}

export default function StlGeneratorPage() {
  return <StlGeneratorClient />
}
