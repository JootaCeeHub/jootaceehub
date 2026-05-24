'use client'

import React, { createContext, useContext, useCallback } from 'react'

type Messages = Record<string, unknown>
type Locale = string

interface I18nContextValue {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>
}

export function useTranslations(namespace?: string) {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslations must be used within I18nProvider')

  const { messages } = ctx

  const t = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: string): any => {
      const path = namespace ? `${namespace}.${key}` : key
      const parts = path.split('.')
      let current: unknown = messages
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[part]
        } else {
          return key
        }
      }
      return current !== undefined ? current : key
    },
    [messages, namespace]
  )

  return t
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLocale must be used within I18nProvider')
  return ctx.locale
}
