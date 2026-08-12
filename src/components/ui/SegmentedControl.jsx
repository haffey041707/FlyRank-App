import { useRef } from 'react'
import { cx } from '../../lib/cx'

const ACTIVE_DEFAULT =
  'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-700 dark:text-white dark:ring-white/10'

/**
 * A radio group styled as a pill switcher. Used for both the status filter and
 * the priority picker -- options may carry their own `activeClass` to override
 * the selected-state colors.
 *
 * Follows the ARIA radiogroup keyboard pattern: the group is a single tab stop
 * (roving tabindex), and arrow keys move between options, selecting as they go.
 * Tabbing through every option instead would make a three-option filter cost
 * three tab presses to pass.
 */
export default function SegmentedControl({
  label,
  labelledBy,
  options,
  value,
  onChange,
  className,
}) {
  const containerRef = useRef(null)

  // A roving tabindex needs exactly one tab stop. If `value` matches nothing,
  // fall back to the first option so the group cannot become unreachable.
  const selectedIndex = options.findIndex((option) => option.value === value)
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex

  const focusOption = (index) => {
    const buttons = containerRef.current?.querySelectorAll('[role="radio"]')
    buttons?.[index]?.focus()
  }

  const handleKeyDown = (event) => {
    const currentIndex = options.findIndex((option) => option.value === value)
    const lastIndex = options.length - 1
    let nextIndex = null

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    onChange(options[nextIndex].value)
    focusOption(nextIndex)
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      // Prefer pointing at the visible label when there is one, so the name
      // announced always matches the name on screen.
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onKeyDown={handleKeyDown}
      className={cx(
        'inline-flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80',
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            // Roving tabindex: only one option is reachable by Tab.
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cx(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
              'transition duration-150',
              selected
                ? (option.activeClass ?? ACTIVE_DEFAULT)
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                  selected
                    ? 'bg-black/10 dark:bg-white/15'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
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
