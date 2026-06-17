'use client'

import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

// GoogleOAuthProvider renders a <script> element inline, which triggers React 19's
// "script tag inside component" warning during SSR/hydration. Deferring it to
// after mount means the script only renders client-side, eliminating the warning.
export function GoogleAuthProvider({
  clientId,
  children,
}: {
  clientId: string
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <>{children}</>
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
}
