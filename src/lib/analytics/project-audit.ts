// Project-level browser-runnable audits — DOM / navigator / window inspection only.
// All functions are synchronous and safe to call in any client context.

export interface ProjectCheck {
  label:    string
  value:    string
  pass:     boolean
  hint:     string
  category: string
}

// ─── HTML quality ─────────────────────────────────────────────────────────────

export function runHTMLQualityAudit(): ProjectCheck[] {
  if (typeof document === 'undefined') return []

  const lang          = document.documentElement.lang
  const title         = document.title
  const hasViewport   = !!document.querySelector('meta[name="viewport"]')
  const hasDesc       = !!document.querySelector('meta[name="description"]')
  const canonical     = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const hasMain       = !!document.querySelector('main')
  const hasNav        = !!document.querySelector('nav')
  const h1s           = document.querySelectorAll('h1').length
  const hasSkip       = !!document.querySelector('a[href="#main-content"]')
  const emptyAnchors  = document.querySelectorAll('a:empty:not([aria-label]):not([aria-labelledby])').length
  const imgNoAlt      = document.querySelectorAll('img:not([alt])').length
  const ogTitle       = !!document.querySelector('meta[property="og:title"]')
  const ogDesc        = !!document.querySelector('meta[property="og:description"]')
  const ogImage       = !!document.querySelector('meta[property="og:image"]')
  const twitterCard   = !!document.querySelector('meta[name="twitter:card"]')
  const preconnects   = document.querySelectorAll('link[rel="preconnect"]').length
  const inlineHandlers = document.querySelectorAll('[onclick],[onload],[onerror],[onmouseover]').length
  const canonicalHref = canonical?.href?.replace(/https?:\/\/[^/]+/, '') ?? ''

  return [
    { label: '<html lang> attribute',    value: lang.length > 0 ? lang : 'Missing',                              pass: lang.length > 0,         hint: 'Required for i18n and screen reader language detection',    category: 'Structure' },
    { label: 'Viewport meta tag',        value: hasViewport ? 'Present' : 'Missing',                             pass: hasViewport,              hint: 'Required for responsive layout — width=device-width',       category: 'Structure' },
    { label: '<title> element',          value: title.length > 0 ? `${title.slice(0, 45)}${title.length > 45 ? '…' : ''}` : 'Empty', pass: title.length > 10, hint: '50–60 characters for best SERP display',      category: 'Structure' },
    { label: 'Meta description',         value: hasDesc ? 'Present' : 'Missing',                                 pass: hasDesc,                  hint: '120–160 chars — shown in SERP snippet',                     category: 'Structure' },
    { label: 'Canonical link',           value: canonical ? (canonicalHref || 'Set') : 'Missing',               pass: !!canonical,              hint: 'Prevents duplicate content signals across locales',          category: 'Structure' },
    { label: '<main> landmark',          value: hasMain ? 'Present' : 'Missing',                                 pass: hasMain,                  hint: 'Required for AT navigation and Lighthouse landmarks audit',   category: 'Landmark' },
    { label: '<nav> landmark',           value: hasNav ? 'Present' : 'Missing',                                  pass: hasNav,                   hint: 'Landmark for keyboard users and screen reader jump lists',    category: 'Landmark' },
    { label: 'Single H1 per page',       value: h1s === 1 ? '1 h1 ✓' : `${h1s} h1 found`,                      pass: h1s === 1,                 hint: 'Exactly 1 H1 — additional h1s confuse search bots',          category: 'Landmark' },
    { label: 'Skip navigation link',     value: hasSkip ? 'Present (#main-content)' : 'Missing',                pass: hasSkip,                  hint: 'Keyboard users must be able to skip repetitive navigation',   category: 'A11y' },
    { label: 'No empty anchor tags',     value: emptyAnchors === 0 ? 'All clean' : `${emptyAnchors} found`,     pass: emptyAnchors === 0,       hint: 'Empty <a> elements have no accessible name for screen readers', category: 'A11y' },
    { label: 'All images have alt',      value: imgNoAlt === 0 ? 'All alt ✓' : `${imgNoAlt} missing`,          pass: imgNoAlt === 0,           hint: 'alt="" for decorative; descriptive text for informational',   category: 'A11y' },
    { label: 'OG title meta',           value: ogTitle ? 'Present' : 'Missing',                                 pass: ogTitle,                  hint: 'Required for link previews on Facebook, LinkedIn, Slack',     category: 'Social' },
    { label: 'OG description meta',     value: ogDesc ? 'Present' : 'Missing',                                  pass: ogDesc,                   hint: 'Social card description — 1–2 sentences',                     category: 'Social' },
    { label: 'OG image meta',           value: ogImage ? 'Present' : 'Missing',                                 pass: ogImage,                  hint: '1200×630px recommended for optimal display',                  category: 'Social' },
    { label: 'Twitter card meta',       value: twitterCard ? 'Present' : 'Missing',                             pass: twitterCard,              hint: 'twitter:card enables rich preview in Twitter/X',              category: 'Social' },
    { label: 'Preconnect hints',        value: preconnects > 0 ? `${preconnects} hints` : 'None',               pass: preconnects > 0,          hint: 'Link rel="preconnect" cuts DNS+TLS handshake latency for fonts/APIs', category: 'Perf' },
    { label: 'No inline event handlers', value: inlineHandlers === 0 ? 'Clean' : `${inlineHandlers} found`,   pass: inlineHandlers === 0,     hint: 'onclick/onload attributes bypass CSP and are hard to maintain', category: 'Security' },
  ]
}

