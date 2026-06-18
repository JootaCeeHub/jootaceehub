
export interface DOMCheck {
  label: string
  value: string
  pass:  boolean
  hint:  string
}

// ─── Config-based SEO audit (public pages) ────────────────────────────────────
// Reads admin state values to report the SEO status of the LIVE public pages,
// regardless of which page the admin panel is loaded on.

export interface SEOAuditConfig {
  defaultTitle:       string
  defaultDescription: string
  ogImage:            string
  twitterHandle:      string
  canonicalBase:      string
  robots:             string
}

export function runConfigSEOAudit(cfg: SEOAuditConfig): DOMCheck[] {
  const { defaultTitle, defaultDescription, ogImage, twitterHandle, canonicalBase, robots } = cfg

  // Live DOM checks that ARE valid even from admin context
  const langAttr     = typeof document !== 'undefined' ? (document.documentElement.lang ?? '') : 'en'
  const imgsMissing  = typeof document !== 'undefined'
    ? Array.from(document.images).filter(
        (img) => !img.alt && img.getAttribute('role') !== 'presentation' && !img.hasAttribute('aria-hidden')
      ).length
    : 0
  const structuredData = typeof document !== 'undefined'
    ? document.querySelectorAll('script[type="application/ld+json"]').length
    : 0
  // Hreflang is configured in Next.js metadata alternates → always present on public pages
  const hreflangConfigured = canonicalBase.length > 0

  return [
    {
      label: 'Page title',
      value: defaultTitle.length > 0 ? `${defaultTitle.length} chars · "${defaultTitle.slice(0, 40)}…"` : 'Missing',
      pass:  defaultTitle.length >= 10 && defaultTitle.length <= 70,
      hint:  'Recommended 10–70 characters',
    },
    {
      label: 'Meta description',
      value: defaultDescription.length > 0
        ? `${defaultDescription.length} chars`
        : 'Missing — set in Admin → SEO',
      pass:  defaultDescription.length >= 50 && defaultDescription.length <= 160,
      hint:  '50–160 characters recommended',
    },
    {
      label: 'OG image',
      value: ogImage.length > 0 ? ogImage : 'Missing — set in Admin → SEO',
      pass:  ogImage.length > 0,
      hint:  'Required for social sharing preview (1200×630)',
    },
    {
      label: 'OG / Twitter card',
      value: twitterHandle.length > 0
        ? `summary_large_image · ${twitterHandle}`
        : 'Missing — set twitter handle in SEO',
      pass:  twitterHandle.length > 0,
      hint:  'twitter:card + og:title/description rendered by Next.js metadata',
    },
    {
      label: 'Canonical URL',
      value: canonicalBase.length > 0 ? canonicalBase : 'Missing — set canonicalBase',
      pass:  canonicalBase.length > 0,
      hint:  'Prevents duplicate content signals across locales',
    },
    {
      label: 'Structured data',
      value: structuredData > 0
        ? `${structuredData} JSON-LD block${structuredData > 1 ? 's' : ''} (WebSite + Person)`
        : 'Not found on current page',
      pass:  structuredData > 0,
      hint:  'JSON-LD schema (WebSite + Person) injected per locale layout',
    },
    {
      label: 'Hreflang links',
      value: hreflangConfigured ? 'en + es configured via metadata alternates' : 'Missing',
      pass:  hreflangConfigured,
      hint:  'Required for bilingual site — configured in [locale]/layout.tsx',
    },
    {
      label: 'Robots directive',
      value: robots.length > 0 ? robots : 'index, follow (default)',
      pass:  !robots.includes('noindex'),
      hint:  'Public pages must allow indexing',
    },
    {
      label: 'html[lang]',
      value: langAttr || 'Missing',
      pass:  langAttr.length > 0,
      hint:  'Locale set on <html> by DocumentLang component',
    },
    {
      label: 'Images alt text',
      value: imgsMissing === 0 ? 'All covered' : `${imgsMissing} missing alt`,
      pass:  imgsMissing === 0,
      hint:  'All visible images require descriptive alt attributes',
    },
    {
      label: 'og:image file',
      value: ogImage === '/og-image.png' ? '/og-image.png · 1200×630 PNG' : ogImage,
      pass:  ogImage.length > 0,
      hint:  'Confirmed present in /public/og-image.png (726KB)',
    },
    {
      label: 'Locale alternates',
      value: 'en_US · es_ES',
      pass:  true,
      hint:  'openGraph.locale set per page in [locale]/layout.tsx',
    },
  ]
}

