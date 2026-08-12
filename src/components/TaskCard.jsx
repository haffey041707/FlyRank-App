import { memo, useId } from 'react'
import Badge from './ui/Badge'
import IconButton from './ui/IconButton'
import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './ui/Icons'
import { cx } from '../lib/cx'
import { PRIORITIES } from '../lib/constants'
import { formatDueDate, isOverdue } from '../lib/taskUtils'

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const titleId = useId()
  const priority = PRIORITIES[task.priority]
  const overdue = isOverdue(task)
  const dueLabel = formatDueDate(task.dueDate)

  return (
    // Labelled by its own title so screen readers announce which task this
    // region belongs to instead of "article, article, article".
    <article
      aria-labelledby={titleId}
      className={cx(
        'animate-rise group relative overflow-hidden rounded-xl border bg-white shadow-xs',
        'transition duration-200 hover:shadow-md dark:bg-slate-900',
        overdue
          ? 'border-rose-300 dark:border-rose-500/40'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
        task.completed && 'bg-slate-50/80 dark:bg-slate-900/60',
      )}
    >
      <span
        className={cx('absolute inset-y-0 left-0 w-1', priority.accent)}
        aria-hidden="true"
      />

      <div className="flex items-start gap-3 p-4 pl-5 sm:gap-4 sm:p-5 sm:pl-6">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          onClick={() => onToggle(task)}
          aria-label={
            task.completed ? `Mark "${task.title}" active` : `Mark "${task.title}" complete`
          }
          className={cx(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition duration-150',
            task.completed
              ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-slate-400 hover:border-emerald-600 dark:border-slate-500 dark:hover:border-emerald-400',
          )}
        >
          <CheckIcon
            aria-hidden="true"
            className={cx(
              'h-3.5 w-3.5 transition duration-150',
              task.completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )}
          />
        </button>

        <div className="min-w-0 flex-1">
          <h3
            id={titleId}
            className={cx(
              'font-medium break-words transition duration-150',
              task.completed
                ? 'text-slate-500 line-through dark:text-slate-400'
                : 'text-slate-900 dark:text-white',
            )}
          >
            {task.title}
            {/* Strike-through is a visual cue only; state needs saying out loud. */}
            {task.completed && <span className="sr-only"> (completed)</span>}
          </h3>

          {task.notes && (
            <p className="mt-1 text-sm break-words whitespace-pre-line text-slate-600 dark:text-slate-400">
              {task.notes}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={priority.badge}>
              <span className="sr-only">Priority: </span>
              {priority.label}
            </Badge>

            {dueLabel && (
              <Badge
                className={
                  overdue
                    ? 'bg-rose-50 text-rose-700 ring-rose-600/25 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30'
                    : 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40'
                }
              >
                <CalendarIcon aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="sr-only">{overdue ? 'Overdue, due ' : 'Due '}</span>
                {overdue ? `Overdue - ${dueLabel}` : dueLabel}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconButton label={`Edit "${task.title}"`} onClick={() => onEdit(task)}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
            label={`Delete "${task.title}"`}
            tone="danger"
            onClick={() => onDelete(task)}
          >
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </article>
  )
}

/**
 * Memoised because this is the only component that scales with the data: every
 * search keystroke re-renders App and the list, and without this each card
 * re-renders too. Its three handlers are kept stable in App so the comparison
 * can actually succeed.
 */
export default memo(TaskCard)
