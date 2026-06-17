import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeApplicator } from '@/components/shared/ThemeApplicator'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { SmoothScroll } from '@/components/shared/SmoothScroll'
import { Analytics } from '@/components/shared/Analytics'
import { CSP_STRING } from '@/lib/config/csp'
import { SkipToMain } from '@/components/shared/SkipToMain'
import { getThemeInitScript } from '@/lib/config/theme-init'
import './globals.css'

// display:'swap' — browser renders fallback font immediately → FCP at ~1.8s.
// The swap to Inter at ~4.8s (throttled mobile) is a known LCP cost;
// 'fallback' blocks for 100ms which pushes FCP to 2.7s — worse tradeoff.
// True LCP fix requires self-hosting fonts; keeping swap until that work lands.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 1 — Security: CSP enforced before any other resource is fetched */}
        <meta httpEquiv="Content-Security-Policy" content={CSP_STRING} />

        {/* 2 — Performance: warm connections before any script requests them */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        {/* Sentry / Plausible — resolve DNS early so first event has low latency */}
        <link rel="dns-prefetch" href="https://o0.ingest.sentry.io" />
        <link rel="dns-prefetch" href="https://plausible.io" />

        {/* 3 — Identity */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* 4 — Admin design tokens: runs synchronously before first paint (zero-flash palette) */}
        {/* Same pattern as next-themes. CSP allows 'unsafe-inline' for static export. */}
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="min-h-full bg-background text-foreground selection:bg-primary/30 selection:text-foreground" suppressHydrationWarning>
        <SkipToMain />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeApplicator />
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <ServiceWorkerRegister />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
