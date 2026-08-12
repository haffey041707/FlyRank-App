import { cx } from '../../lib/cx'

const ACTIVE_DEFAULT = 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'

/**
 * A radio group styled as a pill switcher. Used for both the status filter and
 * the priority picker -- options may carry their own `activeClass` to override
 * the selected-state colors.
 */
export default function SegmentedControl({ label, options, value, onChange, className }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'inline-flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
              'transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              selected
                ? (option.activeClass ?? ACTIVE_DEFAULT)
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                  selected
                    ? 'bg-black/10 dark:bg-white/15'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
