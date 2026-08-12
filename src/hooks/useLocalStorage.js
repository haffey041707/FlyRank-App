import { useEffect, useState } from 'react'

/**
 * State that mirrors itself into localStorage.
 *
 * `deserialize` runs once on the parsed value at mount, so callers can validate
 * or migrate whatever is sitting in storage. Reads and writes are both guarded:
 * Safari private mode and a full quota throw on setItem, and that should never
 * take the app down.
 */
export function useLocalStorage(key, initialValue, { deserialize } = {}) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialValue
      const parsed = JSON.parse(raw)
      return deserialize ? deserialize(parsed) : parsed
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable or full -- keep running with in-memory state.
    }
  }, [key, value])

  return [value, setValue]
}
