import { AlertIcon, CloseIcon } from './Icons'
import { cx } from '../../lib/cx'

const TONES = {
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100',
  danger:
    'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100',
}

/**
 * Inline banner for storage problems and data-recovery messages.
 *
 * `danger` uses role="alert" (assertive) because it means the user's work is
 * no longer being saved and they need to know now; `warning` uses role="status"
 * (polite) so a recovery summary waits for a pause in speech.
 */
export default function Notice({ tone = 'warning', title, children, onDismiss }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', TONES[tone])}
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />

      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-0.5">{children}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss: ${title}`}
          className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 transition duration-150 hover:bg-black/10 dark:hover:bg-white/15"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
