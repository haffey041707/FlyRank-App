import Button from './ui/Button'
import SegmentedControl from './ui/SegmentedControl'
import { Select } from './ui/Field'
import { CloseIcon, SearchIcon, TrashIcon } from './ui/Icons'
import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../lib/constants'

export default function FilterBar({
  filters,
  onChange,
  stats,
  resultCount,
  onClearCompleted,
}) {
  const setFilter = (key, value) => onChange({ ...filters, [key]: value })

  const counts = {
    all: stats.total,
    active: stats.active,
    completed: stats.completed,
  }
  const statusOptions = STATUS_FILTER_OPTIONS.map((option) => ({
    ...option,
    count: counts[option.value],
  }))

  return (
    <section
      aria-label="Search and filters"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
            placeholder="Search tasks by title or notes..."
            aria-label="Search tasks"
            className="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset transition duration-150 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => setFilter('query', '')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition duration-150 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          value={filters.priority}
          onChange={(event) => setFilter('priority', event.target.value)}
          aria-label="Filter by priority"
          className="lg:w-48"
        >
          {PRIORITY_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Filter by status"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => setFilter('status', value)}
          className="max-sm:w-full"
        />

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
            {resultCount} {resultCount === 1 ? 'task' : 'tasks'} shown
          </p>
          {stats.completed > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearCompleted}>
              <TrashIcon className="h-4 w-4" />
              Clear completed
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