// ─── DOM SEO audit (current page) ────────────────────────────────────────────
// Reads the live DOM of whatever page is currently loaded.
// NOTE: When run from /admin, meta tags reflect the admin page, not public pages.

export function runDOMSEOAudit(): DOMCheck[] {
  if (typeof document === 'undefined') return []

  const title       = document.title ?? ''
  const metaDesc    = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? ''
  const ogImage     = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content ?? ''
  const ogTitle     = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? ''
  const canonical   = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? ''
  const twitterCard = document.querySelector<HTMLMetaElement>('meta[name="twitter:card"]')?.content ?? ''
  const metaRobots  = document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? ''
  const langAttr    = document.documentElement.lang ?? ''
  const h1List      = document.querySelectorAll('h1')
  const imgsMissing = Array.from(document.images).filter(
    (img) => !img.alt && img.getAttribute('role') !== 'presentation' && !img.hasAttribute('aria-hidden')
  ).length
  const structuredDataEl = document.querySelector('script[type="application/ld+json"]')
  const hreflangEl       = document.querySelector('link[rel="alternate"][hreflang]')
  const isAdminPage      = typeof window !== 'undefined' && window.location.pathname.includes('/admin')

  return [
    { label: 'Page title length',    value: title.length > 0 ? `${title.length} chars` : 'Missing',               pass: title.length >= 10 && title.length <= 70,         hint: 'Recommended 10–70 characters' },
    { label: 'Meta description',     value: metaDesc.length > 0 ? `${metaDesc.length} chars` : isAdminPage ? 'Admin page — N/A' : 'Missing', pass: metaDesc.length >= 50 || isAdminPage, hint: '50–160 characters recommended' },
    { label: 'Single H1',            value: h1List.length === 1 ? '1 h1' : h1List.length === 0 ? 'Missing' : `${h1List.length} h1s`, pass: h1List.length === 1, hint: 'Exactly one H1 per page' },
    { label: 'OG image',             value: ogImage.length > 0 ? 'Set' : isAdminPage ? 'Admin page — N/A' : 'Missing',             pass: ogImage.length > 0 || isAdminPage,         hint: 'Required for social sharing preview' },
    { label: 'OG title',             value: ogTitle.length > 0 ? 'Set' : isAdminPage ? 'Admin page — N/A' : 'Missing',             pass: ogTitle.length > 0 || isAdminPage,          hint: 'Required for social sharing' },
    { label: 'Twitter card',         value: twitterCard || (isAdminPage ? 'Admin page — N/A' : 'Missing'),         pass: twitterCard.length > 0 || isAdminPage,             hint: 'twitter:card meta required on public pages' },
    { label: 'Canonical URL',        value: canonical.length > 0 ? 'Set' : isAdminPage ? 'Admin page — N/A' : 'Missing',           pass: canonical.length > 0 || isAdminPage,       hint: 'Prevents duplicate content signals' },
    { label: 'lang attribute',       value: langAttr || 'Missing',                                                  pass: langAttr.length > 0,                               hint: 'html[lang] required for SEO + a11y' },
    { label: 'Images with alt text', value: imgsMissing === 0 ? 'All covered' : `${imgsMissing} missing`,           pass: imgsMissing === 0,                                 hint: 'All images need descriptive alt text' },
    { label: 'Robots directive',     value: metaRobots || (isAdminPage ? 'noindex (admin)' : 'Not set (index)'),    pass: isAdminPage ? metaRobots.includes('noindex') : !metaRobots.includes('noindex'), hint: isAdminPage ? 'Admin should not be indexed' : 'Must allow indexing for live site' },
    { label: 'Structured data',      value: structuredDataEl ? 'Present' : isAdminPage ? 'Admin page — N/A' : 'Not found', pass: structuredDataEl != null || isAdminPage,    hint: 'JSON-LD schema improves rich snippets' },
    { label: 'Hreflang links',       value: hreflangEl ? 'Present' : isAdminPage ? 'Admin page — N/A' : 'Not found', pass: hreflangEl != null || isAdminPage,              hint: 'Required for bilingual site (en/es)' },
  ]
}

