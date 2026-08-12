import { STORAGE_KEY } from '../lib/constants'

let counter = 0

/** A valid stored task, overridable per field. */
export function makeTask(overrides = {}) {
  counter += 1
  return {
    id: `task-${counter}`,
    title: `Task ${counter}`,
    notes: '',
    priority: 'medium',
    dueDate: '',
    completed: false,
    createdAt: new Date(2026, 0, counter).toISOString(),
    completedAt: null,
    ...overrides,
  }
}

/** Put tasks into localStorage the way the app would have left them. */
export function seedStorage(tasks) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

/** Write arbitrary text into the storage key, valid JSON or not. */
export function seedRawStorage(raw) {
  window.localStorage.setItem(STORAGE_KEY, raw)
}

export function readStorage() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === null ? null : JSON.parse(raw)
}
