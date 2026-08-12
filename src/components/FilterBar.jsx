import { useId } from 'react'
import Button from './ui/Button'
import IconButton from './ui/IconButton'
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
  const searchId = useId()
  const priorityId = useId()
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
    <search>
      <section
        aria-labelledby="filters-heading"
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 id="filters-heading" className="sr-only">
          Search and filter tasks
        </h2>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            {/* A real <label> rather than aria-label: it survives translation
                and gives the input a click target. */}
            <label htmlFor={searchId} className="sr-only">
              Search tasks by title or notes
            </label>
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />
            <input
              id={searchId}
              type="search"
              value={filters.query}
              onChange={(event) => setFilter('query', event.target.value)}
              placeholder="Search tasks by title or notes..."
              className="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-900 ring-1 ring-slate-300 ring-inset transition duration-150 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-brand-600 focus:outline-none dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:placeholder:text-slate-400 dark:focus:ring-brand-400 [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.query && (
              <IconButton
                label="Clear search"
                onClick={() => setFilter('query', '')}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 p-1.5"
              >
                <CloseIcon className="h-4 w-4" />
              </IconButton>
            )}
          </div>

          <div className="lg:w-48">
            <label htmlFor={priorityId} className="sr-only">
              Filter by priority
            </label>
            <Select
              id={priorityId}
              value={filters.priority}
              onChange={(event) => setFilter('priority', event.target.value)}
            >
              {PRIORITY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
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
            {/* Announced politely so filtering by keyboard reports its own
                result instead of leaving the user to guess. */}
            <p
              aria-live="polite"
              className="text-sm text-slate-600 tabular-nums dark:text-slate-400"
            >
              {resultCount} {resultCount === 1 ? 'task' : 'tasks'} shown
            </p>
            {stats.completed > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearCompleted}>
                <TrashIcon aria-hidden="true" className="h-4 w-4" />
                Clear completed
              </Button>
            )}
          </div>
        </div>
      </section>
    </search>
  )
}