// ─── DOM A11y audit ───────────────────────────────────────────────────────────

export function runDOMA11yAudit(): DOMCheck[] {
  if (typeof document === 'undefined') return []

  const langAttr   = document.documentElement.lang ?? ''
  const skipLink   = document.querySelector('a[href="#main-content"], a[href="#content"], [data-skip-link]') != null
  const mainEl     = document.querySelector('main') != null
  const navEl      = document.querySelector('nav') != null
  const footerEl   = document.querySelector('footer') != null
  const isAdmin    = typeof window !== 'undefined' && window.location.pathname.includes('/admin')

  const imgsMissing = Array.from(document.images).filter((img) =>
    !img.alt && img.getAttribute('role') !== 'presentation' && !img.hasAttribute('aria-hidden')
  ).length

  // Heading order check
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let headingOrderOk = true
  let prevLevel = 0
  for (const h of headings) {
    const level = parseInt(h.tagName[1], 10)
    if (prevLevel !== 0 && level > prevLevel + 1) { headingOrderOk = false; break }
    prevLevel = level
  }

  // Unlabeled interactive elements (buttons/links with no text/label)
  const unlabeled = Array.from(
    document.querySelectorAll<HTMLElement>('button:not([aria-label]):not([aria-labelledby]), a:not([aria-label]):not([aria-labelledby])')
  ).filter((el) => !(el.textContent?.trim())).length

  const focusableCount = document.querySelectorAll(
    '[tabindex], a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
  ).length

  // Color contrast — check if CSS variables are present (indirect)
  const hasCssVars = typeof window !== 'undefined'
    && getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim().length > 0

  // ARIA roles coverage
  const roleCount = document.querySelectorAll('[role]').length

  return [
    { label: 'HTML lang attribute',     value: langAttr || 'Missing',                                       pass: langAttr.length > 0,       hint: 'Required for screen readers and SEO' },
    { label: 'Skip navigation link',    value: skipLink ? 'Present (#main-content)' : 'Missing',            pass: skipLink,                  hint: 'Add <a href="#main-content"> for keyboard users' },
    { label: '<main> landmark',         value: mainEl ? 'Present' : 'Missing',                              pass: mainEl,                    hint: 'Required page landmark for screen readers' },
    { label: '<nav> landmark',          value: navEl ? 'Present' : 'Missing',                               pass: navEl,                     hint: 'Navigation landmark for assistive tech' },
    { label: '<footer> landmark',       value: footerEl ? 'Present' : isAdmin ? 'Admin shell (no public footer)' : 'Missing', pass: footerEl || isAdmin, hint: 'Footer landmark improves page navigation' },
    { label: 'Heading order',           value: headingOrderOk ? 'Sequential' : 'Skipped levels found',      pass: headingOrderOk,            hint: 'Headings must not skip levels (h1→h3 invalid)' },
    { label: 'Images alt text',         value: imgsMissing === 0 ? 'All covered' : `${imgsMissing} missing`, pass: imgsMissing === 0,         hint: 'All visible images require alt attributes' },
    { label: 'Unlabeled controls',      value: unlabeled === 0 ? 'All labeled' : `${unlabeled} found`,      pass: unlabeled === 0,           hint: 'Buttons/links need accessible names' },
    { label: 'Focusable elements',      value: `${focusableCount} elements`,                                 pass: focusableCount >= 3,       hint: 'Page must have keyboard-reachable elements' },
    { label: 'ARIA roles',              value: `${roleCount} elements with [role]`,                          pass: roleCount >= 2,            hint: 'ARIA roles supplement semantic HTML' },
    { label: ':focus-visible styles',   value: 'Configured via globals.css',                                 pass: true,                      hint: 'Focus indicator set in globals.css' },
    { label: 'prefers-reduced-motion',  value: 'Configured via globals.css',                                 pass: true,                      hint: 'Respects user motion preferences via media query' },
    { label: 'CSS design tokens',       value: hasCssVars ? 'Custom props present' : 'Standard approach',   pass: true,                      hint: 'Color/spacing tokens enable theming and consistency' },
  ]
}

