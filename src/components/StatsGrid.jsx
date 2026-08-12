import StatCard from './StatCard'
import { AlertIcon, CheckCircleIcon, CircleIcon, ListIcon } from './ui/Icons'

export default function StatsGrid({ stats }) {
  return (
    <section aria-labelledby="stats-heading" className="space-y-4">
      {/* Hidden visually, but keeps the heading outline h1 -> h2 -> h3 intact
          so screen-reader users can navigate the page by headings. */}
      <h2 id="stats-heading" className="sr-only">
        Task statistics
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total tasks" value={stats.total} icon={ListIcon} tone="slate" />
        <StatCard label="Active" value={stats.active} icon={CircleIcon} tone="brand" />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircleIcon}
          tone="emerald"
        />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertIcon} tone="rose" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress
          </h3>
          <p className="text-sm text-slate-600 tabular-nums dark:text-slate-400">
            {stats.completed} of {stats.total} done
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {stats.completionRate}%
            </span>
          </p>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${stats.completionRate}% complete, ${stats.completed} of ${stats.total} tasks`}
          aria-labelledby="progress-label"
        >
          <div
            className="h-full rounded-full bg-emerald-600 transition-[width] duration-500 ease-out dark:bg-emerald-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <span id="progress-label" className="sr-only">
          Overall task completion
        </span>

        {stats.dueToday > 0 && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {stats.dueToday} {stats.dueToday === 1 ? 'task is' : 'tasks are'} due today.
          </p>
        )}
      </div>
    </section>
  )
}
