import { cx } from '../../lib/cx'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50'

const VARIANTS = {
  primary:
    'bg-sky-600 text-white shadow-sm hover:bg-sky-500 active:bg-sky-700 focus-visible:outline-sky-600',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50 focus-visible:outline-slate-400 ' +
    'dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700 focus-visible:outline-rose-600',
  ghost:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  icon: 'h-9 w-9',
}

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