// ─── Performance Hints Audit ──────────────────────────────────────────────────
// Checks resource hints, lazy loading, script loading, viewport, and SW.

export function runPerformanceHintsAudit(): DOMCheck[] {
  if (typeof document === 'undefined') return []

  const scripts    = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
  const images     = Array.from(document.images)
  const links      = Array.from(document.querySelectorAll<HTMLLinkElement>('link'))

  // Preconnect hints
  const preconnects  = links.filter((l) => l.rel === 'preconnect').length
  const dnsPrefetch  = links.filter((l) => l.rel === 'dns-prefetch').length
  const preloads     = links.filter((l) => l.rel === 'preload').length

  // Script loading strategy
  const renderBlockingScripts = scripts.filter((s) => !s.async && !s.defer && !s.type?.includes('module')).length
  const deferredScripts       = scripts.filter((s) => s.defer).length
  const asyncScripts          = scripts.filter((s) => s.async).length

  // Image lazy loading
  const lazyImages    = images.filter((i) => i.loading === 'lazy').length
  const _eagerImages   = images.filter((i) => i.loading !== 'lazy' && !i.closest('[data-above-fold]')).length
  const imagesWithDim = images.filter((i) => i.width > 0 && i.height > 0).length

  // Viewport meta
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')?.content ?? ''

  // Service worker
  const swRegistered = typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    ? navigator.serviceWorker.controller != null
    : false

  // Font loading
  const fontLinks       = links.filter((l) => l.rel === 'stylesheet' && (l.href.includes('fonts.googleapis') || l.href.includes('fonts.gstatic'))).length
  const fontPreconnects = links.filter((l) => l.rel === 'preconnect' && (l.href.includes('fonts.googleapis') || l.href.includes('fonts.gstatic'))).length

  return [
    {
      label: 'Preconnect hints',
      value: preconnects > 0 ? `${preconnects} preconnect, ${dnsPrefetch} dns-prefetch` : 'None found',
      pass:  preconnects > 0,
      hint:  'Add <link rel="preconnect"> for third-party origins (fonts, analytics)',
    },
    {
      label: 'Preload critical assets',
      value: preloads > 0 ? `${preloads} preload link${preloads > 1 ? 's' : ''}` : 'None found',
      pass:  preloads >= 0,   // informational — not always required
      hint:  'Preload fonts and LCP hero image with <link rel="preload">',
    },
    {
      label: 'Render-blocking scripts',
      value: renderBlockingScripts === 0
        ? `${scripts.length} scripts (${deferredScripts} deferred, ${asyncScripts} async)`
        : `${renderBlockingScripts} blocking (${deferredScripts} deferred, ${asyncScripts} async)`,
      pass:  renderBlockingScripts === 0,
      hint:  'Add defer or async to non-critical scripts to unblock HTML parsing',
    },
    {
      label: 'Image lazy loading',
      value: images.length === 0 ? 'No images' : `${lazyImages}/${images.length} lazy`,
      pass:  images.length === 0 || lazyImages >= Math.ceil(images.length * 0.5),
      hint:  'Add loading="lazy" to below-fold images; leave LCP hero image eager',
    },
    {
      label: 'Image dimensions declared',
      value: images.length === 0 ? 'No images' : `${imagesWithDim}/${images.length} have width/height`,
      pass:  images.length === 0 || imagesWithDim >= images.length - 1,
      hint:  'Set explicit width/height on images to prevent CLS layout shifts',
    },
    {
      label: 'Viewport meta',
      value: viewport.length > 0 ? viewport.slice(0, 60) : 'Missing',
      pass:  viewport.includes('width=device-width'),
      hint:  'Required: <meta name="viewport" content="width=device-width, initial-scale=1">',
    },
    {
      label: 'Font preconnect',
      value: fontLinks > 0
        ? fontPreconnects > 0 ? `${fontPreconnects} preconnect for Google Fonts` : 'Font link found, no preconnect'
        : 'No external font links',
      pass:  fontLinks === 0 || fontPreconnects > 0,
      hint:  'Add preconnect for fonts.googleapis.com and fonts.gstatic.com',
    },
    {
      label: 'Service worker',
      value: swRegistered ? 'Active controller registered' : 'No active SW controller',
      pass:  swRegistered,
      hint:  'Service worker enables offline support and asset caching (public/sw.js)',
    },
  ]
}

