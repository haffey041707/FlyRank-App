import { useCallback, useRef, useState } from 'react'

// Whitespace, so it never changes what is read aloud -- see below.
const NUDGE = ' '

/**
 * Message state for a polite live region.
 *
 * `aria-live` only fires when the region's content *changes*. Announcing the
 * same string twice in a row -- adding two tasks with the same title, deleting
 * two identically named tasks -- would leave the second one silent. Alternating
 * an invisible trailing space guarantees a content change every time without
 * altering what a screen reader actually says.
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('')
  const count = useRef(0)

  const announce = useCallback((text) => {
    count.current += 1
    setMessage(count.current % 2 === 0 ? `${text}${NUDGE}` : text)
  }, [])

  return [message, announce]
}
