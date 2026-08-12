import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

beforeEach(() => {
  // Every test starts from a browser with no TaskFlow data. Without this, the
  // storage written by one test would be restored by the next one.
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})