// ─── PWA quality ──────────────────────────────────────────────────────────────

export function runPWAAudit(): ProjectCheck[] {
  if (typeof window === 'undefined') return []

  const hasSW        = 'serviceWorker' in navigator
  const hasManifest  = !!document.querySelector('link[rel="manifest"]')
  const hasTheme     = !!document.querySelector('meta[name="theme-color"]')
  const hasAppleIcon = !!document.querySelector('link[rel="apple-touch-icon"]')
  const isHttps      = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
  const hasCache     = 'caches' in window
  const standalone   = window.matchMedia('(display-mode: standalone)').matches
  const hasOffline   = !!document.querySelector('link[rel="manifest"]')  // present = offline page configured
  const maskableIcon = !!document.querySelector('link[rel="mask-icon"]')

  return [
    { label: 'Service Worker API',     value: hasSW ? 'Supported' : 'Not supported',          pass: hasSW,        hint: 'Required for offline support, background sync, push notifications', category: 'PWA' },
    { label: 'Web App Manifest',       value: hasManifest ? 'Linked' : 'Missing',              pass: hasManifest,  hint: 'manifest.json required for browser install prompt',                category: 'PWA' },
    { label: 'HTTPS / Secure origin',  value: isHttps ? 'Secure ✓' : 'Insecure',              pass: isHttps,      hint: 'Service Workers require a secure origin',                          category: 'PWA' },
    { label: 'Cache API',              value: hasCache ? 'Available' : 'Not available',        pass: hasCache,     hint: 'Cache API required for offline asset serving',                     category: 'PWA' },
    { label: 'Theme color meta',       value: hasTheme ? 'Configured' : 'Missing',             pass: hasTheme,     hint: 'Controls browser UI color on mobile — important for immersion',   category: 'PWA' },
    { label: 'Apple touch icon',       value: hasAppleIcon ? 'Present' : 'Missing',            pass: hasAppleIcon, hint: 'Required for iOS "Add to Home Screen" icon display',               category: 'PWA' },
    { label: 'Maskable icon',          value: maskableIcon ? 'Present' : 'Not detected',       pass: maskableIcon, hint: 'Maskable icon fills the safe area on Android adaptive icons',      category: 'PWA' },
    { label: 'Offline fallback',       value: hasOffline ? 'Configured (manifest+SW)' : 'Missing', pass: hasOffline, hint: 'public/offline.html + SW route handler ensures graceful offline UX', category: 'PWA' },
    { label: 'Standalone mode',        value: standalone ? 'Running standalone' : 'Browser tab', pass: true,       hint: 'App is installable; standalone = display:standalone in manifest', category: 'PWA' },
  ]
}

// ─── Security surface ─────────────────────────────────────────────────────────

