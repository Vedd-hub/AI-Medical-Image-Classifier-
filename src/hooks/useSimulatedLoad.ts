import { useEffect, useState } from 'react'

/** Simulates an API round-trip so skeleton loaders are exercised in the prototype. */
export function useSimulatedLoad(ms = 550): boolean {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])
  return loading
}
