import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeApplicator } from '@/components/shared/ThemeApplicator'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { SmoothScroll } from '@/components/shared/SmoothScroll'
import { Analytics } from '@/components/shared/Analytics'
import { CSP_STRING } from '@/lib/config/csp'
import { SkipToMain } from '@/components/shared/SkipToMain'
import { BetaBanner } from '@/components/shared/BetaBanner'
import { getThemeInitScript } from '@/lib/config/theme-init'
import './globals.css'

// next/font/google self-hosts: fonts download at build time into _next/static/media/,
// served from our own domain — zero runtime requests to fonts.gstatic.com.
// display:'swap' — browser renders fallback font immediately → FCP at ~1.8s.
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
        {/* Note: fonts are self-hosted via next/font/google — no preconnect to Google Fonts needed */}
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        {/* Sentry / Plausible — resolve DNS early so first event has low latency */}
        <link rel="dns-prefetch" href="https://o0.ingest.sentry.io" />
        <link rel="dns-prefetch" href="https://plausible.io" />

        {/* 2b — Mobile performance: preconnect for analytics beacons */}
        <link rel="preconnect" href="https://plausible.io" crossOrigin="anonymous" />
        {/* Hint browser to fetch OG image early for social sharing previews */}
        <link rel="preload" as="image" href="/og-image.png" fetchPriority="low" />

        {/* 3 — Identity */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Safari pinned tab icon + Android maskable anchor */}
        <link rel="mask-icon" href="/icon-192x192.svg" color="#05060a" />

        {/* 4 — Theme color: controls browser UI chrome color on mobile PWA installs */}
        <meta name="theme-color" content="#05060a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f6f8fc" media="(prefers-color-scheme: light)" />

        {/* 5 — Admin design tokens: runs synchronously before first paint (zero-flash palette) */}
        {/* Same pattern as next-themes. CSP allows 'unsafe-inline' for static export. */}
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript() }} />
      </head>
      <body className="min-h-full bg-background text-foreground selection:bg-primary/30 selection:text-foreground" suppressHydrationWarning>
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', background: '#05060a', color: '#e2e8f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>JavaScript Required</h1>
              <p>This application requires JavaScript to function. Please enable JavaScript in your browser settings and reload.</p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#818cf8', textDecoration: 'underline' }}>Reload page</a>
            </div>
          </div>
        </noscript>
        <BetaBanner />
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
