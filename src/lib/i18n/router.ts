'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from './context'

export function useLocaleRouter() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`)
    router.push(newPath)
  }

  return { switchLocale, currentLocale, pathname }
}