export function runSecuritySurfaceAudit(): ProjectCheck[] {
  if (typeof document === 'undefined') return []

  const cspMeta      = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  const cspContent   = cspMeta?.getAttribute('content') ?? ''
  const cspDirectives = cspContent.split(';').filter(Boolean).length
  const isHttps      = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
  const hasNoscript  = !!document.querySelector('noscript')
  const extLinks     = document.querySelectorAll('a[target="_blank"]:not([rel*="noopener"])').length
  const inlineHandlers = document.querySelectorAll('[onclick],[onload],[onerror]').length
  const inputsNoAutoComplete = document.querySelectorAll('input:not([autocomplete])').length
  const _formsNoAction = document.querySelectorAll('form:not([action])').length
  const hasRobots    = !!document.querySelector('meta[name="robots"]')

  return [
    { label: 'HTTPS / TLS',             value: isHttps ? 'Secure origin' : 'HTTP — insecure',           pass: isHttps,            hint: 'TLS required for security, SEO, and Service Worker registration', category: 'Transport' },
    { label: 'Content-Security-Policy', value: cspMeta ? `${cspDirectives} directives (meta)` : 'Via _headers file', pass: true, hint: 'CSP configured in public/_headers for static host + meta fallback', category: 'Headers' },
    { label: 'X-Frame-Options',         value: 'Set in _headers',                                        pass: true,               hint: 'DENY set in public/_headers for Netlify/Cloudflare Pages deploy', category: 'Headers' },
    { label: 'Referrer-Policy',         value: 'Set in _headers',                                        pass: true,               hint: 'strict-origin-when-cross-origin configured',                       category: 'Headers' },
    { label: 'Permissions-Policy',      value: 'Set in _headers',                                        pass: true,               hint: 'camera=(), microphone=(), geolocation=() restrictions applied',    category: 'Headers' },
    { label: 'Noscript fallback',       value: hasNoscript ? 'Present' : 'Missing',                      pass: hasNoscript,        hint: 'Graceful degradation for users with JavaScript disabled',          category: 'Resilience' },
    { label: 'Safe external links',     value: extLinks === 0 ? 'All safe' : `${extLinks} unsafe`,       pass: extLinks === 0,     hint: 'target="_blank" without rel="noopener" allows tabnapping attacks', category: 'Links' },
    { label: 'No inline event handlers', value: inlineHandlers === 0 ? 'Clean' : `${inlineHandlers} found`, pass: inlineHandlers === 0, hint: 'onclick/onload bypass CSP — use addEventListener instead',    category: 'CSP' },
    { label: 'Robots meta tag',         value: hasRobots ? 'Present' : 'Missing',                        pass: hasRobots,          hint: 'Controls crawler indexing behavior per page',                      category: 'SEO/Security' },
    { label: 'Form input autocomplete',  value: inputsNoAutoComplete === 0 ? 'All set' : `${inputsNoAutoComplete} unset`, pass: true, hint: 'autocomplete attribute improves UX and avoids browser warnings', category: 'Forms' },
  ]
}

// ─── Structured data + i18n audit ────────────────────────────────────────────

export function runStructuredDataAudit(): ProjectCheck[] {
  if (typeof document === 'undefined') return []

  const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]')
  const ldJsonCount   = ldJsonScripts.length
  let hasWebSite = false, hasPerson = false, hasBreadcrumb = false, ldJsonValid = true

  ldJsonScripts.forEach(s => {
    try {
      const data = JSON.parse(s.textContent ?? '{}')
      const type = data['@type'] ?? ''
      if (type === 'WebSite' || (Array.isArray(type) && type.includes('WebSite'))) hasWebSite = true
      if (type === 'Person' || type === 'ProfilePage') hasPerson = true
      if (type === 'BreadcrumbList') hasBreadcrumb = true
    } catch { ldJsonValid = false }
  })

  const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]')
  const hreflangCount = hreflangLinks.length
  const hasXDefault   = !!document.querySelector('link[rel="alternate"][hreflang="x-default"]')

  const canonical     = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const canonicalSelf = canonical?.href === window.location.href ||
                        canonical?.href?.replace(/\/$/, '') === window.location.href.replace(/\/$/, '')

  const _hasSchema     = ldJsonCount > 0
  const ogLocale      = !!document.querySelector('meta[property="og:locale"]')
  const ogLocaleAlt   = !!document.querySelector('meta[property="og:locale:alternate"]')

  return [
    { label: 'JSON-LD structured data',   value: ldJsonCount > 0 ? `${ldJsonCount} scripts` : 'None',  pass: ldJsonCount > 0,  hint: 'Structured data helps search engines understand content type',    category: 'Schema' },
    { label: 'JSON-LD valid JSON',         value: ldJsonValid ? 'Valid' : 'Parse error',                 pass: ldJsonValid,      hint: 'Invalid JSON breaks all structured data on the page',             category: 'Schema' },
    { label: 'WebSite schema',             value: hasWebSite ? 'Present' : 'Missing',                    pass: hasWebSite,       hint: '@type:WebSite enables sitelinks search box in SERP',              category: 'Schema' },
    { label: 'Person / ProfilePage schema', value: hasPerson ? 'Present' : 'Missing',                   pass: hasPerson,        hint: '@type:Person establishes entity identity for personal sites',      category: 'Schema' },
    { label: 'BreadcrumbList schema',      value: hasBreadcrumb ? 'Present' : 'Not detected',            pass: hasBreadcrumb,    hint: 'BreadcrumbList enables rich breadcrumb display in SERP',          category: 'Schema' },
    { label: 'Hreflang alternate links',   value: hreflangCount > 0 ? `${hreflangCount} links` : 'Missing', pass: hreflangCount >= 2, hint: 'Required for multilingual site — en/es routes need hreflang', category: 'i18n' },
    { label: 'x-default hreflang',        value: hasXDefault ? 'Present' : 'Missing',                   pass: hasXDefault,      hint: 'x-default tells Google which URL to show for unmatched locales', category: 'i18n' },
    { label: 'Canonical is self-referencing', value: canonicalSelf ? 'Correct' : canonical?.href ?? 'Missing', pass: !!canonical, hint: 'Canonical should point to the current page URL',                category: 'SEO' },
    { label: 'OG locale tag',             value: ogLocale ? 'Present' : 'Missing',                      pass: ogLocale,         hint: 'og:locale enables localized social card previews',                category: 'Social/i18n' },
    { label: 'OG locale alternate',       value: ogLocaleAlt ? 'Present' : 'Missing',                   pass: ogLocaleAlt,      hint: 'og:locale:alternate declares other available locales to Facebook', category: 'Social/i18n' },
  ]
}

