import type { Metadata, Viewport } from 'next'
import { I18nProvider, DocumentLang } from '@/lib/i18n'

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
        en: '/en/',
        es: '/es/',
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
      title: meta?.title || 'JootaCee',
      description: meta?.description || '',
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: `https://jootacee.com/${locale}/`,
      siteName: 'JootaCee',
      title: meta?.title || 'JootaCee',
      description: meta?.description || '',
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = messagesMap[locale] || messagesEn

  return (
    <I18nProvider key={locale} locale={locale} messages={messages}>
      <DocumentLang locale={locale} />
      {children}
    </I18nProvider>
  )
}
