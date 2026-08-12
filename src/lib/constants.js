export const STORAGE_KEY = 'taskflow.tasks.v1'

/**
 * Priority definitions. Tailwind class strings are written out in full so the
 * v4 scanner can find them -- never build these class names by concatenation.
 *
 * Colours are chosen for contrast, not just hue. Badge text clears 4.5:1 on its
 * own tint, and the selected-pill styles avoid white-on-amber, which only
 * reaches about 3:1 and fails AA for normal text -- amber takes dark text.
 * Priority is never signalled by colour alone: every card also spells out the
 * level in its badge text.
 */
export const PRIORITIES = {
  low: {
    value: 'low',
    label: 'Low',
    rank: 1,
    badge:
      'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-700/60 dark:text-slate-200 dark:ring-slate-400/20',
    accent: 'bg-slate-300 dark:bg-slate-600',
    active: 'bg-slate-700 text-white shadow-sm dark:bg-slate-500 dark:text-white',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    rank: 2,
    badge:
      'bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/30',
    accent: 'bg-amber-400 dark:bg-amber-500',
    active: 'bg-amber-400 text-amber-950 shadow-sm dark:bg-amber-400 dark:text-amber-950',
  },
  high: {
    value: 'high',
    label: 'High',
    rank: 3,
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/25 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-400/30',
    accent: 'bg-rose-500',
    active: 'bg-rose-600 text-white shadow-sm dark:bg-rose-500 dark:text-white',
  },
}

/** Order used by the form's priority picker (low -> high reads naturally). */
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', activeClass: PRIORITIES.low.active },
  { value: 'medium', label: 'Medium', activeClass: PRIORITIES.medium.active },
  { value: 'high', label: 'High', activeClass: PRIORITIES.high.active },
]

export const PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'low', label: 'Low priority' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export const DEFAULT_FILTERS = {
  query: '',
  status: 'all',
  priority: 'all',
}
