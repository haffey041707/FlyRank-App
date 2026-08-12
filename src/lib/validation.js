import { PRIORITIES } from './constants'

export const LIMITS = {
  title: 120,
  notes: 1000,
  minDate: '1970-01-01',
  maxDate: '2099-12-31',
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

// Control characters. The title strips all of them; notes keep tab (09) and
// newline (0A) so multi-line notes survive.
// no-control-regex is disabled deliberately: stripping these characters is
// the entire point of both patterns, and they are already written as escapes.
// eslint-disable-next-line no-control-regex
const CONTROL_ALL = /[\u0000-\u001F\u007F]/g
// eslint-disable-next-line no-control-regex
const CONTROL_KEEP_BREAKS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

// Zero-width characters and the BOM. String.prototype.trim() does not remove
// these, so a title of "\u200B" would look blank but pass as valid.
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF]/g

/** Collapse a title to a single clean line. Not length-capped -- see cleanTitle. */
function collapseTitle(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(INVISIBLE, '')
    .replace(CONTROL_ALL, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanTitle(value) {
  return collapseTitle(value).slice(0, LIMITS.title)
}

export function cleanNotes(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(CONTROL_KEEP_BREAKS, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, LIMITS.notes)
}

/**
 * True only for a real calendar date.
 *
 * The format regex alone is not enough: "2026-02-30" and "2026-13-01" both match
 * it, and Date would silently roll them forward to March 2 and January 2027.
 * Round-tripping through Date and comparing the parts back catches that.
 */
export function isRealDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function isDateInRange(value) {
  return value >= LIMITS.minDate && value <= LIMITS.maxDate
}

export function isUsableDate(value) {
  return isRealDate(value) && isDateInRange(value)
}

/**
 * Field-level errors for a form draft. Returns {} when the draft is submittable.
 * An empty due date is valid -- due dates are optional.
 */
export function validateDraft(draft) {
  const errors = {}

  const title = collapseTitle(draft?.title)
  if (!title) {
    errors.title = 'Give the task a title.'
  } else if (title.length > LIMITS.title) {
    errors.title = `Keep the title under ${LIMITS.title} characters (currently ${title.length}).`
  }

  const notes = typeof draft?.notes === 'string' ? draft.notes.trim() : ''
  if (notes.length > LIMITS.notes) {
    errors.notes = `Keep notes under ${LIMITS.notes} characters (currently ${notes.length}).`
  }

  if (!Object.hasOwn(PRIORITIES, draft?.priority)) {
    errors.priority = 'Pick a priority.'
  }

  const dueDate = draft?.dueDate ?? ''
  if (dueDate) {
    if (!isRealDate(dueDate)) {
      errors.dueDate = 'That is not a real calendar date.'
    } else if (!isDateInRange(dueDate)) {
      errors.dueDate = `Pick a date between ${LIMITS.minDate.slice(0, 4)} and ${LIMITS.maxDate.slice(0, 4)}.`
    }
  }

  return errors
}

/**
 * Coerce a draft into storable field values. Anything unusable becomes a safe
 * default rather than an error -- callers validate first when they can, but
 * every write goes through here so bad data can never reach state.
 */
export function sanitizeDraft(draft) {
  const dueDate = typeof draft?.dueDate === 'string' ? draft.dueDate : ''

  return {
    title: cleanTitle(draft?.title),
    notes: cleanNotes(draft?.notes),
    priority: Object.hasOwn(PRIORITIES, draft?.priority) ? draft.priority : 'medium',
    dueDate: isUsableDate(dueDate) ? dueDate : '',
  }
}
