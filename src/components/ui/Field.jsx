import { useId } from 'react'
import { cx } from '../../lib/cx'

const CONTROL =
  'block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-900 ' +
  'ring-1 ring-slate-300 ring-inset transition duration-150 placeholder:text-slate-400 ' +
  'focus:ring-2 focus:ring-sky-500 focus:outline-none ' +
  'dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500'

const LABEL = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

/** Label + control + optional error message, wired together with a generated id. */
export function Field({ label, error, hint, children }) {
  const id = useId()

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children({ id, invalid: Boolean(error) })}
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ invalid, className, ...props }) {
  return (
    <input
      className={cx(CONTROL, invalid && 'ring-rose-400 focus:ring-rose-500', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}

export function Textarea({ invalid, className, ...props }) {
  return (
    <textarea
      className={cx(CONTROL, 'resize-y', invalid && 'ring-rose-400 focus:ring-rose-500', className)}
      aria-invalid={invalid || undefined}
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
