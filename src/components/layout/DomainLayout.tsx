import type { ReactNode } from 'react'
import { Navigation } from './Navigation'
import { Footer } from './Footer'

interface DomainLayoutProps {
  children: ReactNode
}

export function DomainLayout({ children }: DomainLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute right-0 top-1/3 h-[320px] w-[320px] rounded-full bg-accent/3 blur-[80px]" />
      </div>

      <Navigation />

      <main className="pt-24">
        <div className="container mx-auto px-4 lg:px-6">{children}</div>
      </main>

      <Footer />
    </div>
  )
}
