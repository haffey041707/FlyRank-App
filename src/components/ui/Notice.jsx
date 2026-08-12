import { AlertIcon, CloseIcon } from './Icons'
import { cx } from '../../lib/cx'

const TONES = {
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  danger:
    'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
}

/** Inline banner for storage problems and data-recovery messages. */
export default function Notice({ tone = 'warning', title, children, onDismiss }) {
  return (
    <div
      role="status"
      className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', TONES[tone])}
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />

      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-0.5 opacity-90">{children}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 transition duration-150 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
