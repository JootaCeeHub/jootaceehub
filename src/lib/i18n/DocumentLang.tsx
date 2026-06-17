'use client'

import { useEffect } from 'react'

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
  }, [locale])

  return null
}
