import path from 'node:path'
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import { withSentryConfig } from '@sentry/nextjs'

// Dynamic import at module level is not possible for conditional config wrappers;
// require() is the only CJS-compatible way here.
/* eslint-disable @typescript-eslint/no-require-imports */
const withAnalyzer =
  process.env.ANALYZE === 'true'
    ? (require('@next/bundle-analyzer') as (opts: { enabled: boolean }) => (c: NextConfig) => NextConfig)({ enabled: true })
    : (config: NextConfig) => config
/* eslint-enable @typescript-eslint/no-require-imports */

// Turbopack requires loader options to be JSON-serializable (no function
// references). Plugin functions (remarkGfm, rehypeHighlight) are not
// serializable and crash Turbopack at startup.
//
// Article content is loaded via gray-matter as raw strings and rendered with
// dangerouslySetInnerHTML — the MDX loader never processes article content.
// GFM + highlighting are applied in src/lib/journal/articles.ts instead.
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig: NextConfig = {
  output: 'export',
  // distDir is shared between dev and build. In dev mode Turbopack writes
  // its persistent cache here (dist/dev/cache/turbopack). If you see
  // "TurbopackInternalError" or SST corruption, run `npm run clean` and
  // restart `npm run dev`.
  distDir: 'dist',
  trailingSlash: true,
  poweredByHeader: false,

  // Compress HTML/JS/CSS output for smaller transfer sizes
  compress: true,

  // sharp is installed — static export can now optimize images at build time.
  images: {
    unoptimized: false,
    // Modern formats for better compression (used when next/image is used)
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  // Recognise .md and .mdx files as pages/modules alongside .ts/.tsx
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  turbopack: {
    root: path.join(__dirname),
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Automatic tree-shaking for named imports from these packages.
    // lucide-react: eliminates unused icon components from the bundle.
    // framer-motion: ensures only used motion components are included.
    // @react-three/drei: loads only the Drei helpers actually imported.
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@react-three/drei',
      '@sentry/nextjs',
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Isolate Three.js + R3F into a dedicated async chunk.
      // This prevents it from being bundled with framer-motion or other
      // async imports, reducing the per-chunk parse cost on low-end devices.
      config.optimization ??= {}
      config.optimization.splitChunks ??= {}
      const sc = config.optimization.splitChunks
      if (typeof sc === 'object' && sc !== false) {
        sc.cacheGroups ??= {}
        sc.cacheGroups.three = {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: 'three-vendor',
          chunks: 'async',
          priority: 30,
          reuseExistingChunk: true,
        }
      }
    }
    return config
  },
}

const sentryWebpackPluginOptions = {
  // Upload source maps to Sentry only when DSN is configured.
  // SENTRY_AUTH_TOKEN must be set in CI environment.
  silent: !process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // For static export, only upload client source maps
  widenClientFileUpload: true,
  // Disable server/edge instrumentation — not needed for static export
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
  // Don't add Sentry to server bundle (there is no server bundle)
  disableServerWebpackPlugin: true,
  // Hide source maps from the browser in production
  hideSourceMaps: true,
  // Disable telemetry
  telemetry: false,
}

export default withSentryConfig(
  withMDX(withAnalyzer(nextConfig)),
  sentryWebpackPluginOptions
)