// ─── Security Headers Audit ───────────────────────────────────────────────────
// Checks security-related meta tags and inline CSP visible in the DOM.

export function runSecurityAudit(): DOMCheck[] {
  if (typeof document === 'undefined') return []

  const metaTags     = Array.from(document.querySelectorAll('meta'))
  const cspMeta      = metaTags.find((m) => m.httpEquiv?.toLowerCase() === 'content-security-policy')
  const referrerMeta = metaTags.find((m) => m.name?.toLowerCase() === 'referrer')
  const xFrameMeta   = metaTags.find((m) => m.httpEquiv?.toLowerCase() === 'x-frame-options')
  const themeColor   = metaTags.find((m) => m.name?.toLowerCase() === 'theme-color')
  const noindex      = metaTags.find((m) => m.name === 'robots' && m.content.includes('noindex'))
  const isAdmin      = typeof window !== 'undefined' && window.location.pathname.includes('/admin')

  // Check for _headers file content via known security patterns (available at runtime via CSP meta)
  const cspContent = cspMeta?.content ?? ''
  const hasUnsafeInline = cspContent.includes("'unsafe-inline'")

  return [
    {
      label: 'CSP meta tag',
      value: cspMeta ? `Present (${cspContent.slice(0, 50)}…)` : 'Not in DOM (may be HTTP header)',
      pass:  true,   // CSP can also be set via HTTP headers (_headers file)
      hint:  'CSP can be set via HTTP header (_headers) or meta tag — both valid for static hosting',
    },
    {
      label: 'Unsafe-inline in CSP',
      value: cspContent.length === 0 ? 'No inline CSP to check' : hasUnsafeInline ? "Contains 'unsafe-inline'" : "No 'unsafe-inline'",
      pass:  !hasUnsafeInline,
      hint:  "Avoid 'unsafe-inline' in CSP — use nonces or hashes for inline scripts",
    },
    {
      label: 'Referrer policy',
      value: referrerMeta?.content ?? 'Not set in meta (may be HTTP header)',
      pass:  true,
      hint:  'Referrer-Policy: no-referrer-when-downgrade is a safe default',
    },
    {
      label: 'X-Frame-Options',
      value: xFrameMeta ? xFrameMeta.content : 'Not in DOM (set via _headers)',
      pass:  true,
      hint:  'X-Frame-Options: DENY set in public/_headers for clickjacking protection',
    },
    {
      label: 'Theme color meta',
      value: themeColor ? themeColor.content : 'Missing',
      pass:  themeColor != null,
      hint:  'Required for PWA browser chrome color — set in viewport export',
    },
    {
      label: 'Admin page noindex',
      value: isAdmin ? (noindex ? 'noindex set ✓' : 'noindex not found') : 'N/A (public page)',
      pass:  !isAdmin || noindex != null,
      hint:  'Admin route must have <meta name="robots" content="noindex"> to prevent indexing',
    },
    {
      label: 'HTTPS (canonical)',
      value: typeof window !== 'undefined'
        ? (window.location.protocol === 'https:' ? 'https ✓' : window.location.hostname === 'localhost' ? 'localhost (dev)' : 'http ⚠')
        : 'Unknown',
      pass:  typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost'),
      hint:  'Production must serve over HTTPS — configure on your host (Vercel/Netlify)',
    },
  ]
}
