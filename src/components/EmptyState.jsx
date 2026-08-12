import Button from './ui/Button'
import { ClipboardIcon, PlusIcon, SearchIcon } from './ui/Icons'

const VARIANTS = {
  'no-tasks': {
    icon: ClipboardIcon,
    title: 'No tasks yet',
    body: 'Add your first task and it will show up here. Everything is saved to this browser automatically.',
    action: { label: 'Add your first task', icon: PlusIcon },
  },
  'no-results': {
    icon: SearchIcon,
    title: 'Nothing matches those filters',
    body: 'Try a different search term, or widen the status and priority filters.',
    action: { label: 'Reset filters', icon: null },
  },
}

export default function EmptyState({ variant, onAction }) {
  const { icon: Icon, title, body, action } = VARIANTS[variant]
  const ActionIcon = action.icon

  return (
    <div className="animate-rise rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <span
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      >
        <Icon className="h-6 w-6" />
      </span>

      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        {body}
      </p>

      <Button
        variant={variant === 'no-tasks' ? 'primary' : 'secondary'}
        onClick={onAction}
        className="mt-6"
      >
        {ActionIcon && <ActionIcon aria-hidden="true" className="h-4 w-4" />}
        {action.label}
      </Button>
    </div>
  )
}
