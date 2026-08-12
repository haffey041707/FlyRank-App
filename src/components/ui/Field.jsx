import { useId } from 'react'
import { cx } from '../../lib/cx'

const CONTROL =
  'block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-900 ' +
  'ring-1 ring-slate-300 ring-inset transition duration-150 placeholder:text-slate-500 ' +
  'focus:ring-2 focus:ring-brand-600 focus:outline-none ' +
  'dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:placeholder:text-slate-400 ' +
  'dark:focus:ring-brand-400'

const INVALID = 'ring-rose-500 focus:ring-rose-600 dark:ring-rose-400 dark:focus:ring-rose-400'
const LABEL = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

/**
 * Label + control + message, wired together with a generated id.
 *
 * The render prop hands back `describedBy` so the control can point
 * `aria-describedby` at whichever message is currently rendered -- screen
 * readers then announce the error or hint with the field, not adrift from it.
 *
 * Errors use role="alert" so they are announced the moment they appear, and
 * they replace the hint rather than stacking, keeping one message per field.
 */
export function Field({ label, error, hint, warning, counter, children }) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || warning || hint
  const showCounter = counter && counter.max - counter.value <= counter.max * 0.2

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
        {showCounter && (
          <span
            className={cx(
              'text-xs tabular-nums',
              counter.value > counter.max
                ? 'font-medium text-rose-700 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400',
            )}
          >
            {/* Announced as a whole phrase; the bare "108/120" is meaningless aloud. */}
            <span className="sr-only">
              {counter.value} of {counter.max} characters used
            </span>
            <span aria-hidden="true">
              {counter.value}/{counter.max}
            </span>
          </span>
        )}
      </div>

      {children({
        id,
        invalid: Boolean(error),
        describedBy: message ? messageId : undefined,
      })}

      {message && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cx(
            'text-sm',
            error
              ? 'text-rose-700 dark:text-rose-400'
              : warning
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400',
          )}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export function Input({ invalid, describedBy, className, ...props }) {
  return (
    <input
      className={cx(CONTROL, invalid && INVALID, className)}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      {...props}
    />
  )
}

export function Textarea({ invalid, describedBy, className, ...props }) {
  return (
    <textarea
      className={cx(CONTROL, 'resize-y', invalid && INVALID, className)}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cx(CONTROL, 'cursor-pointer pr-8', className)} {...props}>
      {children}
    </select>
  )
}
