import { PRIORITIES } from './constants'
import {
  cleanNotes,
  cleanTitle,
  isUsableDate,
  sanitizeDraft,
} from './validation'

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/** Today as YYYY-MM-DD in the user's own timezone (not UTC). */
export function todayISO() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/**
 * Build a task from form values. Kept here so the shape lives in one place.
 * The draft is sanitized on the way in, so a task object is always valid.
 */
export function createTask(draft) {
  return {
    id: createId(),
    ...sanitizeDraft(draft),
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
}

/**
 * Apply edited form values to an existing task. Sanitizes for the same reason
 * createTask does -- an edit must not be able to write worse data than an add.
 * A title that sanitizes to empty keeps the previous one rather than blanking it.
 */
export function applyDraft(task, draft) {
  const clean = sanitizeDraft(draft)
  return { ...task, ...clean, title: clean.title || task.title }
}

/** Keep a timestamp only if it actually parses as a date. */
function cleanTimestamp(value, fallback) {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value
  return fallback
}

/**
 * Coerce one stored record into a valid task, or return null to drop it.
 * localStorage is user-writable, so nothing coming out of it is trusted.
 */
function normalizeTask(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  // A task with no usable title has nothing to show, so it is dropped rather
  // than repaired -- every other field has a sensible default.
  const title = cleanTitle(raw.title)
  if (!title) return null

  // Strict true: a hand-edited `"completed": "false"` is a string, and Boolean()
  // would read it as done. Anything that is not exactly true stays open.
  const completed = raw.completed === true
  const createdAt = cleanTimestamp(raw.createdAt, new Date().toISOString())

  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id : createId(),
    title,
    notes: cleanNotes(raw.notes),
    priority: Object.hasOwn(PRIORITIES, raw.priority) ? raw.priority : 'medium',
    dueDate: isUsableDate(raw.dueDate) ? raw.dueDate : '',
    completed,
    createdAt,
    completedAt: completed ? cleanTimestamp(raw.completedAt, createdAt) : null,
  }
}

/**
 * Deserializer for the persisted array. Survives corrupt or hand-edited data.
 *
 * Returns the recovered tasks plus what had to be discarded, so the UI can tell
 * the user their data was touched instead of silently losing rows:
 *   `reset`   - storage held something that was not a list at all
 *   `dropped` - individual records that could not be repaired
 */
export function normalizeTasks(parsed) {
  if (!Array.isArray(parsed)) return { tasks: [], dropped: 0, reset: true }

  const seenIds = new Set()
  const tasks = []
  let dropped = 0

  for (const raw of parsed) {
    const task = normalizeTask(raw)
    if (!task) {
      dropped += 1
      continue
    }
    // Duplicate ids would collide as React keys and make two cards toggle
    // together. Reissue rather than drop -- the task itself is still good.
    if (seenIds.has(task.id)) task.id = createId()
    seenIds.add(task.id)
    tasks.push(task)
  }

  return { tasks, dropped, reset: false }
}

export function isOverdue(task) {
  return !task.completed && Boolean(task.dueDate) && task.dueDate < todayISO()
}

export function isDueToday(task) {
  return !task.completed && task.dueDate === todayISO()
}

function daysFromToday(dateISO) {
  const start = Date.parse(`${todayISO()}T00:00:00`)
  const target = Date.parse(`${dateISO}T00:00:00`)
  return Math.round((target - start) / 86_400_000)
}

/**
 * "Today" / "Tomorrow" / "Yesterday" / "Mar 15" / "Mar 15, 2027".
 * Returns null when there is no due date, which is how callers skip the chip.
 */
export function formatDueDate(dateISO) {
  if (!isUsableDate(dateISO)) return null

  const offset = daysFromToday(dateISO)
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  if (offset === -1) return 'Yesterday'

  const [year, month, day] = dateISO.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const sameYear = date.getFullYear() === new Date().getFullYear()

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function filterTasks(tasks, { query, status, priority }) {
  const needle = query.trim().toLowerCase()

  return tasks.filter((task) => {
    if (status === 'active' && task.completed) return false
    if (status === 'completed' && !task.completed) return false
    if (priority !== 'all' && task.priority !== priority) return false
    if (!needle) return true
    return (
      task.title.toLowerCase().includes(needle) ||
      task.notes.toLowerCase().includes(needle)
    )
  })
}

/**
 * Open tasks first, then highest priority, then soonest due date
 * (undated last), then newest. Returns a new array.
 */
export function sortTasks(tasks) {
  // Defensive lookup: normalizeTasks guarantees a known priority, but an
  // unknown one here would throw inside the comparator and blank the list.
  const rankOf = (task) => PRIORITIES[task.priority]?.rank ?? 0

  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1

    const byPriority = rankOf(b) - rankOf(a)
    if (byPriority !== 0) return byPriority

    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
    } else if (a.dueDate !== b.dueDate) {
      return a.dueDate ? -1 : 1
    }

    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function getStats(tasks) {
  const total = tasks.length
  const completed = tasks.reduce((count, task) => count + (task.completed ? 1 : 0), 0)

  return {
    total,
    completed,
    active: total - completed,
    overdue: tasks.filter(isOverdue).length,
    dueToday: tasks.filter(isDueToday).length,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}
