'use client'

import React, { createContext, useContext, useCallback } from 'react'
import type {
  JsonMessages,
  Namespace,
  DotPaths,
  PathValue,
  TranslationFn,
} from './types'

interface I18nContextValue {
  locale: string
  // Keep loose at runtime — provider accepts en.json or es.json (same shape, different strings)
  messages: Record<string, unknown>
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string
  messages: Record<string, unknown>
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>
}

/**
 * Returns a fully-typed translation function scoped to `namespace`.
 *
 * All valid keys and their return types are derived directly from
 * messages/en.json at compile time — no `any` required.
 *
 * Supports both top-level namespaces ('hero', 'home') and nested object
 * paths ('home.systems', 'domainSystems.mcp', 'admin.config', etc.)
 *
 * @example
 *   const t = useTranslations('hero')
 *   t('headline')     // string
 *
 *   const t = useTranslations('home.systems')
 *   t('badge')        // string
 *   t('stat1Value')   // string
 */
export function useTranslations<NS extends Namespace>(namespace: NS): TranslationFn<NS>

/**
 * Dynamic-namespace overload — for when the namespace is a runtime string
 * (e.g. built from a variable). Returns unknown; callers assert the type.
 */
export function useTranslations(namespace: string): (key: string) => unknown

/**
 * No-namespace overload — accesses the root message tree.
 */
export function useTranslations(): (key: string) => unknown

export function useTranslations<NS extends Namespace>(namespace?: NS | string) {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslations must be used within I18nProvider')

  const { messages } = ctx
  // Cast to JsonMessages to enable typed path resolution.
  // Runtime messages (en/es) share the same structure as en.json.
  const typedMessages = messages as unknown as JsonMessages

  return useCallback(
    (key: string) => {
      const path = namespace ? `${namespace}.${key}` : key
      const parts = path.split('.')
      let current: unknown = typedMessages
      for (const part of parts) {
        if (
          current !== null &&
          current !== undefined &&
          typeof current === 'object' &&
          part in (current as Record<string, unknown>)
        ) {
          current = (current as Record<string, unknown>)[part]
        } else {
          return key
        }
      }
      return current !== undefined ? current : key
    },
    [typedMessages, namespace]
  ) as NS extends Namespace
    ? <K extends DotPaths<PathValue<JsonMessages, NS>> & string>(key: K) => PathValue<PathValue<JsonMessages, NS>, K>
    : (key: string) => unknown
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLocale must be used within I18nProvider')
  return ctx.locale
}
