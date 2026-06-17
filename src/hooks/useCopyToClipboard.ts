'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetDelay = 2000): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setCopied(true)
        timerRef.current = setTimeout(() => setCopied(false), resetDelay)
      })
    },
    [resetDelay],
  )

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return [copied, copy]
}
