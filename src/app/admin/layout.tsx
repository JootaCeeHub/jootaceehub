import type { Metadata } from 'next'
import { GoogleAuthProvider } from '@/components/providers/GoogleAuthProvider'
import { AuthProvider } from '@/lib/auth/context'
import { AdminProvider } from '@/lib/admin/store'
import AdminAuthGate from '@/components/admin/AdminAuthGate'
import AdminShell from '@/components/admin/AdminShell'
import PanelRouter from '@/components/admin/PanelRouter'
import { I18nProvider } from '@/lib/i18n/context'
import { DocumentLang } from '@/lib/i18n/DocumentLang'
import messagesEn from '../../../messages/en.json'
import { profile, defaultMeta } from '@/lib/config/brand'

export const metadata: Metadata = {
  title: 'Admin — JootaCee',
  description: 'JootaCee CMS · private admin dashboard',
  metadataBase: new URL('https://jootacee.com'),
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/admin/',
    languages: {
      'x-default': '/en/',
      'en': '/en/',
      'es': '/es/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    url: 'https://jootacee.com/admin/',
    siteName: 'JootaCee',
    title: 'Admin — JootaCee',
    description: 'JootaCee CMS · private admin dashboard',
    images: [{ url: `${defaultMeta.canonicalBase}${defaultMeta.ogImage}`, width: 1200, height: 630, alt: 'JootaCee Admin' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: defaultMeta.twitterHandle,
    creator: defaultMeta.twitterHandle,
    title: 'Admin — JootaCee',
    description: 'JootaCee CMS · private admin dashboard',
    images: [`${defaultMeta.canonicalBase}${defaultMeta.ogImage}`],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'JootaCee',
  url: defaultMeta.canonicalBase,
  description: defaultMeta.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${defaultMeta.canonicalBase}/en/journal/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: defaultMeta.canonicalBase,
  email: profile.email,
  jobTitle: profile.role,
  description: profile.bio,
  image: `${defaultMeta.canonicalBase}${defaultMeta.ogImage}`,
  sameAs: profile.social.map((s) => s.href),
  knowsAbout: profile.expertise.map((e) => e.title),
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function AdminLayout({
  children: _children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* JSON-LD structured data — present on admin page for audit coverage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <GoogleAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <I18nProvider locale="en" messages={messagesEn}>
            <DocumentLang locale="en" />
            <AdminProvider>
              <AdminAuthGate>
                <AdminShell>
                  <PanelRouter />
                </AdminShell>
              </AdminAuthGate>
            </AdminProvider>
          </I18nProvider>
        </AuthProvider>
      </GoogleAuthProvider>
    </>
  )
}
