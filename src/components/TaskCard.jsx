import Badge from './ui/Badge'
import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './ui/Icons'
import { cx } from '../lib/cx'
import { PRIORITIES } from '../lib/constants'
import { formatDueDate, isOverdue } from '../lib/taskUtils'

function IconAction({ label, onClick, children, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        'rounded-lg p-2 text-slate-400 transition duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
        danger
          ? 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
          : 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
      )}
    >
      {children}
    </button>
  )
}

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const priority = PRIORITIES[task.priority]
  const overdue = isOverdue(task)
  const dueLabel = formatDueDate(task.dueDate)

  return (
    <article
      className={cx(
        'animate-rise group relative overflow-hidden rounded-xl border bg-white shadow-sm',
        'transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900',
        overdue
          ? 'border-rose-200 dark:border-rose-500/30'
          : 'border-slate-200 dark:border-slate-800',
        task.completed && 'opacity-65',
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
          onClick={() => onToggle(task.id)}
          aria-label={
            task.completed ? `Mark "${task.title}" active` : `Mark "${task.title}" complete`
          }
          className={cx(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
            task.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-500 dark:border-slate-600 dark:hover:border-emerald-500',
          )}
        >
          <CheckIcon
            className={cx(
              'h-3.5 w-3.5 transition duration-150',
              task.completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )}
          />
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={cx(
              'font-medium break-words transition duration-150',
              task.completed
                ? 'text-slate-500 line-through dark:text-slate-500'
                : 'text-slate-900 dark:text-white',
            )}
          >
            {task.title}
          </h3>

          {task.notes && (
            <p className="mt-1 text-sm break-words whitespace-pre-line text-slate-600 dark:text-slate-400">
              {task.notes}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={priority.badge}>{priority.label}</Badge>

            {dueLabel && (
              <Badge
                className={
                  overdue
                    ? 'bg-rose-100 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25'
                    : 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40'
                }
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {overdue ? `Overdue - ${dueLabel}` : dueLabel}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <IconAction label="Edit task" onClick={() => onEdit(task)}>
            <PencilIcon className="h-4 w-4" />
          </IconAction>
          <IconAction label="Delete task" onClick={() => onDelete(task)} danger>
            <TrashIcon className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </article>
  )
}
