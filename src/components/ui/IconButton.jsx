import { cx } from '../../lib/cx'

const TONES = {
  neutral:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
  danger:
    'text-slate-500 hover:bg-rose-50 hover:text-rose-700 ' +
    'dark:text-slate-400 dark:hover:bg-rose-500/15 dark:hover:text-rose-300',
}

/**
 * Icon-only button. `label` is required and becomes both the accessible name
 * and the tooltip -- an icon button with no label is invisible to a screen
 * reader, so the API makes it impossible to omit by accident.
 *
 * Resting colour is slate-500, not slate-400: icons are non-text content and
 * need 3:1 against their background, which slate-400 (2.8:1 on white) misses.
 */
export default function IconButton({ label, tone = 'neutral', className, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx('rounded-lg p-2 transition duration-150', TONES[tone], className)}
      {...props}
    >
      {children}
    </button>
  )
}