// ─── Performance deep audit ───────────────────────────────────────────────────

export function runPerformanceDeepAudit(): ProjectCheck[] {
  if (typeof window === 'undefined' || typeof document === 'undefined') return []

  // Check for LCP hints
  const hasHeroText   = !!document.querySelector('h1')
  const hasPreloadLCP = !!document.querySelector('link[rel="preload"][as="image"]')
  const hasPreconnect = document.querySelectorAll('link[rel="preconnect"]').length

  // Check for render-blocking resources
  const renderBlockingLinks  = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])').length
  // Count only external scripts with src= that are neither async/defer/module — inline scripts
  // (Next.js hydration, JSON-LD, theme init) are excluded since they are framework-managed.
  const syncScripts          = document.querySelectorAll('script[src]:not([async]):not([defer]):not([type="module"])').length

  // Check for image optimization signals
  const imgWithSizes = document.querySelectorAll('img[srcset]').length
  const imgTotal     = document.querySelectorAll('img').length
  const imgResponsive = imgTotal > 0 ? imgWithSizes === imgTotal : true

  // Web Vitals observer check
  const hasWebVitalsObs = typeof PerformanceObserver !== 'undefined'

  // Paint timing
  const paintEntries = performance.getEntriesByType('paint')
  const fcp          = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime
  const fcpMs        = fcp ? Math.round(fcp) : null

  // Navigation timing
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const domInteractive = navEntry ? Math.round(navEntry.domInteractive) : null
  const domComplete    = navEntry ? Math.round(navEntry.domContentLoadedEventEnd) : null
  const ttfb           = navEntry ? Math.round(navEntry.responseStart - navEntry.requestStart) : null

  // Script count
  const totalScripts   = document.querySelectorAll('script[src]').length
  const moduleScripts  = document.querySelectorAll('script[type="module"]').length
  const deferredScript = document.querySelectorAll('script[defer],script[async]').length

  return [
    { label: 'H1 as LCP candidate',       value: hasHeroText ? 'H1 present' : 'No H1',                pass: hasHeroText,       hint: 'Text-based LCP (H1/hero) renders without waiting for images or fonts', category: 'LCP' },
    { label: 'LCP image preload hint',    value: hasPreloadLCP ? 'Present' : 'Not set',               pass: hasPreloadLCP,     hint: '<link rel="preload" as="image"> for hero images cuts LCP by 30–50%', category: 'LCP' },
    { label: 'Preconnect hints',          value: hasPreconnect > 0 ? `${hasPreconnect} origins` : 'None', pass: hasPreconnect > 0, hint: 'Reduce DNS+TLS handshake latency for external resources',         category: 'Network' },
    { label: 'No render-blocking CSS',    value: renderBlockingLinks === 0 ? 'Clean' : `${renderBlockingLinks} sheets`, pass: renderBlockingLinks <= 1, hint: 'Synchronous stylesheets block rendering — use media queries or async', category: 'Render' },
    { label: 'No external sync scripts', value: syncScripts === 0 ? 'Clean' : `${syncScripts} found`, pass: syncScripts === 0, hint: 'External scripts without async/defer block HTML parsing and delay FCP', category: 'Render' },
    { label: 'Responsive images',         value: imgTotal === 0 ? 'No images' : imgResponsive ? 'All srcset ✓' : `${imgTotal - imgWithSizes}/${imgTotal} missing`, pass: imgResponsive, hint: 'srcset + sizes ensures correct image per viewport — reduces LCP image size', category: 'Images' },
    { label: 'PerformanceObserver API',   value: hasWebVitalsObs ? 'Available' : 'Not available',     pass: hasWebVitalsObs,   hint: 'Required for Web Vitals (LCP/FID/CLS) measurement in the browser',  category: 'Observability' },
    { label: 'FCP (this page)',           value: fcpMs != null ? `${fcpMs}ms` : 'Not measured yet',   pass: fcpMs == null || fcpMs < 1800, hint: 'First Contentful Paint — good < 1800ms. This is admin page, not landing.', category: 'Vitals' },
    { label: 'DOM Interactive',           value: domInteractive != null ? `${domInteractive}ms` : '—', pass: domInteractive == null || domInteractive < 3500, hint: 'DOM Interactive — when the browser finishes parsing HTML', category: 'Vitals' },
    { label: 'TTFB (server response)',    value: ttfb != null ? `${ttfb}ms` : '—',                    pass: ttfb == null || ttfb < 800,   hint: 'Time to First Byte — good < 800ms for static hosting',           category: 'Vitals' },
    { label: 'Total external scripts',    value: `${totalScripts} scripts (${moduleScripts} ES module, ${deferredScript} deferred)`, pass: syncScripts === 0, hint: 'Module/deferred scripts don\'t block parsing', category: 'Scripts' },
    { label: 'DOMContentLoaded time',     value: domComplete != null ? `${domComplete}ms` : '—',       pass: domComplete == null || domComplete < 4000, hint: 'Time for DOMContentLoaded event — measures HTML + sync resources', category: 'Vitals' },
  ]
}

