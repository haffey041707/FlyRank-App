export const STORAGE_KEY = 'taskflow.tasks.v1'

/**
 * Priority definitions. Tailwind class strings are written out in full so the
 * v4 scanner can find them -- never build these class names by concatenation.
 */
export const PRIORITIES = {
  low: {
    value: 'low',
    label: 'Low',
    rank: 1,
    badge:
      'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-400/20',
    accent: 'bg-slate-300 dark:bg-slate-600',
    active:
      'bg-slate-600 text-white shadow-sm hover:bg-slate-600 dark:bg-slate-500 dark:text-white',
  },
  medium: {
    value: 'medium',
    label: 'Medium',
    rank: 2,
    badge:
      'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25',
    accent: 'bg-amber-400 dark:bg-amber-500',
    active:
      'bg-amber-500 text-white shadow-sm hover:bg-amber-500 dark:bg-amber-500 dark:text-white',
  },
  high: {
    value: 'high',
    label: 'High',
    rank: 3,
    badge:
      'bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25',
    accent: 'bg-rose-500',
    active:
      'bg-rose-600 text-white shadow-sm hover:bg-rose-600 dark:bg-rose-500 dark:text-white',
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
