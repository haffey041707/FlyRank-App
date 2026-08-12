import { cx } from '../../lib/cx'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 ' +
  'disabled:cursor-not-allowed'

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 ' +
    'disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none ' +
    'dark:disabled:bg-slate-800 dark:disabled:text-slate-500',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50 hover:text-slate-900 ' +
    'disabled:text-slate-400 ' +
    'dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700 dark:hover:text-white',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 ' +
    'disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  icon: 'h-9 w-9',
}

/**
 * Disabled buttons keep a solid grey fill rather than a faded primary. An
 * opacity wash on a coloured button drops it below contrast minimums and reads
 * as "loading" rather than "not available yet".
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  )
}
