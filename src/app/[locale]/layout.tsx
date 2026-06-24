import type { Metadata, Viewport } from 'next'
import { I18nProvider, DocumentLang } from '@/lib/i18n'
import { ScrollProgressBar } from '@/components/shared/ScrollProgressBar'
import { profile, defaultMeta } from '@/lib/config/brand'

import messagesEn from '../../../messages/en.json'
import messagesEs from '../../../messages/es.json'

const messagesMap: Record<string, Record<string, unknown>> = {
  en: messagesEn as Record<string, unknown>,
  es: messagesEs as Record<string, unknown>,
}

export function generateStaticParams() {
  return ['en', 'es'].map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = (messagesMap[locale] || messagesEn) as Record<string, unknown>
  const meta = t.meta as Record<string, string> | undefined

  return {
    title: meta?.title || 'JootaCee',
    description: meta?.description || '',
    metadataBase: new URL('https://jootacee.com'),
    alternates: {
      canonical: `/${locale}/`,
      languages: {
        'x-default': '/en/',
        en: '/en/',
        es: '/es/',
      },
      types: {
        'application/rss+xml': `${defaultMeta.canonicalBase}/rss.xml`,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/icon-192x192.png',
      apple: '/apple-touch-icon.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'JootaCee',
      startupImage: ['/icon-512x512.png'],
    },
    manifest: '/manifest.webmanifest',
    twitter: {
      card: 'summary_large_image',
      site: defaultMeta.twitterHandle,
      creator: defaultMeta.twitterHandle,
      title: meta?.title || defaultMeta.title,
      description: meta?.description || defaultMeta.description,
      images: [
        {
          url: `${defaultMeta.canonicalBase}${defaultMeta.ogImage}`,
          width: 1200,
          height: 630,
          alt: meta?.title || defaultMeta.title,
        },
      ],
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? ['en_US'] : ['es_ES'],
      url: `${defaultMeta.canonicalBase}/${locale}/`,
      siteName: 'JootaCee',
      title: meta?.title || defaultMeta.title,
      description: meta?.description || defaultMeta.description,
      images: [
        {
          url: `${defaultMeta.canonicalBase}${defaultMeta.ogImage}`,
          width: 1200,
          height: 630,
          alt: meta?.title || defaultMeta.title,
          type: 'image/png',
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060a' },
    { media: '(prefers-color-scheme: light)', color: '#f6f8fc' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = messagesMap[locale] || messagesEn

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${defaultMeta.canonicalBase}/${locale}/`,
      },
    ],
  }

  return (
    <>
      {/* JSON-LD structured data — must live outside Client Components to render in React 19 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <I18nProvider key={locale} locale={locale} messages={messages}>
        <DocumentLang locale={locale} />
        <ScrollProgressBar />
        <div data-pagefind-body>{children}</div>
      </I18nProvider>
    </>
  )
}
