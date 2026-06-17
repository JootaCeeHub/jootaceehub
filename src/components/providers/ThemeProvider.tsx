'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

// Render NextThemesProvider on both server and client.
// The `mounted` guard was causing NextThemesProvider to render only after
// client mount, which injected its <script> tag as a React element during
// client rendering — React 19 warns about this because client-rendered
// <script> tags are hoisted to <head> and never executed inline.
// Without the guard, the provider renders on the server and its script runs
// synchronously before first paint. FOUC is prevented by suppressHydrationWarning
// on <html> (set in src/app/layout.tsx) which absorbs the theme class mismatch.
// ThemeProvider is a thin wrapper — no visual output, no Tailwind classes needed.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
