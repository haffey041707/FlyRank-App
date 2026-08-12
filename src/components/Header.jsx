import Button from './ui/Button'
import { PlusIcon, SparkIcon } from './ui/Icons'

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Header({ onCreate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <SparkIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl dark:text-white">
              TaskFlow
            </h1>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {todayLabel()}
            </p>
          </div>
        </div>

        <Button onClick={onCreate} className="shrink-0">
          <PlusIcon className="h-4 w-4" />
          <span className="max-sm:sr-only">New task</span>
        </Button>
      </div>
    </header>
  )
}
