/**
 * Compile-time i18n types derived directly from messages/en.json.
 *
 * DotPaths<T>  — all valid dot-separated paths within T (stops at arrays)
 * PathValue<T,P> — the TypeScript type located at path P inside T
 *
 * These power the fully-typed useTranslations() return value so every
 * t('key') call is checked against the real message tree at compile time.
 */

import type en from '../../../messages/en.json'

export type JsonMessages = typeof en

// Depth counter — prevents TS from recursing infinitely on large objects
type Prev = [never, 0, 1, 2, 3, 4]

/**
 * Produces a union of all valid dot-separated key paths within T.
 * Arrays are treated as leaf values (not traversed).
 *
 * e.g. DotPaths<{ a: { b: string }; c: string[] }> = 'a' | 'a.b' | 'c'
 */
export type DotPaths<T, D extends number = 4> =
  [D] extends [0]
    ? never
    : T extends readonly unknown[]
      ? never
      : T extends Record<string, unknown>
        ? {
            [K in keyof T & string]:
              T[K] extends readonly unknown[]
                ? K
                : T[K] extends Record<string, unknown>
                  ? K | `${K}.${DotPaths<T[K], Prev[D]>}`
                  : K
          }[keyof T & string]
        : never

/**
 * Produces a union of dot-separated paths that resolve to OBJECTS (not scalars).
 * Used to derive the set of valid namespaces for useTranslations().
 *
 * Includes both top-level keys ('hero', 'home') and nested object keys
 * ('home.systems', 'domainSystems.mcp', 'admin.config', etc.)
 */
type ObjectPaths<T, D extends number = 3> =
  [D] extends [0]
    ? never
    : T extends Record<string, unknown>
      ? {
          [K in keyof T & string]:
            T[K] extends readonly unknown[]
              ? never
              : T[K] extends Record<string, unknown>
                ? K | `${K}.${ObjectPaths<T[K], Prev[D]>}`
                : never
        }[keyof T & string]
      : never

/** Valid namespace argument for useTranslations — top-level OR nested object path */
export type Namespace = ObjectPaths<JsonMessages>

/**
 * Returns the TypeScript type at a dot-separated path P inside T.
 * Falls back to `string` when the path doesn't match (key-not-found returns key as string).
 *
 * e.g. PathValue<{ a: { b: number } }, 'a.b'> = number
 */
export type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : string
    : P extends keyof T
      ? T[P]
      : string

/**
 * Typed translation function for a given namespace.
 *
 * Two call signatures:
 *   1. Literal key → returns the exact type at that path (e.g. string, string[], object)
 *   2. Dynamic string → returns `unknown` (caller casts; runtime still resolves correctly)
 */
export interface TranslationFn<NS extends Namespace> {
  <K extends DotPaths<PathValue<JsonMessages, NS>> & string>(key: K): PathValue<PathValue<JsonMessages, NS>, K>
  (key: string): unknown
}
