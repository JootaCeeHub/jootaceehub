'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'

export function useMockData<T>(factory: () => T) {
  const [data, setData] = useState<T>(factory)
  const [source, setSource] = useState<'static' | 'fallback'>('static')

  useEffect(() => {
    setData(factory())
    setSource('static')
  }, [factory])

  return { data, source }
}
