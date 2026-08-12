import { PRIORITIES } from './constants'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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
 */
export function createTask(draft) {
  return {
    id: createId(),
    title: draft.title,
    notes: draft.notes ?? '',
    priority: Object.hasOwn(PRIORITIES, draft.priority) ? draft.priority : 'medium',
    dueDate: DATE_PATTERN.test(draft.dueDate ?? '') ? draft.dueDate : '',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
}

/**
 * Coerce one stored record into a valid task, or return null to drop it.
 * localStorage is user-writable, so nothing coming out of it is trusted.
 */
function normalizeTask(raw) {
  if (!raw || typeof raw !== 'object') return null

  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  if (!title) return null

  const completed = Boolean(raw.completed)
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(),
    title,
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    priority: Object.hasOwn(PRIORITIES, raw.priority) ? raw.priority : 'medium',
    dueDate:
      typeof raw.dueDate === 'string' && DATE_PATTERN.test(raw.dueDate)
        ? raw.dueDate
        : '',
    completed,
    createdAt:
      typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    completedAt: completed && typeof raw.completedAt === 'string' ? raw.completedAt : null,
  }
}

/** Deserializer for the persisted array. Survives corrupt or hand-edited data. */
export function normalizeTasks(parsed) {
  if (!Array.isArray(parsed)) return []
  return parsed.map(normalizeTask).filter(Boolean)
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

/** "Today" / "Tomorrow" / "Yesterday" / "Mar 15" / "Mar 15, 2027". */
export function formatDueDate(dateISO) {
  if (!dateISO || !DATE_PATTERN.test(dateISO)) return null

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
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1

    const byPriority = PRIORITIES[b.priority].rank - PRIORITIES[a.priority].rank
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