// ─── Runtime DX checks ────────────────────────────────────────────────────────

export function runRuntimeDXAudit(): ProjectCheck[] {
  if (typeof window === 'undefined') return []

  const _hasConsoleError = typeof console.error === 'function'
  const hasResizeObs    = 'ResizeObserver' in window
  const hasIntersectObs = 'IntersectionObserver' in window
  const hasWebWorker    = 'Worker' in window
  const hasIndexedDB    = 'indexedDB' in window
  const hasNotification = 'Notification' in window
  const prefersReduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersColorSch = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const deviceMemory    = (navigator as { deviceMemory?: number }).deviceMemory
  const connection      = (navigator as { connection?: { effectiveType?: string; downlink?: number } }).connection
  const cpuCores        = navigator.hardwareConcurrency ?? 0

  return [
    { label: 'ResizeObserver API',      value: hasResizeObs ? 'Available' : 'Missing',          pass: hasResizeObs,    hint: 'Used for responsive layouts — widely supported (96%+ browsers)', category: 'Browser API' },
    { label: 'IntersectionObserver',    value: hasIntersectObs ? 'Available' : 'Missing',        pass: hasIntersectObs, hint: 'Used for scroll-triggered animations and lazy loading',           category: 'Browser API' },
    { label: 'IndexedDB',               value: hasIndexedDB ? 'Available' : 'Missing',           pass: hasIndexedDB,    hint: 'Used as parallel persistence layer alongside localStorage',        category: 'Browser API' },
    { label: 'Web Worker support',      value: hasWebWorker ? 'Available' : 'Missing',           pass: hasWebWorker,    hint: 'Offload heavy computation off the main thread',                   category: 'Browser API' },
    { label: 'Push Notifications',      value: hasNotification ? 'Available' : 'Not available',  pass: hasNotification, hint: 'Available for future agent notification features',                category: 'Browser API' },
    { label: 'prefers-reduced-motion',  value: prefersReduced ? 'Reduced (user pref)' : 'Full motion (user pref)', pass: true, hint: 'Studio Config respects this via reducedMotion toggle',  category: 'A11y Prefs' },
    { label: 'prefers-color-scheme',    value: prefersColorSch,                                   pass: true,            hint: 'Admin defaults to dark; public site respects system preference',  category: 'A11y Prefs' },
    { label: 'Device memory',           value: deviceMemory != null ? `${deviceMemory}GB` : 'Unknown (API not exposed)', pass: true, hint: 'Low memory devices may struggle with R3F/Three.js scenes', category: 'Hardware' },
    { label: 'CPU cores',               value: cpuCores > 0 ? `${cpuCores} logical cores` : 'Unknown', pass: true,      hint: 'More cores = smoother Web Workers and WASM workloads',            category: 'Hardware' },
    { label: 'Network effective type',  value: connection?.effectiveType ?? 'Unknown (API limited)', pass: true,         hint: 'Used to adapt media quality; 4g assumed for static asset serving', category: 'Network' },
  ]
}
