import { useEffect, useState } from 'react'

/**
 * State that mirrors itself into localStorage.
 *
 * `deserialize` runs once on the parsed value at mount, so callers can validate
 * or migrate whatever is sitting in storage. It is deliberately NOT called when
 * the key is absent -- a first-ever visit is not corrupt data, and treating it
 * as such would show a recovery warning to every new user.
 *
 * Reads and writes are both guarded. Accessing `window.localStorage` throws
 * outright when cookies are blocked, and `setItem` throws on a full quota or in
 * Safari private mode. Neither should take the app down, but a failed write
 * means the user's work is not being saved -- so that is reported back through
 * `status.writeFailed` rather than swallowed.
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

  const [writeFailed, setWriteFailed] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      setWriteFailed(false)
    } catch {
      setWriteFailed(true)
    }
  }, [key, value])

  return [value, setValue, { writeFailed }]
}
